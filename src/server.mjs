import { createServer } from "node:http";
import { join } from "node:path";
import { openService } from "./service.mjs";
import { PairingManager } from "./web-auth.mjs";
import { createAtlas } from "./atlas.mjs";

export function parseServerConfig(env = process.env) {
  const bind_host = env.NOESIS_BIND_HOST ?? "0.0.0.0";
  const port = Number(env.NOESIS_PORT ?? 7337);
  const data_directory = env.NOESIS_DATA_DIR ?? join(process.cwd(), ".noesis");
  const advertised_host = env.NOESIS_ADVERTISED_HOST || null;
  if (!bind_host || /\s/.test(bind_host)) throw new Error("invalid NOESIS_BIND_HOST");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("invalid NOESIS_PORT");
  if (advertised_host && (/\s/.test(advertised_host) || ["0.0.0.0", "::", "*"].includes(advertised_host))) throw new Error("invalid NOESIS_ADVERTISED_HOST");
  return { bind_host, port, data_directory, advertised_host };
}
const OBSERVATORY_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NOESIS Observatory</title>
<style>
:root{color-scheme:light dark;font:16px system-ui,sans-serif;line-height:1.45;--surface:#fff;--ink:#17202a;--accent:#2457d6}
body{max-width:960px;margin:0 auto;padding:1rem;background:var(--surface);color:var(--ink)}
main{display:grid;gap:1rem}section{border:1px solid #9aa5b1;border-radius:.5rem;padding:1rem}
input,button,textarea{font:inherit;padding:.5rem;margin:.25rem 0}button{background:var(--accent);color:#fff;border:0;border-radius:.3rem}
:focus-visible{outline:3px solid #f0a500;outline-offset:2px}
ul{padding-left:1.25rem}.muted{color:#5b6773}
</style>
</head>
<body>
<header><h1>NOESIS Observatory</h1><p class="muted">Local-first evidence, recall, and durable work.</p><nav aria-label="Primary"><a href="#atlas">Atlas</a> · <a href="#reverie">Reverie</a> · <a href="#forge">Forge</a></nav></header>
<main>
<section aria-labelledby="pair-title"><h2 id="pair-title">Pair this browser</h2><p>Enter the short-lived code printed by the local operator.</p><form id="pair-form"><label for="pair-code">Pairing code</label><input id="pair-code" name="code" inputmode="numeric" autocomplete="one-time-code" required pattern="[0-9]{8}"><button>Pair</button></form><p id="pair-status" role="status"></p></section>
<section aria-labelledby="note-title"><h2 id="note-title">Capture an observation</h2><form id="note-form"><label for="note-content">Observation</label><textarea id="note-content" required></textarea><button>Save note</button></form><p id="note-status" role="status"></p></section>
<section aria-labelledby="recall-title"><h2 id="recall-title">Recall</h2><form id="recall-form"><label for="recall-query">Query</label><input id="recall-query"><button>Recall</button></form><ul id="recall-results"></ul></section>
<section id="reverie" aria-labelledby="dream-title"><h2 id="dream-title">Reverie</h2><button id="dream-button">Start Snooze</button><p id="dream-status" role="status"></p></section>
<section id="atlas" aria-labelledby="atlas-title"><h2 id="atlas-title">Atlas</h2><button id="atlas-button">Load resources</button><ul id="atlas-results"></ul></section>
<section id="forge" aria-labelledby="forge-title"><h2 id="forge-title">Forge</h2><p>Choose a resource in Atlas to inspect attributable findings and export a Blueprint.</p></section>
</main>
<script>
const status=(id,text)=>{document.getElementById(id).textContent=text};
async function api(path,options={}){const response=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||response.statusText);return body}
document.getElementById('pair-form').addEventListener('submit',async event=>{event.preventDefault();try{await api('/pair',{method:'POST',body:JSON.stringify({code:event.target.code.value})});status('pair-status','Paired. Private data is available.')}catch(error){status('pair-status',error.message)}});
document.getElementById('note-form').addEventListener('submit',async event=>{event.preventDefault();try{await api('/api/note',{method:'POST',body:JSON.stringify({content:event.target.content.value})});event.target.reset();status('note-status','Saved.')}catch(error){status('note-status',error.message)}});
document.getElementById('recall-form').addEventListener('submit',async event=>{event.preventDefault();try{const body=await api('/api/recall?query='+encodeURIComponent(event.target.query.value));const list=document.getElementById('recall-results');list.replaceChildren(...(body.data||[]).map(hit=>{const item=document.createElement('li');item.textContent=hit.statement+' ['+hit.record_id+'@'+hit.revision+']';return item}))}catch(error){status('pair-status',error.message)}});
document.getElementById('dream-button').addEventListener('click',async()=>{try{const body=await api('/api/dream',{method:'POST',body:'{}'});status('dream-status','Snooze '+body.job_id+' queued.')}catch(error){status('dream-status',error.message)}});
document.getElementById('atlas-button').addEventListener('click',async()=>{try{const body=await api('/api/resources');const list=document.getElementById('atlas-results');list.replaceChildren(...(body.data||[]).map(resource=>{const item=document.createElement('li');item.textContent=resource.display_name+' ['+resource.kind+']';return item}))}catch(error){status('pair-status',error.message)}});
</script>
</body>
</html>`;

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", ...headers });
  response.end(JSON.stringify(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let data = "";
    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 256_000) request.destroy(new Error("request too large"));
    });
    request.on("end", () => {
      try { resolve(data ? JSON.parse(data) : {}); } catch { reject(new Error("invalid JSON")); }
    });
    request.on("error", reject);
  });
}

export function createRequestHandler({ service, pairing, atlas = createAtlas(service.store) }) {
  const principal = { owner_id: "local", scope_ids: [] };
  return (request, response) => {
    void (async () => {
      const url = new URL(request.url, `http://${request.headers.host ?? "localhost"}`);
      if (url.pathname === "/healthz") return sendJson(response, 200, { status: "ready" });
      if (url.pathname === "/" && request.method === "GET") {
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
        return response.end(OBSERVATORY_HTML);
      }
      if (url.pathname === "/pair" && request.method === "GET") return sendJson(response, 200, { status: "pairing_required" });
      if (url.pathname === "/pair" && request.method === "POST") {
        const body = await readBody(request);
        const result = pairing.redeem(body.code, request.headers.origin, request.headers.host);
        if (!result.ok) return sendJson(response, 403, { error: result.reason });
        return sendJson(response, 200, { paired: true }, { "set-cookie": `noesis_session=${result.session_id}; HttpOnly; SameSite=Lax; Path=/` });
      }
      if (!pairing.isAuthenticated(request)) return sendJson(response, 401, { error: "pairing required" });
      if (request.method === "POST" && !pairing.originAllowed(request.headers.origin, request.headers.host)) return sendJson(response, 403, { error: "origin rejected" });
      if (url.pathname === "/api/capabilities" && request.method === "GET") return sendJson(response, 200, service.mindCapabilities());
      if (url.pathname === "/api/resources" && request.method === "GET") return sendJson(response, 200, { data: atlas.list({ principal }) });
      if (url.pathname.startsWith("/api/resources/") && request.method === "GET") return sendJson(response, 200, atlas.inspect({ principal, resource_id: decodeURIComponent(url.pathname.slice("/api/resources/".length)) }));
      if (url.pathname.startsWith("/api/trace/") && request.method === "GET") return sendJson(response, 200, atlas.trace({ principal, id: decodeURIComponent(url.pathname.slice("/api/trace/".length)) }));
      if (url.pathname === "/api/recall" && request.method === "GET") return sendJson(response, 200, service.mindRecall({ principal, query: url.searchParams.get("query") ?? "", max_items: 8, max_chars: 12000 }));
      if (url.pathname.startsWith("/api/inspect/") && request.method === "GET") {
        const record_id = decodeURIComponent(url.pathname.slice("/api/inspect/".length));
        return sendJson(response, 200, service.mindInspect({ principal, record_id }));
      }
      if (url.pathname === "/api/note" && request.method === "POST") {
        const body = await readBody(request);
        return sendJson(response, 200, service.mindNote({ principal, scope: { scope_id: "local", owner_id: "local", kind: "project", project_id: "local", session_id: null, task_id: null }, content: body.content, producer_id: "dashboard", idempotency_key: body.idempotency_key ?? `dashboard:${Date.now()}` }));
      }
      if (url.pathname === "/api/dream" && request.method === "POST") return sendJson(response, 202, service.mindDream({ principal, scope_ids: ["local"], producer_id: "dashboard", idempotency_key: `dashboard-dream:${Date.now()}` }));
      if (url.pathname.startsWith("/api/dream/") && request.method === "GET") {
        const job_id = decodeURIComponent(url.pathname.slice("/api/dream/".length));
        return sendJson(response, 200, service.mindDreamStatus({ principal, job_id }));
      }
      return sendJson(response, 404, { error: "not found" });
    })().catch((error) => sendJson(response, error.code === "NOT_FOUND_OR_FORBIDDEN" ? 404 : 400, { error: error.message }));
  };
}


export function startServer({ config = parseServerConfig(), service = openService(join(config.data_directory, "mind.sqlite")), requestHandler = null } = {}) {
  const server = createServer(requestHandler ?? (() => {}));
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };
    const onListening = () => {
      server.off("error", onError);
      resolve({ server, service, address: server.address() });
    };
    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(config.port, config.bind_host);
  });
}
export async function createObservatory({ config = parseServerConfig(), service = openService(join(config.data_directory, "mind.sqlite")) } = {}) {
  const pairing = new PairingManager({ origin: null });
  const pairing_code = pairing.issue();
  const started = await startServer({ config, service, requestHandler: createRequestHandler({ service, pairing }) });
  return { ...started, pairing, pairing_code };
}
