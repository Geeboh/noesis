import { createServer } from "node:http";
import { basename, join } from "node:path";
import { openService } from "./service.mjs";
import { PairingManager } from "./web-auth.mjs";
import { createAtlas } from "./atlas.mjs";
import { createAdaptation } from "./adaptation.mjs";
import { buildLorePage, diffLorePages, editManualSection, invalidateLorePage, refreshLorePage } from "./lore.mjs";
import { buildForgeView, exportBlueprint, exportTaskManifest } from "./forge.mjs";
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
<section id="reverie" aria-labelledby="dream-title"><h2 id="dream-title">Reverie</h2><p>Bounded jobs preserve scope, focus, budget, outputs, and interruptions.</p><form id="dream-form"><label for="dream-level">Level</label><select id="dream-level" name="level"><option value="snooze">Snooze</option><option value="nap">Nap</option><option value="dream">Dream</option><option value="deep_sleep">Deep Sleep</option></select><fieldset><legend>Modes</legend><label><input type="checkbox" name="dream-mode" value="consolidate" checked>Consolidate</label><label><input type="checkbox" name="dream-mode" value="associate">Associate</label><label><input type="checkbox" name="dream-mode" value="imagine">Imagine</label><label><input type="checkbox" name="dream-mode" value="rehearse">Rehearse</label><label><input type="checkbox" name="dream-mode" value="reframe">Reframe</label></fieldset><label for="dream-focus">Focus</label><input id="dream-focus" name="focus"><button>Queue dream</button></form><button id="dream-run-button" type="button" disabled>Run bounded work</button><button id="dream-cancel-button" type="button" disabled>Cancel job</button><p id="dream-status" role="status"></p><ul id="dream-output"></ul></section>
<section id="atlas" aria-labelledby="atlas-title"><h2 id="atlas-title">Atlas</h2><p>Browse real resources, snapshots, independent evidence states, and history.</p><button id="atlas-button">Load resources</button><ul id="atlas-results"></ul><div id="atlas-detail" aria-live="polite"></div></section>
<section id="attunement" aria-labelledby="attunement-title"><h2 id="attunement-title">Attunement</h2><p>Explicit corrections override inferred preferences. Silence does not confirm a preference.</p><form id="preference-form"><label for="preference-origin">Origin</label><select id="preference-origin" name="origin"><option value="explicit">Stated preference</option><option value="inferred">Inferred candidate</option></select><label for="preference-statement">Preference</label><input id="preference-statement" name="statement" required><button>Create preference</button></form><button id="preferences-button" type="button">Load preferences</button><ul id="preference-results"></ul><p id="preference-status" role="status"></p></section>
<section id="ebb" aria-labelledby="ebb-title"><h2 id="ebb-title">Ebb</h2><p>Activation fades separately from truth, validity, and retention. Revival is reversible.</p><form id="ebb-form"><label for="ebb-record-id">Record ID</label><input id="ebb-record-id" name="record_id" required><button>Evaluate activation</button><button id="revive-button" type="button">Revive</button></form><form id="forget-form"><label for="forget-record-id">Forget record ID</label><input id="forget-record-id" name="target_id" required><label for="forget-reason">Reason</label><input id="forget-reason" name="reason" required><button>Record explicit forgetting</button></form><p id="ebb-status" role="status"></p></section>
<section id="forge" aria-labelledby="forge-title"><h2 id="forge-title">Forge</h2><p>Filter one resource and version. Observations, lessons, hypotheses, evidence, and omissions stay separate.</p><form id="forge-form"><label for="forge-resource-id">Resource ID</label><input id="forge-resource-id" name="resource_id" required><label for="forge-privacy">Privacy</label><select id="forge-privacy" name="privacy"><option value="standard">Standard</option><option value="redacted">Redacted</option></select><label for="forge-since">Delta cutoff</label><input id="forge-since" name="since" placeholder="ISO timestamp"><button>Load Forge</button></form><button id="forge-blueprint-button" type="button">Export Blueprint</button><button id="forge-dream-button" type="button">Dream about resource</button><pre id="forge-results"></pre><p id="forge-status" role="status"></p></section>
<section id="lore" aria-labelledby="lore-title"><h2 id="lore-title">Lore</h2><p>Read sourced generated sections, edit authored sections, inspect diffs, and refresh invalidated content.</p><form id="lore-load-form"><label for="lore-resource-id">Resource ID</label><input id="lore-resource-id" name="resource_id" required><button>Load Lore</button></form><form id="lore-manual-form"><label for="lore-section-id">Manual section ID</label><input id="lore-section-id" name="section_id" value="manual-note" required><label for="lore-content">Manual content</label><textarea id="lore-content" name="content" required></textarea><input id="lore-revision" name="expected_revision" type="hidden"><button>Save manual section</button></form><button id="lore-refresh-button" type="button">Refresh generated sections</button><div id="lore-results" aria-live="polite"></div><p id="lore-status" role="status"></p></section>
</main>
<script>
const status=(id,text)=>{document.getElementById(id).textContent=text};
async function api(path,options={}){const response=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||response.statusText);return body}
document.getElementById('pair-form').addEventListener('submit',async event=>{event.preventDefault();try{await api('/pair',{method:'POST',body:JSON.stringify({code:event.target.code.value})});status('pair-status','Paired. Private data is available.')}catch(error){status('pair-status',error.message)}});
document.getElementById('note-form').addEventListener('submit',async event=>{event.preventDefault();try{await api('/api/note',{method:'POST',body:JSON.stringify({content:event.target.content.value})});event.target.reset();status('note-status','Saved.')}catch(error){status('note-status',error.message)}});
document.getElementById('recall-form').addEventListener('submit',async event=>{event.preventDefault();try{const body=await api('/api/recall?query='+encodeURIComponent(event.target.query.value));const list=document.getElementById('recall-results');list.replaceChildren(...(body.data||[]).map(hit=>{const item=document.createElement('li');item.textContent=hit.statement+' ['+hit.record_id+'@'+hit.revision+']';return item}));status('pair-status','Recalled '+body.coverage.included+' of '+body.coverage.matched+' matches in '+body.usage.duration_ms+' ms; trace '+body.trace_id)}catch(error){status('pair-status',error.message)}});
let activeDream=null;const setDreamButtons=enabled=>{document.getElementById('dream-run-button').disabled=!enabled;document.getElementById('dream-cancel-button').disabled=!enabled};const renderDream=body=>{status('dream-status',body.state+'; '+(body.progress?.completed??0)+'/'+(body.progress?.total??0)+' records; budget '+body.budget.max_records);const list=document.getElementById('dream-output');list.replaceChildren(...(body.outputs||[]).map(output=>{const item=document.createElement('li');item.textContent=output.type==='maintenance_receipt'?'Observation maintenance: '+output.status:((output.record_type||'hypothesis')+' ['+(output.payload?.epistemic_status||'hypothesis')+'] '+(output.payload?.statement||''));return item}))};document.getElementById('dream-form').addEventListener('submit',async event=>{event.preventDefault();try{const modes=[...document.querySelectorAll('input[name=dream-mode]:checked')].map(input=>input.value);if(!modes.length)throw new Error('select at least one dream mode');const body=await api('/api/dream',{method:'POST',body:JSON.stringify({level:event.target.level.value,modes,focus:event.target.focus.value||null})});activeDream=body.job_id;setDreamButtons(true);renderDream(body)}catch(error){status('dream-status',error.message)}});document.getElementById('dream-run-button').addEventListener('click',async()=>{if(!activeDream)return;try{renderDream(await api('/api/dream/'+encodeURIComponent(activeDream)+'/run',{method:'POST',body:JSON.stringify({max_records:100})}))}catch(error){status('dream-status',error.message)}});document.getElementById('dream-cancel-button').addEventListener('click',async()=>{if(!activeDream)return;try{renderDream(await api('/api/dream/'+encodeURIComponent(activeDream)+'/cancel',{method:'POST',body:'{}'}));setDreamButtons(false)}catch(error){status('dream-status',error.message)}});
const showResource=async resource=>{const [detail,trace]=await Promise.all([api('/api/resources/'+encodeURIComponent(resource.resource_id)),api('/api/trace/'+encodeURIComponent(resource.resource_id))]);const target=document.getElementById('atlas-detail');target.replaceChildren();const heading=document.createElement('h3');heading.textContent=detail.display_name+' ['+detail.kind+']';target.append(heading);const summary=document.createElement('p');summary.textContent='Snapshots: '+detail.snapshots.length+'; states: '+detail.states.map(state=>state.state_kind+'='+state.state).join(', ')+'; history: '+trace.chronicle.length+' events.';target.append(summary);const list=document.createElement('ul');list.append(...detail.snapshots.map(snapshot=>{const item=document.createElement('li');item.textContent=(snapshot.version||'unknown version')+' '+(snapshot.digest||'no digest')+' ['+snapshot.status+']';return item}));target.append(list)};
const loadPreferences=async()=>{const body=await api('/api/preferences');const list=document.getElementById('preference-results');list.replaceChildren(...(body.data||[]).map(preference=>{const item=document.createElement('li');item.textContent=preference.origin+' ['+preference.state+']: '+preference.statement;const form=document.createElement('form');const input=document.createElement('input');input.name='statement';input.required=true;input.value=preference.statement;const button=document.createElement('button');button.textContent='Correct';form.append(input,button);form.addEventListener('submit',async event=>{event.preventDefault();try{await api('/api/preferences/'+encodeURIComponent(preference.preference_id)+'/correct',{method:'POST',body:JSON.stringify({statement:input.value})});status('preference-status','Preference corrected.');await loadPreferences()}catch(error){status('preference-status',error.message)}});item.append(form);return item}))};
document.getElementById('preference-form').addEventListener('submit',async event=>{event.preventDefault();try{await api('/api/preferences',{method:'POST',body:JSON.stringify({origin:event.target.origin.value,statement:event.target.statement.value})});event.target.reset();status('preference-status','Preference recorded.');await loadPreferences()}catch(error){status('preference-status',error.message)}});
document.getElementById('preferences-button').addEventListener('click',()=>loadPreferences().catch(error=>status('preference-status',error.message)));
document.getElementById('ebb-form').addEventListener('submit',async event=>{event.preventDefault();try{const body=await api('/api/ebb/'+encodeURIComponent(event.target.record_id.value)+'/evaluate',{method:'POST',body:JSON.stringify({now:new Date().toISOString()})});status('ebb-status','Activation evaluated at '+body.score+'.')}catch(error){status('ebb-status',error.message)}});
document.getElementById('revive-button').addEventListener('click',async()=>{const record_id=document.getElementById('ebb-record-id').value;try{const body=await api('/api/ebb/'+encodeURIComponent(record_id)+'/revive',{method:'POST',body:JSON.stringify({score:1})});status('ebb-status','Record revived at '+body.score+'.')}catch(error){status('ebb-status',error.message)}});
document.getElementById('forget-form').addEventListener('submit',async event=>{event.preventDefault();try{const body=await api('/api/forget',{method:'POST',body:JSON.stringify({target_id:event.target.target_id.value,reason:event.target.reason.value})});status('ebb-status','Forgetting recorded for '+body.target_id+'.')}catch(error){status('ebb-status',error.message)}});
document.getElementById('atlas-button').addEventListener('click',async()=>{try{const body=await api('/api/resources?limit=100');const list=document.getElementById('atlas-results');list.replaceChildren(...(body.data||[]).map(resource=>{const item=document.createElement('li');const button=document.createElement('button');button.type='button';button.textContent=resource.display_name+' ['+resource.kind+' / '+resource.origin_facet+']';button.addEventListener('click',()=>showResource(resource).catch(error=>status('pair-status',error.message)));item.append(button);return item}))}catch(error){status('pair-status',error.message)}});
let activeLoreResource=null;const renderLore=page=>{activeLoreResource=page.page_id.slice('resource:'.length);document.getElementById('lore-revision').value=page.revision;const target=document.getElementById('lore-results');target.replaceChildren(...page.sections.map(section=>{const item=document.createElement('article');const heading=document.createElement('h3');heading.textContent=section.section_id+' ['+section.ownership+(section.stale?' / stale':'')+']';const content=document.createElement('p');content.textContent=section.content||'';item.append(heading,content);return item}))};const loadLore=async()=>{const id=document.getElementById('lore-resource-id').value;if(!id)throw new Error('resource id is required');renderLore(await api('/api/lore/'+encodeURIComponent(id)))};
document.getElementById('lore-load-form').addEventListener('submit',async event=>{event.preventDefault();try{await loadLore();status('lore-status','Lore loaded.')}catch(error){status('lore-status',error.message)}});
document.getElementById('lore-manual-form').addEventListener('submit',async event=>{event.preventDefault();try{if(!activeLoreResource)await loadLore();const body=await api('/api/lore/'+encodeURIComponent(activeLoreResource)+'/manual',{method:'POST',body:JSON.stringify({section_id:event.target.section_id.value,content:event.target.content.value,expected_revision:Number(event.target.expected_revision.value)})});renderLore(body.page);status('lore-status','Manual section saved.')}catch(error){status('lore-status',error.message)}});
document.getElementById('lore-refresh-button').addEventListener('click',async()=>{try{if(!activeLoreResource)await loadLore();const body=await api('/api/lore/'+encodeURIComponent(activeLoreResource)+'/refresh',{method:'POST',body:'{}'});renderLore(body.page);status('lore-status','Generated sections refreshed.')}catch(error){status('lore-status',error.message)}});
let activeForgeResource=null;const loadForge=async()=>{const form=document.getElementById('forge-form');const id=form.resource_id.value;if(!id)throw new Error('resource id is required');activeForgeResource=id;const body=await api('/api/forge/'+encodeURIComponent(id));document.getElementById('forge-results').textContent=JSON.stringify({resource_id:body.resource_id,version:body.version,findings:body.findings.length,lessons:body.lessons.length,hypotheses:body.hypotheses.length,reproduction_cases:body.reproduction_cases.length,coverage:body.coverage},null,2)};
document.getElementById('forge-form').addEventListener('submit',async event=>{event.preventDefault();try{await loadForge();status('forge-status','Forge view loaded.')}catch(error){status('forge-status',error.message)}});
document.getElementById('forge-blueprint-button').addEventListener('click',async()=>{try{if(!activeForgeResource)await loadForge();const privacy=document.getElementById('forge-privacy').value;const since=document.getElementById('forge-since').value;const query=new URLSearchParams({privacy});if(since)query.set('since',since);const body=await api('/api/blueprint/'+encodeURIComponent(activeForgeResource)+'?'+query);document.getElementById('forge-results').textContent=body.markdown;status('forge-status','Blueprint exported without patching the resource.')}catch(error){status('forge-status',error.message)}});
document.getElementById('forge-dream-button').addEventListener('click',async()=>{try{if(!activeForgeResource)await loadForge();const body=await api('/api/dream',{method:'POST',body:JSON.stringify({level:'dream',modes:['consolidate'],focus:{resource_id:activeForgeResource}})});status('forge-status','Focused dream '+body.job_id+' queued.')}catch(error){status('forge-status',error.message)}});
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

