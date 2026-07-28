/**
 * Dev-only Astro integration behind the inline text editor.
 *
 * It adds one route to the Vite dev server, POST /__copy-edit, which writes a
 * batch of strings back into src/content/copy.json. The hook it registers,
 * astro:server:setup, only ever runs under `astro dev`, so nothing here reaches
 * a build or a deployed site.
 *
 * Body: { "edits": [{ "path": "faq.items.2.a", "value": "..." }, ...] }
 *
 * The whole batch lands in one write. Vite reloads the page the moment the file
 * changes, so a second write racing the first would lose its response — and its
 * edit — halfway through the reload.
 *
 * The endpoint refuses to create keys. A request may only overwrite a path that
 * already resolves to a string in the file, which keeps a typo in the browser
 * from growing the content file a junk key at a time. Nothing is written unless
 * every edit in the batch validates.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const COPY_FILE = fileURLToPath(new URL('../content/copy.json', import.meta.url));

/** Dot path of plain keys and array indexes: "faq.items.2.a". */
const PATH_PATTERN = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/;

/** Long enough for the longest FAQ answer, short enough to bound a bad request. */
const MAX_VALUE_LENGTH = 5000;
const MAX_BODY_BYTES = 64 * 1024;

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res, status, payload) {
  const body = JSON.stringify(payload);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}

/** Walks to the object holding the last segment, or null if the path misses. */
function resolveParent(data, segments) {
  let node = data;
  for (const segment of segments.slice(0, -1)) {
    if (node === null || typeof node !== 'object') return null;
    node = Array.isArray(node) ? node[Number(segment)] : node[segment];
  }
  return node !== null && typeof node === 'object' ? node : null;
}

export default function copyEditor() {
  return {
    name: 'copy-editor',
    hooks: {
      'astro:server:setup': ({ server, logger }) => {
        server.middlewares.use('/__copy-edit', async (req, res) => {
          if (req.method !== 'POST') {
            send(res, 405, { error: 'Use POST' });
            return;
          }

          try {
            const { edits } = JSON.parse(await readBody(req));

            if (!Array.isArray(edits) || edits.length === 0) {
              send(res, 400, { error: 'Send { edits: [{ path, value }] }' });
              return;
            }

            const data = JSON.parse(readFileSync(COPY_FILE, 'utf8'));
            const applied = [];

            for (const { path, value } of edits) {
              if (typeof path !== 'string' || !PATH_PATTERN.test(path)) {
                send(res, 400, { error: `Bad path: ${String(path)}` });
                return;
              }
              if (typeof value !== 'string' || value.length > MAX_VALUE_LENGTH) {
                send(res, 400, {
                  error: `Value for "${path}" must be a string under ${MAX_VALUE_LENGTH} characters`,
                });
                return;
              }

              const segments = path.split('.');
              const parent = resolveParent(data, segments);
              const key = Array.isArray(parent) ? Number(segments.at(-1)) : segments.at(-1);

              if (!parent || typeof parent[key] !== 'string') {
                send(res, 404, { error: `No editable string at "${path}"` });
                return;
              }

              parent[key] = value;
              applied.push(path);
            }

            writeFileSync(COPY_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
            logger.info(`copy.json ← ${applied.join(', ')}`);
            send(res, 200, { ok: true, applied });
          } catch (error) {
            logger.error(`copy edit failed: ${error.message}`);
            send(res, 500, { error: error.message });
          }
        });
      },
    },
  };
}