function dashboardScope() {
  return { scope_id: "local", owner_id: "local", kind: "project", project_id: process.cwd(), session_id: null, task_id: null };
}

function ensureDashboardResource(atlas) {
  const scope = dashboardScope();
  return atlas.register({
    principal: { owner_id: "local", scope_ids: [] },
    resource: {
      resource_id: "project:dashboard",
      kind: "project",
      origin_facet: "local",
      display_name: basename(scope.project_id) || scope.project_id,
      description: "Dashboard workspace",
      scope,
      aliases: [{ value: `file://${scope.project_id}`, kind: "path" }],
      metadata: { root: scope.project_id },
    },
  });
}

export function createRequestHandler({ service, pairing, atlas = createAtlas(service.store), adaptation = createAdaptation(service.store) }) {
  const principal = { owner_id: "local", scope_ids: [] };
  const loreState = (resource_id) => {
    const resource = atlas.inspect({ principal, resource_id });
    const trace = atlas.trace({ principal, id: resource_id });
    const linkedRecords = new Set(trace.edges.flatMap((edge) => edge.to_id === resource_id ? [edge.from_id] : []));
    const claims = service.store.listRecords().filter((record) => record.scope.scope_id === resource.scope.scope_id && (record.provenance.source_refs.includes(resource_id) || linkedRecords.has(record.record_id))).map((record) => ({ statement: record.payload.statement ?? "", source_refs: record.provenance.source_refs }));
    const saved = service.store.getLorePage(`resource:${resource_id}`);
    if (saved) return { resource, trace, claims, page: saved };
    const page = buildLorePage({ page_id: `resource:${resource_id}`, page_type: "resource", title: resource.display_name, claims, backlinks: trace.edges.map((edge) => ({ id: edge.from_id, kind: edge.edge_kind })) });
    return { resource, trace, claims, page: service.store.saveLorePage({ page, scope: resource.scope }) };
  };
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
      if (url.pathname === "/api/preferences" && request.method === "GET") return sendJson(response, 200, { data: adaptation.applicablePreferences({ scope_id: "local" }) });
      if (url.pathname === "/api/preferences" && request.method === "POST") {
        const body = await readBody(request);
        if (!["explicit", "inferred"].includes(body.origin) || !body.statement) return sendJson(response, 400, { error: "origin and statement are required" });
        return sendJson(response, 200, adaptation.recordPreference({ scope_id: "local", origin: body.origin, statement: body.statement, context: body.context ?? {}, support_context_id: body.support_context_id ?? null, counterevidence: body.counterevidence ?? [] }));
      }
      if (url.pathname.startsWith("/api/preferences/") && url.pathname.endsWith("/correct") && request.method === "POST") {
        const preference_id = decodeURIComponent(url.pathname.slice("/api/preferences/".length, -"/correct".length));
        const body = await readBody(request);
        return sendJson(response, 200, adaptation.correctPreference({ preference_id, scope_id: "local", statement: body.statement, context: body.context ?? {} }));
      }
      if (url.pathname === "/api/ebb" && request.method === "GET") {
        const data = service.store.listActivations().filter((activation) => {
          try { service.mindInspect({ principal, record_id: activation.record_id }); return true; } catch { return false; }
        });
        return sendJson(response, 200, { data });
      }
      const ebbAction = url.pathname.match(/^\/api\/ebb\/([^/]+)\/(evaluate|revive)$/);
      if (ebbAction && request.method === "POST") {
        const record_id = decodeURIComponent(ebbAction[1]);
        service.mindInspect({ principal, record_id });
        const body = await readBody(request);
        const operation = ebbAction[2] === "evaluate" ? "evaluateEbb" : "revive";
        return sendJson(response, 200, adaptation[operation]({ record_id, now: body.now ?? new Date().toISOString(), ...(body.score === undefined ? {} : { score: body.score }) }));
      }
      if (url.pathname === "/api/forget" && request.method === "POST") {
        const body = await readBody(request);
        const affected_ids = body.affected_ids ?? [body.target_id];
        for (const record_id of affected_ids) service.mindInspect({ principal, record_id });
        return sendJson(response, 200, adaptation.forget({ target_id: body.target_id, scope_id: "local", reason: body.reason, affected_ids }));
      }
      if (url.pathname === "/api/resources" && request.method === "GET") return sendJson(response, 200, atlas.listPage({ principal, kind: url.searchParams.get("kind"), origin_facet: url.searchParams.get("origin_facet"), limit: Number(url.searchParams.get("limit") ?? 100), offset: Number(url.searchParams.get("offset") ?? 0) }));
      if (url.pathname === "/api/resources" && request.method === "POST") {
        const body = await readBody(request);
        if (!body.kind || !body.origin_facet || !body.display_name) return sendJson(response, 400, { error: "kind, origin_facet, and display_name are required" });
        return sendJson(response, 200, atlas.register({ principal, resource: { resource_id: body.resource_id, kind: body.kind, origin_facet: body.origin_facet, display_name: body.display_name, description: body.description ?? null, scope: dashboardScope(), aliases: body.aliases ?? [], metadata: body.metadata ?? {} } }));
      }
      if (url.pathname.startsWith("/api/resources/") && url.pathname.endsWith("/refresh") && request.method === "POST") {
        const resource_id = decodeURIComponent(url.pathname.slice("/api/resources/".length, -"/refresh".length));
        return sendJson(response, 200, await atlas.refresh({ principal, resource_id }));
      }
      if (url.pathname.startsWith("/api/resources/") && url.pathname.endsWith("/snapshot") && request.method === "POST") {
        const resource_id = decodeURIComponent(url.pathname.slice("/api/resources/".length, -"/snapshot".length));
        const body = await readBody(request);
        return sendJson(response, 200, atlas.snapshot({ principal, resource_id, snapshot: body }));
      }
      if (url.pathname.startsWith("/api/resources/") && url.pathname.endsWith("/state") && request.method === "POST") {
        const resource_id = decodeURIComponent(url.pathname.slice("/api/resources/".length, -"/state".length));
        const body = await readBody(request);
        return sendJson(response, 200, atlas.setState({ principal, resource_id, state_kind: body.state_kind, state: body.state, evidence_refs: body.evidence_refs ?? [] }));
      }
      if (url.pathname.startsWith("/api/resources/") && request.method === "GET") return sendJson(response, 200, atlas.inspect({ principal, resource_id: decodeURIComponent(url.pathname.slice("/api/resources/".length)) }));
      if (url.pathname.startsWith("/api/trace/") && request.method === "GET") return sendJson(response, 200, atlas.trace({ principal, id: decodeURIComponent(url.pathname.slice("/api/trace/".length)), limit: Number(url.searchParams.get("limit") ?? 100) }));
      const loreMatch = url.pathname.match(/^\/api\/lore\/([^/]+)(?:\/(manual|refresh|invalidate))?$/);
      if (loreMatch) {
        const resource_id = decodeURIComponent(loreMatch[1]);
        const state = loreState(resource_id);
        if (request.method === "GET") return sendJson(response, 200, state.page);
        const body = await readBody(request);
        const before = state.page;
        if (loreMatch[2] === "manual") {
          const page = editManualSection(before, body.section_id, body.content, body.expected_revision ?? before.revision);
          return sendJson(response, 200, { page: service.store.saveLorePage({ page, scope: state.resource.scope }), diff: diffLorePages(before, page) });
        }
        if (loreMatch[2] === "refresh") {
          const page = refreshLorePage(before, { claims: state.claims });
          return sendJson(response, 200, { page: service.store.saveLorePage({ page, scope: state.resource.scope }), diff: diffLorePages(before, page) });
        }
        if (loreMatch[2] === "invalidate") {
          const page = invalidateLorePage(before, body.changed_source_ids ?? []);
          return sendJson(response, 200, { page: service.store.saveLorePage({ page, scope: state.resource.scope }), diff: diffLorePages(before, page) });
        }
      }
      if (url.pathname.startsWith("/api/forge/") && request.method === "GET") {
        const resource_id = decodeURIComponent(url.pathname.slice("/api/forge/".length));
        const resource = atlas.inspect({ principal, resource_id });
        return sendJson(response, 200, buildForgeView({ resource, records: service.store.listRecords(), version: url.searchParams.get("version") || null }));
      }
      if (url.pathname.startsWith("/api/blueprint/") && request.method === "GET") {
        const resource_id = decodeURIComponent(url.pathname.slice("/api/blueprint/".length));
        const resource = atlas.inspect({ principal, resource_id });
        const forge = buildForgeView({ resource, records: service.store.listRecords(), version: url.searchParams.get("version") || null });
        const baseline = url.searchParams.get("baseline_target") ? { target: url.searchParams.get("baseline_target"), scope: url.searchParams.get("baseline_scope"), version: url.searchParams.get("baseline_version") || null } : null;
        return sendJson(response, 200, exportBlueprint({ forge, target: resource.display_name, previous_cutoff: url.searchParams.get("since") || null, privacy: url.searchParams.get("privacy") || "standard", baseline }));
      }
      if (url.pathname.startsWith("/api/tasks/") && request.method === "GET") {
        const resource_id = decodeURIComponent(url.pathname.slice("/api/tasks/".length));
        const resource = atlas.inspect({ principal, resource_id });
        const forge = buildForgeView({ resource, records: service.store.listRecords(), version: url.searchParams.get("version") || null });
        return sendJson(response, 200, exportTaskManifest({ forge, target: resource.display_name, privacy: url.searchParams.get("privacy") || "standard" }));
      }
      if (url.pathname === "/api/recall" && request.method === "GET") return sendJson(response, 200, service.mindRecall({ principal, query: url.searchParams.get("query") ?? "", max_items: 8, max_chars: 12000 }));
      if (url.pathname.startsWith("/api/inspect/") && request.method === "GET") {
        const record_id = decodeURIComponent(url.pathname.slice("/api/inspect/".length));
        return sendJson(response, 200, service.mindInspect({ principal, record_id }));
      }
      if (url.pathname === "/api/note" && request.method === "POST") {
        const body = await readBody(request);
        return sendJson(response, 200, service.mindNote({ principal, scope: { scope_id: "local", owner_id: "local", kind: "project", project_id: "local", session_id: null, task_id: null }, content: body.content, resource_id: body.resource_id ?? null, producer_id: "dashboard", idempotency_key: body.idempotency_key ?? `dashboard:${Date.now()}` }));
      }
      if (url.pathname === "/api/dream" && request.method === "POST") {
        const body = await readBody(request);
        return sendJson(response, 202, service.mindDream({ principal, scope_ids: ["local"], level: body.level ?? "snooze", modes: body.modes ?? ["consolidate"], focus: body.focus ?? null, producer_id: "dashboard", idempotency_key: body.idempotency_key ?? `dashboard-dream:${Date.now()}` }));
      }
      if (url.pathname.startsWith("/api/dream/") && url.pathname.endsWith("/run") && request.method === "POST") {
        const job_id = decodeURIComponent(url.pathname.slice("/api/dream/".length, -"/run".length));
        const body = await readBody(request);
        return sendJson(response, 200, service.runDream({ principal, job_id, max_records: body.max_records ?? 100 }));
      }
      if (url.pathname.startsWith("/api/dream/") && url.pathname.endsWith("/cancel") && request.method === "POST") {
        const job_id = decodeURIComponent(url.pathname.slice("/api/dream/".length, -"/cancel".length));
        return sendJson(response, 200, service.mindDreamCancel({ principal, job_id }));
      }
      if (url.pathname === "/api/retrospect" && request.method === "POST") {
        const body = await readBody(request);
        return sendJson(response, 200, service.mindRetrospect({ principal, observation_ids: body.observation_ids ?? [], outcome_ids: body.outcome_ids ?? [], hypothesis_ids: body.hypothesis_ids ?? [] }));
      }
      if (url.pathname === "/api/policy/evaluate" && request.method === "POST") return sendJson(response, 200, service.mindPolicyEvaluate(await readBody(request)));
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
  const atlas = createAtlas(service.store);
  ensureDashboardResource(atlas);
  const started = await startServer({ config, service, requestHandler: createRequestHandler({ service, pairing, atlas }) });
  return { ...started, pairing, pairing_code };
}

