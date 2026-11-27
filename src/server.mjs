import { createServer } from "node:http";
import { readFileSync, realpathSync, statSync } from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";
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

const THEMES_ROOT = resolve(process.cwd(), "themes");
const THEME_REGISTRY_PATH = join(THEMES_ROOT, "registry.json");
const THEME_ASSET_TYPES = Object.freeze({
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
});
const BUILTIN_THEME_REGISTRY = Object.freeze({
  schemaVersion: "1.0",
  themeApi: "1",
  defaultTheme: "cortex-tabs",
  themes: [{
    id: "cortex-tabs",
    name: "Cortex Tabs",
    version: "1.0.0",
    description: "A restrained, evidence-first science-fiction theme for NOESIS Observatory.",
    themeApi: "1",
    assets: [
      { path: "cortex-tabs/tokens.css", contentType: THEME_ASSET_TYPES[".css"] },
      { path: "cortex-tabs/theme.css", contentType: THEME_ASSET_TYPES[".css"] },
      { path: "cortex-tabs/icons.svg", contentType: THEME_ASSET_TYPES[".svg"] },
    ],
  }],
});

function validateThemeRegistryShape(registry) {
  if (!registry || typeof registry !== "object" || registry.schemaVersion !== "1.0" || registry.themeApi !== "1") {
    throw new Error("invalid theme registry metadata");
  }
  if (!Array.isArray(registry.themes) || registry.themes.length === 0 || typeof registry.defaultTheme !== "string") {
    throw new Error("invalid theme registry entries");
  }
}

export function validateThemeRegistry(registry, { themesRoot = THEMES_ROOT, requireFiles = true } = {}) {
  validateThemeRegistryShape(registry);
  const root = resolve(themesRoot);
  let rootReal = null;
  if (requireFiles) rootReal = realpathSync(root);
  const ids = new Set();
  const themes = registry.themes.map((theme) => {
    if (!theme || typeof theme !== "object" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(theme.id) || ids.has(theme.id)) {
      throw new Error("invalid theme id");
    }
    if (typeof theme.name !== "string" || typeof theme.version !== "string" || (theme.description !== undefined && typeof theme.description !== "string") || theme.themeApi !== "1" || !Array.isArray(theme.assets) || !theme.assets.length) {
      throw new Error(`invalid theme metadata for ${theme.id}`);
    }
    ids.add(theme.id);
    const assetPaths = new Set();
    const assets = theme.assets.map((asset) => {
      if (!asset || typeof asset.path !== "string" || typeof asset.contentType !== "string" || assetPaths.has(asset.path)) throw new Error(`invalid asset metadata for ${theme.id}`);
      const segments = asset.path.split("/");
      if (segments[0] !== theme.id || segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\\"))) {
        throw new Error(`invalid asset path for ${theme.id}`);
      }
      assetPaths.add(asset.path);
      const contentType = THEME_ASSET_TYPES[extname(asset.path)];
      if (!contentType || asset.contentType !== contentType) throw new Error(`unsupported asset type for ${asset.path}`);
      const absolutePath = resolve(root, asset.path);
      if (relative(root, absolutePath) !== asset.path) throw new Error(`asset escapes theme root: ${asset.path}`);
      let filePath = absolutePath;
      if (requireFiles) {
        filePath = realpathSync(absolutePath);
        if (relative(rootReal, filePath) !== asset.path || !statSync(filePath).isFile()) throw new Error(`invalid local theme asset: ${asset.path}`);
      }
      return { path: asset.path, contentType, filePath };
    });
    if (!assets.some((asset) => asset.path === `${theme.id}/tokens.css`) || !assets.some((asset) => asset.path === `${theme.id}/theme.css`)) {
      throw new Error(`theme styles are incomplete for ${theme.id}`);
    }
    return {
      id: theme.id,
      name: theme.name,
      version: theme.version,
      description: theme.description || "",
      themeApi: "1",
      assets,
    };
  });
  if (!ids.has(registry.defaultTheme)) throw new Error("theme registry default is not installed");
  return { schemaVersion: "1.0", themeApi: "1", defaultTheme: registry.defaultTheme, themes };
}

export function loadThemeRegistry({ registryPath = THEME_REGISTRY_PATH, themesRoot = THEMES_ROOT } = {}) {
  let candidate = null;
  try {
    candidate = JSON.parse(readFileSync(registryPath, "utf8"));
  } catch {}
  for (const source of [candidate, BUILTIN_THEME_REGISTRY]) {
    if (!source) continue;
    try {
      return validateThemeRegistry(source, { themesRoot, requireFiles: true });
    } catch {}
  }
  return validateThemeRegistry(BUILTIN_THEME_REGISTRY, { themesRoot, requireFiles: false });
}

export function publicThemeRegistry(registry) {
  return {
    schemaVersion: registry.schemaVersion,
    themeApi: registry.themeApi,
    defaultTheme: registry.defaultTheme,
    themes: registry.themes.map(({ id, name, version, description, themeApi, assets }) => ({
      id,
      name,
      version,
      description,
      themeApi,
      assets: assets.map(({ path, contentType }) => ({ path: `/themes/${path}`, contentType })),
    })),
  };
}
const OBSERVATORY_HTML = `<!doctype html>
<html lang="en" data-ui-theme="cortex-tabs" data-ui-color-mode="system" data-ui-density="comfortable">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#07111e">
<title>NOESIS Observatory</title>
<style>
:root{
  color-scheme:dark;
  font:16px/1.5 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --canvas:#07111e;--surface:#0d1b2a;--surface-raised:#13263a;--surface-soft:#102132;--surface-quiet:#0a1724;
  --ink:#eaf2ff;--ink-soft:#c2d2dc;--ink-muted:#a9bac2;--line:#294356;--line-strong:#486277;
  --signal:#71d7d0;--signal-on:#07111e;--focus:#b7a9ff;--success:#7bd4b2;--warning:#f2c979;--danger:#ff9ca9;--derived:#ae9cff;
  --selection:#153c47;--shadow:0 12px 28px rgb(0 0 0 / .22);--radius-sm:8px;--radius-md:12px;--radius-lg:16px;
  --mono:ui-monospace,SFMono-Regular,Consolas,monospace;--control:44px;
}
:root[data-ui-color-mode="light"]{
  color-scheme:light;--canvas:#f1f6fb;--surface:#fff;--surface-raised:#fff;--surface-soft:#edf3f7;--surface-quiet:#f7fafc;
  --ink:#14263a;--ink-soft:#2c4050;--ink-muted:#4d5b66;--line:#b2c0c8;--line-strong:#7a8d99;
  --signal:#087b83;--signal-on:#fff;--focus:#6b4fd5;--success:#1b6b55;--warning:#815b0a;--danger:#9c3344;--derived:#5b49ad;
  --selection:#dceff1;--shadow:0 10px 24px rgb(20 38 58 / .12);
}
@media (prefers-color-scheme:light){
  :root[data-ui-color-mode="system"]{
    color-scheme:light;--canvas:#f1f6fb;--surface:#fff;--surface-raised:#fff;--surface-soft:#edf3f7;--surface-quiet:#f7fafc;
    --ink:#14263a;--ink-soft:#2c4050;--ink-muted:#4d5b66;--line:#b2c0c8;--line-strong:#7a8d99;
    --signal:#087b83;--signal-on:#fff;--focus:#6b4fd5;--success:#1b6b55;--warning:#815b0a;--danger:#9c3344;--derived:#5b49ad;
    --selection:#dceff1;--shadow:0 10px 24px rgb(20 38 58 / .12);
  }
}
*{box-sizing:border-box}
html{background:var(--canvas);scroll-behavior:smooth}
body{min-width:320px;min-height:100vh;margin:0;color:var(--ink);background:var(--canvas);overflow-x:hidden}
a{color:inherit}
button,input,select,textarea{font:inherit}
button,a{ -webkit-tap-highlight-color:transparent}
button{color:inherit;cursor:pointer}
button:disabled{cursor:not-allowed;opacity:.62}
button:focus-visible,a:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
[hidden]{display:none!important}
.skip-link{position:fixed;z-index:30;inset-block-start:-4rem;inset-inline-start:16px;padding:10px 14px;border-radius:var(--radius-sm);color:var(--signal-on);background:var(--signal);font-weight:800;text-decoration:none}
.skip-link:focus{inset-block-start:12px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:20px;max-width:1480px;min-height:80px;margin:0 auto;padding:16px clamp(16px,3vw,40px)}
.brand{display:flex;align-items:center;gap:12px;min-width:0}
.brand-mark{display:grid;place-items:center;flex:0 0 auto;width:34px;height:34px;border:1px solid var(--signal);border-radius:9px;color:var(--signal);font-weight:900}
.brand h1{margin:0;font-size:clamp(1.1rem,2vw,1.45rem);letter-spacing:-.03em}
.brand p{margin:1px 0 0;color:var(--ink-muted);font-size:.75rem}
.top-actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
.connection{display:inline-flex;align-items:center;gap:7px;min-height:32px;padding:6px 9px;border:1px solid var(--line);border-radius:999px;color:var(--ink-soft);font-size:.75rem;white-space:nowrap}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--ink-muted)}
.dot.success{background:var(--success)}.dot.warn{background:var(--warning)}.dot.error{background:var(--danger)}
.theme-button,.button{display:inline-flex;align-items:center;justify-content:center;min-height:var(--control);padding:9px 13px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);background:var(--surface-soft);font-weight:750;font-size:.82rem;text-decoration:none}
.button.primary{border-color:var(--signal);color:var(--signal-on);background:var(--signal)}
.button.secondary{background:var(--surface)}
.button.quiet{border-color:transparent;background:transparent;color:var(--signal)}
.button.danger{border-color:var(--danger);color:var(--danger);background:transparent}
.button.small{min-height:var(--control);padding:9px 10px;font-size:.75rem}
.primary-tabs{display:flex;align-items:stretch;gap:4px;min-height:64px;padding-inline:clamp(16px,3vw,40px);border-block:1px solid var(--line);background:var(--surface);overflow-x:auto;scrollbar-width:thin}
.tab{display:inline-flex;align-items:center;gap:8px;min-width:max-content;min-height:60px;padding:9px 14px;border:0;border-block-end:3px solid transparent;color:var(--ink-muted);background:transparent;font-weight:800;font-size:.8rem;text-align:start}
.tab:hover{color:var(--ink);background:var(--surface-soft)}.tab[aria-selected="true"]{border-block-end-color:var(--signal);color:var(--ink);background:var(--surface-soft)}
.tab-symbol{display:grid;place-items:center;width:24px;height:24px;border:1px solid currentColor;border-radius:7px;color:var(--signal);font-size:.9rem}
.tab small{display:block;color:var(--ink-muted);font-size:.66rem;font-weight:600}
.context-bar{position:sticky;z-index:5;inset-block-start:0;display:flex;align-items:center;gap:12px;max-width:1480px;min-height:70px;margin:20px auto;padding:10px 14px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-raised);box-shadow:var(--shadow)}
.context-icon{display:grid;place-items:center;flex:0 0 auto;width:40px;height:40px;border-radius:10px;color:var(--signal-on);background:var(--signal);font-weight:900}
.context-copy{display:grid;min-width:0;gap:1px}.context-copy strong{overflow-wrap:anywhere;font-size:.9rem}.context-copy span{color:var(--ink-muted);font-size:.72rem;overflow-wrap:anywhere}
.context-values{display:flex;flex-wrap:wrap;gap:6px;margin-inline-start:auto}.code-chip{padding:4px 7px;border:1px solid var(--line);border-radius:6px;color:var(--ink-soft);background:var(--surface-soft);font:.7rem var(--mono);overflow-wrap:anywhere}
.context-bar .button{flex:0 0 auto}
.pairing-surface{max-width:820px;margin:0 auto 24px;padding:clamp(20px,4vw,32px);border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);box-shadow:var(--shadow)}
.pairing-surface h2{margin:0}.pairing-surface>p{margin:8px 0;color:var(--ink-soft)}
.pairing-form{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:end;margin-top:20px}
.app-grid{display:grid;grid-template-columns:205px minmax(0,1fr) 312px;align-items:start;gap:20px;max-width:1480px;margin:0 auto;padding:0 clamp(16px,3vw,40px) 64px}
.rail{position:sticky;inset-block-start:94px;display:grid;gap:5px;min-width:0}.rail-label{margin:5px 10px 4px;color:var(--ink-muted);font-size:.66rem;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
.rail-link{display:flex;align-items:center;gap:9px;min-height:46px;padding:8px 10px;border:1px solid transparent;border-radius:var(--radius-sm);color:var(--ink-muted);font-size:.8rem;text-decoration:none}
.rail-link:hover,.rail-link.current{color:var(--ink);background:var(--surface-soft);border-color:var(--line)}.rail-link.current{border-color:var(--signal)}
.rail-link b{margin-inline-start:auto;color:var(--signal);font:.72rem var(--mono)}.rail-rule{height:1px;margin:12px 10px;background:var(--line)}
.main-pane{display:grid;gap:16px;min-width:0}.view-panel{display:grid;gap:16px;min-width:0}
.inspector{position:sticky;inset-block-start:94px;display:grid;gap:12px;min-width:0;padding:16px;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);box-shadow:var(--shadow)}
.inspector-head{display:flex;align-items:start;justify-content:space-between;gap:8px}.inspector h2{font-size:1.05rem}.inspector-block{display:grid;gap:8px;padding-block:13px;border-block-start:1px solid var(--line)}
.inspector-links{display:grid;gap:5px}.inspector-links .button{justify-content:flex-start;width:100%}
.page-head{display:flex;align-items:start;justify-content:space-between;gap:14px}.eyebrow{margin:0;color:var(--ink-muted);font-size:.66rem;font-weight:850;letter-spacing:.13em;text-transform:uppercase}
h2{margin:2px 0 0;font-size:clamp(1.35rem,2.4vw,1.85rem);line-height:1.2;letter-spacing:-.035em}h3{margin:0;font-size:1rem;line-height:1.3}h4{margin:0;font-size:.84rem}p{margin:0}
.lede{max-width:64ch;margin-block-start:6px;color:var(--ink-soft);font-size:.86rem}.muted,.small-copy{color:var(--ink-muted);font-size:.74rem}
.panel{min-width:0;border:1px solid var(--line);border-radius:var(--radius-lg);background:var(--surface);overflow:hidden}
.panel-head{display:flex;align-items:start;justify-content:space-between;gap:12px;padding:17px 18px 0}.panel-head p{margin-block-start:4px;color:var(--ink-muted);font-size:.75rem}
.panel-body{padding:16px 18px 18px}.panel-foot{display:flex;align-items:flex-start;gap:8px;padding:12px 18px 15px;border-block-start:1px solid var(--line);color:var(--ink-muted);font-size:.73rem}.panel-foot .button{margin-inline-start:auto}
.stack{display:grid;gap:12px}.two-col{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.three-col{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.action-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.action-row .button{margin:0}
form{display:grid;gap:12px}.field{display:grid;gap:5px}.field label{color:var(--ink-soft);font-size:.75rem;font-weight:700}.field input,.field select,.field textarea,input,select,textarea{width:100%;min-height:var(--control);padding:9px 10px;border:1px solid var(--line-strong);border-radius:var(--radius-sm);color:var(--ink);background:var(--surface-soft)}
.field textarea,textarea{min-height:104px;resize:vertical}.field small{color:var(--ink-muted);font-size:.68rem}.field input::placeholder{color:var(--ink-muted)}
.choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin:0;padding:10px;border:1px solid var(--line);border-radius:var(--radius-sm)}
.choice-grid legend{padding-inline:4px;color:var(--ink-soft);font-size:.75rem;font-weight:750}.choice{display:flex;align-items:center;gap:8px;min-height:44px;padding:6px 8px;border:1px solid transparent;border-radius:var(--radius-sm);color:var(--ink-soft);font-size:.78rem}.choice:hover{background:var(--surface-soft);border-color:var(--line)}.choice input{width:20px;min-height:20px;padding:0}
.status-line{min-height:24px;margin:0;padding:9px 11px;border:1px solid transparent;border-radius:var(--radius-sm);color:var(--ink-soft);font-size:.76rem;overflow-wrap:anywhere}.status-line:not(:empty){background:var(--surface-soft);border-color:var(--line)}.status-line[data-state="success"]{border-color:var(--success)}.status-line[data-state="warning"]{border-color:var(--warning)}.status-line[data-state="error"]{border-color:var(--danger);color:var(--danger)}
.status-line::before{content:"";display:inline-block;width:7px;height:7px;margin-inline-end:8px;border-radius:50%;background:var(--signal)}.status-line:empty::before{display:none}.status-line[data-state="success"]::before{background:var(--success)}.status-line[data-state="warning"]::before{background:var(--warning)}.status-line[data-state="error"]::before{background:var(--danger)}
.badge{display:inline-flex;align-items:center;gap:5px;min-height:24px;padding:3px 7px;border:1px solid var(--line);border-radius:6px;color:var(--ink-muted);background:var(--surface-soft);font-size:.66rem;font-weight:800}.badge.source{color:var(--signal);border-color:var(--signal)}.badge.derived{color:var(--derived);border-color:var(--derived)}.badge.review{color:var(--warning);border-color:var(--warning)}.badge.error{color:var(--danger);border-color:var(--danger)}.badge.success{color:var(--success);border-color:var(--success)}
.badges{display:flex;flex-wrap:wrap;gap:6px}.mono,code{font-family:var(--mono);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}.wrap{overflow-wrap:anywhere}
.open-work{display:grid;gap:8px;margin:0;padding:0;list-style:none}.work-row{display:grid;grid-template-columns:26px minmax(0,1fr) auto;gap:9px;align-items:start;padding:11px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface-quiet)}.work-mark{display:grid;place-items:center;width:24px;height:24px;border-radius:7px;color:var(--signal-on);background:var(--signal);font-weight:900}.work-mark.warn{color:#07111e;background:var(--warning)}.work-row strong{font-size:.8rem}.work-row p{margin-block-start:3px;color:var(--ink-muted);font-size:.72rem}
.empty-state{padding:12px;border:1px dashed var(--line-strong);border-radius:var(--radius-sm);color:var(--ink-muted);font-size:.78rem}
.activity-grid{display:grid;grid-template-columns:minmax(250px,.9fr) minmax(280px,1.1fr);gap:14px;align-items:start}.graph-frame{display:grid;gap:9px;min-width:0;padding:10px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-quiet)}.brain-frame{gap:10px;padding:12px;border-color:var(--signal)}
.surface-header{display:flex;align-items:center;justify-content:space-between;gap:10px}.surface-kicker{color:var(--signal);font:700 .66rem var(--mono);letter-spacing:.1em;text-transform:uppercase}.brain-svg{display:block;width:100%;height:auto;aspect-ratio:760 / 400}.graph-caption{color:var(--ink-muted);font-size:.72rem}
.brain-svg path,.brain-svg line{fill:none;stroke:var(--signal);stroke-width:2}.brain-svg .brain-fill{fill:var(--surface-soft);stroke:var(--signal)}.brain-svg .brain-detail{stroke:var(--line-strong);stroke-width:1.5}.brain-facts{display:grid;gap:6px;margin:0;padding:0;list-style:none}.brain-facts li{display:grid;grid-template-columns:minmax(110px,.7fr) minmax(0,1fr);gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:.72rem}.brain-facts li:last-child{border-bottom:0}.brain-facts strong{color:var(--ink-muted);font-weight:650}
.pipeline-track{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:14px}.pipeline-node{display:grid;gap:6px;min-height:76px;padding:10px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface-quiet)}.pipeline-node strong{font-size:.75rem}.pipeline-node span{color:var(--ink-muted);font-size:.7rem}.pipeline-node[data-state="known"]{border-color:var(--success)}.pipeline-node[data-state="waiting"]{border-color:var(--warning)}
.data-table{width:100%;border-collapse:collapse;font-size:.73rem}.data-table th,.data-table td{padding:9px 7px;border-block-end:1px solid var(--line);text-align:start;vertical-align:top}.data-table th{color:var(--ink-muted);font-size:.66rem;font-weight:850;letter-spacing:.05em;text-transform:uppercase}.data-table tr:last-child td{border-block-end:0}.table-wrap{max-width:100%;overflow-x:auto}.table-state{color:var(--ink-muted)}
.result-list{display:grid;gap:7px;margin:0;padding:0;list-style:none}.result-list>li,.evidence-block{padding:10px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface-quiet);overflow-wrap:anywhere}.result-list button{width:100%;min-height:44px;padding:9px;border:1px solid var(--line);border-radius:var(--radius-sm);color:var(--ink);background:var(--surface-soft);text-align:start;overflow-wrap:anywhere}
.detail-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:14px}.fact-list{display:grid;gap:7px;margin:0}.fact-list div{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:8px}.fact-list dt{color:var(--ink-muted);font-size:.72rem}.fact-list dd{margin:0;color:var(--ink-soft);font-size:.72rem;font-weight:700;text-align:end;overflow-wrap:anywhere}
.relationship-panel{display:grid;gap:10px}.relationship-visual{display:block;width:100%;height:auto;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--surface-quiet)}.relationship-visual line{stroke:var(--signal);stroke-width:2}.relationship-visual circle{fill:var(--surface);stroke:var(--derived);stroke-width:2}.relationship-visual text{fill:var(--ink-soft);font:12px var(--mono)}.relationship-list{display:grid;gap:7px;margin:0;padding:0;list-style:none}.relationship-list li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;padding:9px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface-quiet);font-size:.71rem}.relationship-list strong{display:block;font-size:.75rem}.relationship-list span{color:var(--ink-muted)}.edge-label{color:var(--signal);font-weight:800;text-align:end}
.inspector .fact-list{margin-top:0}.provenance{display:grid;gap:6px;margin:0;padding:0;list-style:none}.provenance li{display:grid;grid-template-columns:8px minmax(0,1fr);gap:7px;align-items:start;color:var(--ink-soft);font-size:.71rem}.provenance li::before{width:7px;height:7px;margin-block-start:5px;border-radius:50%;background:var(--signal);content:""}.provenance li.derived::before{background:var(--derived)}.provenance li.generated::before{background:var(--warning)}.provenance li.hypothetical::before{background:var(--danger)}
pre{max-width:100%;margin:0;padding:12px;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface-quiet);white-space:pre-wrap;overflow-wrap:anywhere;font:.73rem/1.5 var(--mono)}
.dialog-backdrop{background:rgb(0 0 0 / .68)}dialog{max-width:min(520px,calc(100vw - 32px));padding:0;border:1px solid var(--line-strong);border-radius:var(--radius-lg);color:var(--ink);background:var(--surface-raised);box-shadow:var(--shadow)}dialog::backdrop{background:rgb(0 0 0 / .68)}.dialog-body{display:grid;gap:14px;padding:22px}.dialog-body h2{font-size:1.2rem}.dialog-body p{color:var(--ink-soft);font-size:.83rem}
.palette-dialog{max-width:min(640px,calc(100vw - 32px))}.palette-dialog .dialog-body{max-height:min(80vh,720px);overflow:auto}.command-results{max-height:40vh;overflow:auto}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}
@media (max-width:1260px){.app-grid{grid-template-columns:205px minmax(0,1fr)}.inspector{grid-column:2;position:static}.context-bar{margin-inline:16px}}
@media (max-width:900px){.app-grid{grid-template-columns:1fr}.rail{position:static;display:flex;gap:6px;align-items:center;overflow-x:auto;padding-block:2px}.rail-label,.rail-rule{display:none}.rail-link{flex:0 0 auto}.inspector{grid-column:auto}.activity-grid,.detail-grid{grid-template-columns:1fr}}
@media (max-width:620px){.topbar{align-items:flex-start;flex-direction:column;padding-inline:16px}.top-actions{width:100%;justify-content:space-between}.context-bar{align-items:flex-start;flex-wrap:wrap;margin:12px 16px;padding:10px}.context-values{width:100%;margin-inline-start:52px}.context-bar .button{margin-inline-start:auto}.app-grid{padding-inline:16px}.page-head{flex-direction:column}.two-col,.three-col{grid-template-columns:1fr}.pipeline-track{grid-template-columns:1fr}.pairing-form{grid-template-columns:1fr}.choice-grid{grid-template-columns:1fr}.panel-head{flex-direction:column}.panel-foot{flex-direction:column}.panel-foot .button{margin-inline-start:0}.relationship-list li{grid-template-columns:1fr}.edge-label{text-align:start}}
@media (max-width:400px){.topbar{padding-inline-start:calc(12px + env(safe-area-inset-left));padding-inline-end:calc(12px + env(safe-area-inset-right))}.primary-tabs{padding-inline:12px}.context-bar{margin-inline:12px}.context-values{margin-inline-start:0}.context-bar .button,.action-row .button,form>.button,form>button,.pairing-form button{width:100%}.app-grid{padding-inline:12px}.panel-head,.panel-body{padding-inline:13px}.panel-foot{padding-inline:13px}.rail-link{min-height:44px}.data-table{min-width:520px}.brand p{max-width:28ch}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:0ms!important;animation-iteration-count:1!important;transition-duration:0ms!important}}
@media (forced-colors:active){:root{--canvas:Canvas;--surface:Canvas;--surface-raised:Canvas;--surface-soft:Canvas;--surface-quiet:Canvas;--ink:CanvasText;--ink-soft:CanvasText;--ink-muted:GrayText;--line:CanvasText;--line-strong:CanvasText;--signal:Highlight;--signal-on:HighlightText;--focus:Highlight;--success:CanvasText;--warning:CanvasText;--danger:CanvasText;--derived:CanvasText;--selection:Highlight}.topbar,.primary-tabs,.context-bar,.panel,.inspector,.pairing-surface,dialog{box-shadow:none}.tab[aria-selected="true"],.rail-link.current{border-color:Highlight}.button.primary{background:Highlight;color:HighlightText}.badge,.status-line,.work-row,.pipeline-node,.result-list>li,.evidence-block,.graph-frame{background:Canvas;color:CanvasText}.brain-svg path,.brain-svg line,.relationship-visual line,.relationship-visual circle{stroke:CanvasText}.relationship-visual text{fill:CanvasText}}
</style>
<link rel="stylesheet" href="/themes/cortex-tabs/tokens.css" data-theme-link="tokens">
<link rel="stylesheet" href="/themes/cortex-tabs/theme.css" data-theme-link="styles">
</head>
<body>
<a class="skip-link" href="#main-content">Skip to main content</a>
<header class="topbar">
  <div class="brand"><span class="brand-mark" aria-hidden="true">N</span><div><h1>NOESIS Observatory</h1><p>Understand what was retained, why, and what changed.</p></div></div>
  <div class="top-actions"><span id="connection-state" class="connection" role="status" aria-live="polite" aria-atomic="true"><span class="dot warn" aria-hidden="true"></span><span>Pairing required</span></span><button id="theme-toggle" class="theme-button" type="button" aria-label="Switch to light theme">Theme: system</button><button id="theme-settings-trigger" class="theme-button" type="button" aria-haspopup="dialog" aria-controls="theme-settings">Theme settings</button><button id="command-palette-trigger" class="theme-button" type="button" aria-haspopup="dialog" aria-controls="command-palette">Command palette</button></div>
</header>
<nav class="primary-tabs" aria-label="Primary workspaces" role="tablist">
  <button class="tab" id="tab-observatory" role="tab" aria-selected="true" aria-controls="view-observatory" tabindex="0" data-view="observatory" type="button"><span class="tab-symbol" aria-hidden="true">◌</span><span>Observatory<small>Status and open work</small></span></button>
  <button class="tab" id="tab-atlas" role="tab" aria-selected="false" aria-controls="view-atlas" tabindex="-1" data-view="atlas" type="button"><span class="tab-symbol" aria-hidden="true">⌘</span><span>Atlas<small>Resources and relations</small></span></button>
  <button class="tab" id="tab-lore" role="tab" aria-selected="false" aria-controls="view-lore" tabindex="-1" data-view="lore" type="button"><span class="tab-symbol" aria-hidden="true">✦</span><span>Lore<small>Generated and authored</small></span></button>
  <button class="tab" id="tab-reverie" role="tab" aria-selected="false" aria-controls="view-reverie" tabindex="-1" data-view="reverie" type="button"><span class="tab-symbol" aria-hidden="true">↻</span><span>Reverie<small>Durable jobs</small></span></button>
  <button class="tab" id="tab-forge" role="tab" aria-selected="false" aria-controls="view-forge" tabindex="-1" data-view="forge" type="button"><span class="tab-symbol" aria-hidden="true">⬡</span><span>Forge<small>Scoped exports</small></span></button>
</nav>
<section class="context-bar" aria-label="Selected resource context">
  <span id="context-icon" class="context-icon" aria-hidden="true">—</span>
  <div class="context-copy"><strong id="selected-resource-name">No resource selected</strong><span id="selected-resource-scope">Pair this browser before private context is available.</span></div>
  <div class="context-values"><span id="selected-resource-version" class="code-chip">version: unknown</span><span id="selected-resource-id" class="code-chip">id: not selected</span><span id="selected-resource-scope-chip" class="code-chip">scope: unknown</span></div>
  <a id="context-detail-button" class="button small secondary" href="#selected-inspector">Details</a>
</section>
<main id="main-content" tabindex="-1">
  <section id="pairing-panel" class="pairing-surface" aria-labelledby="pair-title">
    <p class="eyebrow">LOCAL ACCESS</p><h2 id="pair-title">Pair this browser</h2><p>Enter the short-lived code printed by the local operator. No private memory is shown before pairing.</p>
    <form id="pair-form" class="pairing-form"><div class="field"><label for="pair-code">Pairing code</label><input id="pair-code" name="code" inputmode="numeric" autocomplete="one-time-code" required pattern="[0-9]{8}" aria-describedby="pair-help"><small id="pair-help">Eight digits. The code expires after one use.</small></div><button class="button primary" type="submit">Pair browser</button></form>
    <p id="pair-status" class="status-line" role="status" aria-live="polite"></p>
  </section>
  <div id="private-shell" class="app-grid" hidden>
    <aside class="rail" aria-label="Observatory sections">
      <p class="rail-label">Current work</p>
      <a class="rail-link current" href="#pulse" data-section="pulse" aria-current="location">◌ <span>Pulse</span></a>
      <a class="rail-link" href="#capture" data-section="capture">▱ <span>Capture / recall</span></a>
      <a class="rail-link" href="#attunement" data-section="attunement">✦ <span>Attunement</span></a>
      <a class="rail-link" href="#ebb" data-section="ebb">↘ <span>Ebb</span></a>
      <div class="rail-rule"></div>
      <p class="rail-label">Trace views</p>
      <a class="rail-link" href="#atlas" data-section="atlas">⌘ <span>Selected resource</span></a>
      <a class="rail-link" href="#lore" data-section="lore">⟿ <span>Lore</span></a>
      <a id="lineage-link" class="rail-link" href="#lineage" data-section="lineage">⤴ <span>Lineage</span></a>
      <a id="chronicle-link" class="rail-link" href="#chronicle" data-section="chronicle">◷ <span>Chronicle</span></a>
    </aside>
    <div class="main-pane">
      <section id="view-observatory" class="view-panel" data-view-panel="observatory" aria-labelledby="observatory-title">
        <header id="pulse" class="page-head"><div><p class="eyebrow">OBSERVATORY / PULSE</p><h2 id="observatory-title">Status and open work</h2><p class="lede">Service facts first. Activity visuals stay bounded to returned facts and say unavailable when this route has no projection.</p></div><a class="button primary" href="#capture">Capture observation</a></header>
        <section class="panel" aria-labelledby="open-work-title"><div class="panel-head"><div><h3 id="open-work-title">Open work</h3><p>Durable work appears here only when the service supplies a job or failure projection.</p></div><span class="badge" id="open-work-state">Unavailable</span></div><div class="panel-body"><ul id="open-work-list" class="open-work"><li class="empty-state">No open-work projection is available from this route.</li></ul></div></section>
        <section class="panel" aria-labelledby="activity-title"><div class="panel-head"><div><h3 id="activity-title">Activity signal</h3><p>Contained local vector treatment. It never invents particles, counts, confidence, or progress.</p></div><span id="activity-state" class="badge review">Unavailable</span></div><div class="panel-body activity-grid">
          <figure class="graph-frame brain-frame"><div class="surface-header"><span class="surface-kicker">BRAIN / LOCAL VECTOR</span><span class="badge" aria-hidden="true">Static</span></div><svg class="brain-svg" viewBox="0 0 760 400" aria-hidden="true"><path class="brain-fill" d="M193 215c-19-55 14-119 76-139 15-35 60-55 95-35 29-39 103-25 114 20 47-16 96 30 79 75 49 28 48 101 8 128-5 49-65 70-100 41-36 32-93 28-113-14-50 18-137 2-159-51z"/><path class="brain-detail" d="M277 112c-28 25-24 60 8 74-40 22-26 68 9 74m77-185c-18 31-8 58 22 68-24 29-8 61 16 78m73-157c-24 28-20 53 10 70-18 26-8 54 16 71m-133 5c-25-13-46 9-38 33m91-118c31-13 54 13 40 37m-14 107c18-23 52-20 63 7"/></svg><figcaption class="graph-caption">Static silhouette only. No service activity fact was supplied.</figcaption></figure>
          <div class="stack"><div><p class="eyebrow">TEXT ALTERNATIVE</p><p id="brain-summary" class="muted">Activity unavailable: this dashboard route does not receive a brain activity projection.</p></div><ul id="brain-facts" class="brain-facts"><li><strong>Projection</strong><span>unavailable</span></li><li><strong>Observed at</strong><span>not supplied</span></li><li><strong>Coverage</strong><span>unknown</span></li></ul></div>
        </div></section>
        <section id="pipeline" class="panel" aria-labelledby="pipeline-title"><div class="panel-head"><div><h3 id="pipeline-title">Pipeline signal</h3><p>Stage labels mirror service responses. No denominator means waiting or unavailable, never a percentage.</p></div><span id="pipeline-state" class="badge review">Indeterminate</span></div><div class="panel-body"><div class="pipeline-track" aria-hidden="true"><div id="pipeline-node-capture" class="pipeline-node" data-state="unknown"><strong>Capture</strong><span id="pipeline-visual-capture">Unavailable</span></div><div id="pipeline-node-atlas" class="pipeline-node" data-state="unknown"><strong>Atlas</strong><span id="pipeline-visual-atlas">Unavailable</span></div><div id="pipeline-node-dream" class="pipeline-node" data-state="unknown"><strong>Reverie</strong><span id="pipeline-visual-dream">Unavailable</span></div></div><div class="table-wrap"><table id="pipeline-table" class="data-table"><caption class="sr-only">Pipeline activity text alternative</caption><thead><tr><th>Stage</th><th>State</th><th>Units</th><th>Message</th></tr></thead><tbody><tr><th scope="row">Capture</th><td id="pipeline-capture-state" class="table-state">Unavailable</td><td id="pipeline-capture-units">unknown</td><td id="pipeline-capture-message">No projection</td></tr><tr><th scope="row">Atlas</th><td id="pipeline-atlas-state" class="table-state">Unavailable</td><td id="pipeline-atlas-units">unknown</td><td id="pipeline-atlas-message">No projection</td></tr><tr><th scope="row">Reverie</th><td id="pipeline-dream-state" class="table-state">Unavailable</td><td id="pipeline-dream-units">unknown</td><td id="pipeline-dream-message">No job selected</td></tr></tbody></table></div></div><div class="panel-foot"><span><strong>Coverage:</strong> This shell has no general activity endpoint. Known actions update only their local stage.</span></div></section>
        <div id="capture" class="two-col">
          <section class="panel" aria-labelledby="note-title"><div class="panel-head"><div><p class="eyebrow">CAPTURE</p><h3 id="note-title">Capture an observation</h3><p>Save a durable observation in the selected local scope.</p></div></div><div class="panel-body"><form id="note-form"><div class="field"><label for="note-content">Observation</label><textarea id="note-content" name="content" required aria-describedby="note-help"></textarea><small id="note-help">Keep source and context precise. The service owns provenance.</small></div><button class="button primary" type="submit">Save observation</button></form><p id="note-status" class="status-line" role="status" aria-live="polite"></p></div></section>
          <section class="panel" aria-labelledby="recall-title"><div class="panel-head"><div><p class="eyebrow">RECALL</p><h3 id="recall-title">Recall evidence</h3><p>Results show returned coverage and trace identity.</p></div></div><div class="panel-body"><form id="recall-form"><div class="field"><label for="recall-query">Query</label><input id="recall-query" name="query" required autocomplete="off"><small>Search stays bounded by the service.</small></div><button class="button secondary" type="submit">Recall evidence</button></form><p id="recall-status" class="status-line" role="status" aria-live="polite"></p><ul id="recall-results" class="result-list"><li class="empty-state">No recall run yet.</li></ul></div></section>
        </div>
        <div class="two-col">
          <section id="attunement" class="panel" aria-labelledby="attunement-title"><div class="panel-head"><div><p class="eyebrow">ATTUNEMENT</p><h3 id="attunement-title">Correct preferences</h3><p>Explicit corrections override inferred preferences. Silence does not confirm a preference.</p></div></div><div class="panel-body stack"><form id="preference-form"><div class="field"><label for="preference-origin">Origin</label><select id="preference-origin" name="origin"><option value="explicit">Stated preference</option><option value="inferred">Inferred candidate</option></select></div><div class="field"><label for="preference-statement">Preference</label><input id="preference-statement" name="statement" required></div><button class="button primary" type="submit">Create preference</button></form><button id="preferences-button" class="button secondary" type="button">Load preferences</button><ul id="preference-results" class="result-list"><li class="empty-state">Preferences not loaded.</li></ul><p id="preference-status" class="status-line" role="status" aria-live="polite"></p></div></section>
          <section id="ebb" class="panel" aria-labelledby="ebb-title"><div class="panel-head"><div><p class="eyebrow">EBB</p><h3 id="ebb-title">Activation and forgetting</h3><p>Activation fades separately from truth, validity, and retention. Revival is reversible.</p></div></div><div class="panel-body stack"><form id="ebb-form"><div class="field"><label for="ebb-record-id">Record ID</label><input id="ebb-record-id" name="record_id" required></div><div class="action-row"><button class="button secondary" type="submit">Evaluate activation</button><button id="revive-button" class="button quiet" type="button">Revive record</button></div></form><form id="forget-form"><div class="field"><label for="forget-record-id">Forget record ID</label><input id="forget-record-id" name="target_id" required></div><div class="field"><label for="forget-reason">Reason</label><input id="forget-reason" name="reason" required></div><button class="button danger" type="submit">Forget record</button></form><p id="ebb-status" class="status-line" role="status" aria-live="polite"></p></div></section>
        </div>
        <section id="lineage" class="panel trace-panel" aria-labelledby="lineage-title"><div class="panel-head"><div><p class="eyebrow">LINEAGE / TRACE</p><h3 id="lineage-title">Source and application path</h3><p>Returned Atlas edges keep source, derivation, retrieval, application, validation, and hypothetical meanings distinct.</p></div><span id="lineage-state" class="badge">Unknown</span></div><div class="panel-body"><p id="lineage-status" class="status-line" role="status" aria-live="polite">Unknown: select a resource in Atlas to inspect returned lineage.</p><ul id="lineage-results" class="relationship-list" aria-label="Lineage relationships"><li class="empty-state">No lineage projection loaded. This is not evidence that no lineage exists.</li></ul></div></section>
        <section id="chronicle" class="panel trace-panel" aria-labelledby="chronicle-title"><div class="panel-head"><div><p class="eyebrow">CHRONICLE / HISTORY</p><h3 id="chronicle-title">Revision and change history</h3><p>Chronicle rows show returned resource history without treating browsing as confirmation.</p></div><span id="chronicle-state" class="badge">Unknown</span></div><div class="panel-body"><p id="chronicle-status" class="status-line" role="status" aria-live="polite">Unknown: select a resource in Atlas to inspect returned history.</p><ol id="chronicle-results" class="result-list" aria-label="Chronicle history"><li class="empty-state">No Chronicle projection loaded. History coverage is unknown.</li></ol></div></section>
      </section>
      <section id="view-atlas" class="view-panel" data-view-panel="atlas" aria-labelledby="atlas-title" hidden>
        <header class="page-head"><div><p class="eyebrow">ATLAS / RESOURCES</p><h2 id="atlas-title">Resources I know about</h2><p class="lede">Browse stable identities, snapshots, evidence states, and bounded relationships. Similar names do not merge resources.</p></div><a class="button primary" href="#selected-inspector">Open selected inspector</a></header>
        <section id="atlas" class="panel" aria-labelledby="atlas-panel-title"><div class="panel-head"><div><h3 id="atlas-panel-title">Resource catalog</h3><p>Load the service projection. Unknown counts remain unknown.</p></div><span id="atlas-coverage" class="badge">Not loaded</span></div><div class="panel-body"><div class="action-row"><button id="atlas-button" class="button primary" type="button">Load resources</button><span class="small-copy">Bounded request: limit 100.</span></div><p id="atlas-status" class="status-line" role="status" aria-live="polite"></p><ul id="atlas-results" class="result-list"><li class="empty-state">No resource projection loaded.</li></ul><div id="atlas-detail" class="relationship-panel" aria-live="polite"></div></div></section>
        <section class="panel" aria-labelledby="atlas-boundary-title"><div class="panel-head"><div><h3 id="atlas-boundary-title">Evidence boundary</h3><p>Relationship geometry is supplemental. The explicit list remains the keyboard and assistive-technology path.</p></div></div><div class="panel-body"><ul class="provenance"><li>Referenced is not examined.</li><li>Retrieved, included, applied, and validated remain separate.</li><li>Missing or unauthorized relationship data stays unavailable.</li></ul></div></section>
      </section>
      <section id="view-lore" class="view-panel" data-view-panel="lore" aria-labelledby="lore-title" hidden>
        <header class="page-head"><div><p class="eyebrow">LORE / SOURCE-LINKED</p><h2 id="lore-title">Generated and authored knowledge</h2><p class="lede">Generated sections remain distinct from authored text. Refresh preserves manual ownership and reports returned diffs.</p></div><a class="button secondary" href="#selected-inspector">Selected context</a></header>
        <section id="lore" class="panel" aria-labelledby="lore-panel-title"><div class="panel-head"><div><h3 id="lore-panel-title">Load a Lore page</h3><p>Use selected resource context or enter an authorized resource ID.</p></div></div><div class="panel-body"><form id="lore-load-form"><div class="field"><label for="lore-resource-id">Resource ID</label><input id="lore-resource-id" name="resource_id" required></div><button class="button primary" type="submit">Load Lore</button></form><p id="lore-status" class="status-line" role="status" aria-live="polite"></p><div id="lore-results" class="stack" aria-live="polite"><p class="empty-state">No Lore page loaded.</p></div><div id="lore-diff" class="evidence-block" aria-live="polite"><strong>Diff</strong><p class="small-copy">No diff returned.</p></div></div></section>
        <section class="panel" aria-labelledby="lore-edit-title"><div class="panel-head"><div><h3 id="lore-edit-title">Authored section</h3><p>Manual edits require the current page revision.</p></div></div><div class="panel-body"><form id="lore-manual-form"><div class="field"><label for="lore-section-id">Manual section ID</label><input id="lore-section-id" name="section_id" value="manual-note" required></div><div class="field"><label for="lore-content">Manual content</label><textarea id="lore-content" name="content" required></textarea></div><input id="lore-revision" name="expected_revision" type="hidden"><button class="button primary" type="submit">Save authored section</button></form><button id="lore-refresh-button" class="button secondary" type="button">Refresh generated sections</button></div></section>
      </section>
      <section id="view-reverie" class="view-panel" data-view-panel="reverie" aria-labelledby="dream-title" hidden>
        <header class="page-head"><div><p class="eyebrow">REVERIE / DURABLE JOBS</p><h2 id="dream-title">Bounded dreaming</h2><p class="lede">Queued work preserves scope, focus, budget, outputs, and interruption state. Acknowledged work is not completed work.</p></div><a class="button secondary" href="#pulse">Back to Pulse</a></header>
        <section id="reverie" class="panel" aria-labelledby="dream-form-title"><div class="panel-head"><div><h3 id="dream-form-title">Start a bounded job</h3><p>Only service-advertised fields are submitted. Scope follows the local dashboard policy.</p></div><span id="dream-job-label" class="badge">No job selected</span></div><div class="panel-body"><form id="dream-form"><div class="field"><label for="dream-level">Level</label><select id="dream-level" name="level"><option value="snooze">Snooze</option><option value="nap">Nap</option><option value="dream">Dream</option><option value="deep_sleep">Deep Sleep</option></select></div><fieldset class="choice-grid"><legend>Modes</legend><label class="choice"><input type="checkbox" name="dream-mode" value="consolidate" checked>Consolidate</label><label class="choice"><input type="checkbox" name="dream-mode" value="associate">Associate</label><label class="choice"><input type="checkbox" name="dream-mode" value="imagine">Imagine</label><label class="choice"><input type="checkbox" name="dream-mode" value="rehearse">Rehearse</label><label class="choice"><input type="checkbox" name="dream-mode" value="reframe">Reframe</label></fieldset><div class="field"><label for="dream-focus">Focus</label><input id="dream-focus" name="focus" aria-describedby="dream-focus-help"><small id="dream-focus-help">Optional resource or focus identifier; selected context is not changed.</small></div><button class="button primary" type="submit">Queue dream</button></form><div class="action-row"><button id="dream-run-button" class="button secondary" type="button" disabled>Run bounded work</button><button id="dream-cancel-button" class="button danger" type="button" disabled>Cancel job</button></div><p id="dream-status" class="status-line" role="status" aria-live="polite"></p><ul id="dream-output" class="result-list"><li class="empty-state">No outputs returned.</li></ul></div></section>
      </section>
      <section id="view-forge" class="view-panel" data-view-panel="forge" aria-labelledby="forge-title" hidden>
        <header class="page-head"><div><p class="eyebrow">FORGE / BLUEPRINT</p><h2 id="forge-title">Scoped improvement work</h2><p class="lede">Keep strengths, problems, lessons, hypotheses, evidence, and omissions attributable to the selected resource and version.</p></div><a class="button secondary" href="#selected-inspector">Selected context</a></header>
        <section id="forge" class="panel" aria-labelledby="forge-panel-title"><div class="panel-head"><div><h3 id="forge-panel-title">Resource improvement view</h3><p>Export never patches or publishes the target.</p></div></div><div class="panel-body stack"><form id="forge-form"><div class="field"><label for="forge-resource-id">Resource ID</label><input id="forge-resource-id" name="resource_id" required></div><div class="field"><label for="forge-privacy">Privacy</label><select id="forge-privacy" name="privacy"><option value="standard">Standard</option><option value="redacted">Redacted</option></select></div><div class="field"><label for="forge-since">Delta cutoff</label><input id="forge-since" name="since" placeholder="ISO timestamp"></div><button class="button primary" type="submit">Load Forge view</button></form><div class="action-row"><button id="forge-blueprint-button" class="button secondary" type="button">Export Blueprint</button><button id="forge-dream-button" class="button quiet" type="button">Dream about selected resource</button></div><pre id="forge-results">No Forge projection loaded.</pre><p id="forge-status" class="status-line" role="status" aria-live="polite"></p></div></section>
      </section>
    </div>
    <aside class="inspector" id="selected-inspector" aria-labelledby="inspector-title">
      <div class="inspector-head"><div><p class="eyebrow">SELECTED RESOURCE</p><h2 id="inspector-title">No resource selected</h2></div><span id="inspector-state" class="badge">None</span></div>
      <div class="inspector-block"><div id="selected-inspector-badges" class="badges"><span class="badge">Awaiting selection</span></div><dl class="fact-list"><div><dt>Resource ID</dt><dd id="inspector-resource-id" class="mono">not selected</dd></div><div><dt>Version</dt><dd id="inspector-version" class="mono">unknown</dd></div><div><dt>Snapshot</dt><dd id="inspector-snapshot" class="mono">unknown</dd></div><div><dt>Scope</dt><dd id="inspector-scope">unknown</dd></div></dl></div>
      <div class="inspector-block"><h3>Evidence meaning</h3><ul id="inspector-evidence" class="provenance"><li>Source evidence stays distinct from derived or generated content.</li><li>Retrieved, included, applied, and validated facts are not inferred here.</li><li>Relationships describe links, not truth.</li></ul></div>
      <div class="inspector-block"><h3>Handoff</h3><div class="inspector-links"><a class="button quiet" href="#atlas">Open Atlas</a><a class="button quiet" href="#lore" data-handoff="lore">Open Lore</a><a class="button quiet" href="#forge" data-handoff="forge">Open Forge</a><a class="button quiet" href="#pulse">Return to Pulse</a></div></div>
      <p class="small-copy">Selecting or inspecting a resource does not confirm, reinforce, or mutate memory.</p>
    </aside>
  </div>
</main>
<dialog id="forget-dialog" aria-labelledby="forget-dialog-title" aria-describedby="forget-dialog-copy">
  <div class="dialog-body"><h2 id="forget-dialog-title">Confirm explicit forgetting</h2><p id="forget-dialog-copy">This records a forgetting request for the selected record in local scope. Controlled derivatives may need reconciliation; exported copies outside this service cannot be recalled.</p><p id="forget-dialog-target" class="mono wrap"></p><div class="action-row"><button id="forget-cancel" class="button secondary" type="button">Cancel</button><button id="forget-confirm" class="button danger" type="button">Confirm forgetting</button></div></div>
</dialog>
<dialog id="command-palette" class="palette-dialog" aria-labelledby="command-palette-title" aria-describedby="command-palette-copy">
  <div class="dialog-body"><div class="surface-header"><div><h2 id="command-palette-title">Command palette</h2><p id="command-palette-copy">Search authorized local navigation actions. Data changes stay in their existing forms.</p></div><span class="badge source">Local</span></div><div class="field"><label for="command-palette-query">Search actions</label><input id="command-palette-query" type="search" autocomplete="off" aria-controls="command-palette-results" aria-describedby="command-palette-help"><small id="command-palette-help">Type an action name, then use Arrow keys and Enter.</small></div><p id="command-palette-status" class="status-line" role="status" aria-live="polite">Open empty: type to search authorized local actions.</p><ul id="command-palette-results" class="result-list command-results" aria-label="Authorized local actions"><li class="empty-state">Type to search authorized local actions.</li></ul><div class="action-row"><button id="command-palette-recover" class="button quiet" type="button" hidden>Recover search</button><button id="command-palette-close" class="button secondary" type="button">Close</button></div></div>
</dialog>
<dialog id="theme-settings" aria-labelledby="theme-settings-title" aria-describedby="theme-settings-copy">
  <div class="dialog-body"><div class="surface-header"><div><h2 id="theme-settings-title">Theme settings</h2><p id="theme-settings-copy">Choose an installed local theme. Colour mode stays independent.</p></div><span class="badge source">Local</span></div>
    <form id="theme-settings-form"><div class="field"><label for="theme-choice">Installed theme</label><select id="theme-choice" name="theme" aria-describedby="theme-choice-help"></select><small id="theme-choice-help">Only validated themes from this Observatory are listed.</small></div>
      <p id="theme-settings-current" class="small-copy">Current selection: Cortex Tabs 1.0.0</p><p id="theme-settings-default" class="small-copy">Default: Cortex Tabs 1.0.0</p><p id="theme-settings-status" class="status-line" role="status" aria-live="polite"></p>
      <div class="action-row"><button id="theme-apply" class="button primary" type="submit">Apply theme</button><button id="theme-reset" class="button secondary" type="button">Reset to default</button><button id="theme-settings-close" class="button quiet" type="button">Close</button></div>
    </form>
  </div>
</dialog>
<script>
const byId=(id)=>document.getElementById(id);
const status=(id,text,state='neutral')=>{const region=byId(id);if(!region)return;region.textContent=text||'';region.dataset.state=text?state:'';region.setAttribute('role',state==='error'?'alert':'status')};
const setBusy=(id,busy)=>{const region=byId(id);if(region)region.setAttribute('aria-busy',busy?'true':'false')};
async function api(path,options={}){const response=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||response.statusText);return body}
const root=document.documentElement;const themeButton=byId('theme-toggle');const modes=['system','light','dark'];const nextMode=(mode)=>modes[(modes.indexOf(mode)+1)%modes.length];const setTheme=(mode)=>{root.dataset.uiColorMode=mode;themeButton.textContent='Theme: '+mode;themeButton.setAttribute('aria-label','Switch to '+nextMode(mode)+' theme');try{localStorage.setItem('noesis-color-mode',mode)}catch{}};try{const saved=localStorage.getItem('noesis-color-mode');if(modes.includes(saved))root.dataset.uiColorMode=saved}catch{};setTheme(root.dataset.uiColorMode||'system');themeButton.addEventListener('click',()=>setTheme(nextMode(root.dataset.uiColorMode||'system')));
const themeRegistryFallback={schemaVersion:'1.0',themeApi:'1',defaultTheme:'cortex-tabs',themes:[{id:'cortex-tabs',name:'Cortex Tabs',version:'1.0.0',description:'A restrained, evidence-first science-fiction theme for NOESIS Observatory.',themeApi:'1',assets:[{path:'/themes/cortex-tabs/tokens.css',contentType:'text/css; charset=utf-8'},{path:'/themes/cortex-tabs/theme.css',contentType:'text/css; charset=utf-8'},{path:'/themes/cortex-tabs/icons.svg',contentType:'image/svg+xml; charset=utf-8'}]}]};
let themeRegistry=themeRegistryFallback;let activeThemeId=root.dataset.uiTheme||themeRegistry.defaultTheme;const themeSettings=byId('theme-settings');const themeChoice=byId('theme-choice');const themeRegistryEntry=(id)=>themeRegistry.themes.find((theme)=>theme.id===id);const themeLabel=(theme)=>theme?theme.name+' '+theme.version:'unknown theme';
const setThemeStatus=(text,state='neutral')=>status('theme-settings-status',text,state);const renderThemeSettings=()=>{themeChoice.replaceChildren(...themeRegistry.themes.map((theme)=>{const option=document.createElement('option');option.value=theme.id;option.textContent=theme.name+' '+theme.version;return option}));themeChoice.value=activeThemeId;const current=themeRegistryEntry(activeThemeId);const fallback=themeRegistryEntry(themeRegistry.defaultTheme);byId('theme-settings-current').textContent='Current selection: '+themeLabel(current);byId('theme-settings-default').textContent='Default: '+themeLabel(fallback)};
const validateBrowserThemeRegistry=(candidate)=>{if(!candidate||candidate.schemaVersion!=='1.0'||candidate.themeApi!=='1'||typeof candidate.defaultTheme!=='string'||!Array.isArray(candidate.themes)||!candidate.themes.length)throw new Error('invalid registry metadata');const themes=candidate.themes.map((theme)=>{if(!theme||typeof theme.id!=='string'||!theme.name||!theme.version||theme.themeApi!=='1'||!Array.isArray(theme.assets)||!theme.assets.length)throw new Error('invalid theme metadata');const assets=theme.assets.map((asset)=>{if(!asset||typeof asset.path!=='string'||!asset.path.startsWith('/themes/'+theme.id+'/')||asset.path.includes('..')||new URL(asset.path,location.href).origin!==location.origin||new URL(asset.path,location.href).pathname!==asset.path)throw new Error('invalid theme asset path');return {path:asset.path,contentType:asset.contentType}});return {...theme,assets}});if(!themes.some((theme)=>theme.id===candidate.defaultTheme))throw new Error('invalid default theme');return {...candidate,themes}};
const loadThemeStyles=(theme)=>{const cssAssets=theme.assets.filter((asset)=>asset.path.endsWith('/tokens.css')||asset.path.endsWith('/theme.css')).sort((a,b)=>a.path.endsWith('/tokens.css')?-1:b.path.endsWith('/tokens.css')?1:0);if(cssAssets.length!==2)throw new Error('theme styles are incomplete');const links=cssAssets.map((asset)=>{const link=document.createElement('link');link.rel='stylesheet';link.href=asset.path;link.dataset.themeLink=asset.path.endsWith('/tokens.css')?'tokens':'styles';link.dataset.themeId=theme.id;return link});const previous=[...document.querySelectorAll('link[data-theme-link]')];const loaded=new Promise((resolve,reject)=>{let count=0;links.forEach((link)=>{link.onload=()=>{count+=1;if(count===links.length)resolve()};link.onerror=()=>reject(new Error('theme asset failed to load'))})});links.forEach((link)=>document.head.append(link));return loaded.then(()=>{root.dataset.uiTheme=theme.id;activeThemeId=theme.id;previous.filter((link)=>!links.includes(link)).forEach((link)=>link.remove())}).catch((error)=>{links.forEach((link)=>link.remove());throw error})};
const applyTheme=async(id,{persist=true}={})=>{const theme=themeRegistryEntry(id);if(!theme){themeChoice.value=activeThemeId;setThemeStatus('Error: theme '+id+' is unavailable. Kept '+themeLabel(themeRegistryEntry(activeThemeId))+'.','error');return false}if(id===activeThemeId){themeChoice.value=id;renderThemeSettings();if(persist)try{localStorage.setItem('noesis-theme',id)}catch{};return true}try{await loadThemeStyles(theme);if(persist)try{localStorage.setItem('noesis-theme',id)}catch{};renderThemeSettings();return true}catch(error){themeChoice.value=activeThemeId;setThemeStatus('Error: '+theme.name+' could not be activated. Kept '+themeLabel(themeRegistryEntry(activeThemeId))+'. '+error.message,'error');return false}};
const readStoredTheme=()=>{try{return localStorage.getItem('noesis-theme')}catch{return null}};const initializeTheme=async()=>{const stored=readStoredTheme();const storedFallbackValid=Boolean(stored&&themeRegistryEntry(stored));if(stored&&!storedFallbackValid)setThemeStatus('Saved theme '+stored+' is unavailable. Using '+themeLabel(themeRegistryEntry(themeRegistry.defaultTheme))+'.','warning');renderThemeSettings();try{const response=await fetch('/themes/registry.json',{headers:{accept:'application/json'}});if(!response.ok)throw new Error('registry request failed');themeRegistry=validateBrowserThemeRegistry(await response.json());renderThemeSettings();const requested=stored&&themeRegistryEntry(stored)?stored:themeRegistry.defaultTheme;await applyTheme(requested,{persist:false});if(stored&&!themeRegistryEntry(stored))setThemeStatus('Saved theme '+stored+' is unavailable. Kept '+themeLabel(themeRegistryEntry(activeThemeId))+'.','error')}catch(error){renderThemeSettings();if(stored&&!themeRegistryEntry(stored))setThemeStatus('Theme registry unavailable. Kept '+themeLabel(themeRegistryEntry(activeThemeId))+'. '+error.message,'warning')}};const openThemeSettings=()=>{renderThemeSettings();if(typeof themeSettings.showModal==='function')themeSettings.showModal();else themeSettings.setAttribute('open','');themeChoice.focus()};const closeThemeSettings=()=>{if(typeof themeSettings.close==='function'&&themeSettings.open)themeSettings.close();else themeSettings.removeAttribute('open')};byId('theme-settings-trigger').addEventListener('click',openThemeSettings);byId('theme-settings-close').addEventListener('click',closeThemeSettings);themeSettings.addEventListener('cancel',(event)=>{event.preventDefault();closeThemeSettings()});byId('theme-settings-form').addEventListener('submit',async(event)=>{event.preventDefault();const requested=themeChoice.value;const previous=activeThemeId;if(await applyTheme(requested))setThemeStatus('Applied: '+themeLabel(themeRegistryEntry(activeThemeId))+'.','success');else themeChoice.value=previous});byId('theme-reset').addEventListener('click',async()=>{if(await applyTheme(themeRegistry.defaultTheme))setThemeStatus('Reset: '+themeLabel(themeRegistryEntry(activeThemeId))+'.','success')});initializeTheme();
const tabs=[...document.querySelectorAll('[role="tab"]')];const panels=[...document.querySelectorAll('[data-view-panel]')];const sectionLinks=[...document.querySelectorAll('[data-section]')];const viewNames=new Set(['observatory','atlas','lore','reverie','forge']);const viewForHash=(hash)=>{const value=(hash||'').slice(1);return viewNames.has(value)?value:['pulse','capture','attunement','ebb'].includes(value)?'observatory':tabs.find((tab)=>tab.getAttribute('aria-selected')==='true')?.dataset.view||'observatory'};const activateView=(view,focus=false)=>{const selected=viewNames.has(view)?view:'observatory';tabs.forEach((tab)=>{const active=tab.dataset.view===selected;tab.setAttribute('aria-selected',active?'true':'false');tab.tabIndex=active?0:-1});panels.forEach((panel)=>{panel.hidden=panel.dataset.viewPanel!==selected});sectionLinks.forEach((link)=>{const current=viewForHash(link.getAttribute('href'))===selected&&((location.hash||'#pulse')===link.getAttribute('href')||selected!=='observatory'&&link.dataset.section==='pulse');link.classList.toggle('current',current);if(current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});if(focus)tabs.find((tab)=>tab.dataset.view===selected)?.focus()};tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>{location.hash='#'+tab.dataset.view});tab.addEventListener('keydown',(event)=>{const movement=event.key==='ArrowRight'?1:event.key==='ArrowLeft'?-1:event.key==='Home'?0:event.key==='End'?tabs.length-1:null;if(movement===null)return;event.preventDefault();const target=tabs[movement===0?0:movement===tabs.length-1?tabs.length-1:(index+movement+tabs.length)%tabs.length];target.focus();if(event.key==='Enter'||event.key===' ')target.click()})});window.addEventListener('hashchange',()=>{if(authenticated)activateView(viewForHash(location.hash))});sectionLinks.forEach((link)=>link.addEventListener('click',()=>{if(authenticated)setTimeout(()=>activateView(viewForHash(location.hash)),0)}));
panels.forEach((panel)=>{panel.setAttribute('role','tabpanel');panel.tabIndex=-1});
tabs.forEach((tab)=>{tab.disabled=true;tab.setAttribute('aria-disabled','true')});
let authenticated=false;const setAuthenticated=(value)=>{authenticated=value;byId('private-shell').hidden=!value;byId('pairing-panel').hidden=value;tabs.forEach((tab)=>{tab.disabled=!value;tab.setAttribute('aria-disabled',value?'false':'true')});const state=byId('connection-state');state.querySelector('.dot').className='dot '+(value?'success':'warn');state.querySelector('span:last-child').textContent=value?'Paired · local':'Pairing required';if(value){activateView(viewForHash(location.hash));byId('main-content').focus({preventScroll:true})}};
const focusableWithin=(dialog)=>[...dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter((element)=>!element.hidden&&element.getAttribute('aria-hidden')!=='true');
const trapModalFocus=(dialog)=>{dialog.addEventListener('keydown',(event)=>{if(!dialog.open||event.key!=='Tab')return;const items=focusableWithin(dialog);if(!items.length){event.preventDefault();return}const index=items.indexOf(document.activeElement);if(index<0){event.preventDefault();items[0].focus({preventScroll:true});return}if(event.shiftKey&&index===0){event.preventDefault();items.at(-1).focus({preventScroll:true})}else if(!event.shiftKey&&index===items.length-1){event.preventDefault();items[0].focus({preventScroll:true})}});document.addEventListener('focusin',(event)=>{if(dialog.open&&!dialog.contains(event.target))focusableWithin(dialog)[0]?.focus({preventScroll:true})})};
const commandPalette=byId('command-palette');const commandPaletteTrigger=byId('command-palette-trigger');const commandPaletteQuery=byId('command-palette-query');const commandPaletteResults=byId('command-palette-results');const commandPaletteRecover=byId('command-palette-recover');let commandPaletteInvoker=null;let paletteIndex=-1;const paletteActions=[{id:'pulse',label:'Open Pulse',description:'Status and open work',hash:'#pulse'},{id:'capture',label:'Open Capture and recall',description:'Capture an observation or recall evidence',hash:'#capture'},{id:'attunement',label:'Open Attunement',description:'Correct preferences',hash:'#attunement'},{id:'ebb',label:'Open Ebb',description:'Activation and forgetting',hash:'#ebb'},{id:'atlas',label:'Open Selected resource',description:'Atlas resource catalog and relationships',hash:'#atlas'},{id:'lineage',label:'Open Lineage',description:'Returned source and application edges',hash:'#lineage'},{id:'chronicle',label:'Open Chronicle',description:'Returned revision and change history',hash:'#chronicle'},{id:'lore',label:'Open Lore',description:'Generated and authored knowledge',hash:'#lore'},{id:'reverie',label:'Open Reverie',description:'Bounded durable jobs',hash:'#reverie'},{id:'forge',label:'Open Forge',description:'Scoped improvement work',hash:'#forge'}];const publicPaletteActions=[{id:'pair',label:'Pair this browser',description:'Open the local pairing form',hash:'#pairing-panel'},{id:'theme',label:'Switch theme',description:'Cycle the local theme setting',run:()=>themeButton.click()}];const availablePaletteActions=()=>authenticated?paletteActions:publicPaletteActions;const paletteButtons=()=>[...commandPaletteResults.querySelectorAll('button')];const focusPaletteResult=(index)=>{const buttons=paletteButtons();if(!buttons.length)return;paletteIndex=(index+buttons.length)%buttons.length;buttons[paletteIndex].focus({preventScroll:true})};const renderPalette=(recovery=false)=>{const query=commandPaletteQuery.value.trim().toLowerCase();const actions=availablePaletteActions().filter((action)=>!query||(action.label+' '+action.description).toLowerCase().includes(query));paletteIndex=actions.length?0:-1;commandPaletteRecover.hidden=!recovery;commandPaletteResults.replaceChildren();if(!query){status('command-palette-status',recovery?'Recovery: search reset; authorized local actions are available.':'Open empty: type to search authorized local actions.','neutral');const empty=document.createElement('li');empty.className='empty-state';empty.textContent='Open empty: type to search authorized local actions.';commandPaletteResults.append(empty);return}if(!actions.length){status('command-palette-status','No results: no authorized local actions match '+commandPaletteQuery.value+'.','warning');const empty=document.createElement('li');empty.className='empty-state';empty.textContent='No results: no authorized local actions match '+commandPaletteQuery.value+'.';commandPaletteResults.append(empty);return}status('command-palette-status','Results: '+actions.length+' authorized local action'+(actions.length===1?'':'s')+'.','success');commandPaletteResults.append(...actions.map((action)=>{const item=document.createElement('li');const button=document.createElement('button');button.type='button';button.dataset.paletteAction=action.id;button.textContent=action.label+' — '+action.description;button.addEventListener('click',()=>runPaletteAction(action));item.append(button);return item}))};const restorePaletteFocus=()=>{const target=commandPaletteInvoker;commandPaletteInvoker=null;target?.focus({preventScroll:true})};const closePalette=()=>{if(commandPalette.open&&typeof commandPalette.close==='function')commandPalette.close();else{commandPalette.removeAttribute('open');restorePaletteFocus()}};const runPaletteAction=(action)=>{try{if(action.run){closePalette();action.run();return}if(!document.querySelector(action.hash))throw new Error('target is unavailable');closePalette();location.hash=action.hash}catch(error){status('command-palette-status','Error: command action failed. '+error.message,'error');commandPaletteRecover.hidden=false;commandPaletteQuery.focus()}};const openPalette=()=>{if(commandPalette.open)return;commandPaletteInvoker=document.activeElement;commandPaletteQuery.value='';renderPalette();if(typeof commandPalette.showModal==='function')commandPalette.showModal();else commandPalette.setAttribute('open','');commandPaletteQuery.focus()};commandPaletteTrigger.addEventListener('click',openPalette);commandPaletteRecover.addEventListener('click',()=>{commandPaletteQuery.value='';renderPalette(true);commandPaletteQuery.focus()});commandPalette.addEventListener('cancel',(event)=>{event.preventDefault();closePalette()});commandPalette.addEventListener('keydown',(event)=>{if(event.key==='Escape'){event.preventDefault();closePalette();return}const buttons=paletteButtons();const activeIndex=buttons.indexOf(document.activeElement);if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();focusPaletteResult(activeIndex<0?(event.key==='ArrowUp'?buttons.length-1:0):activeIndex+(event.key==='ArrowDown'?1:-1))}else if(event.key==='Home'&&buttons.length){event.preventDefault();focusPaletteResult(0)}else if(event.key==='End'&&buttons.length){event.preventDefault();focusPaletteResult(buttons.length-1)}else if(event.key==='Enter'&&activeIndex>=0){event.preventDefault();buttons[activeIndex].click()}});commandPaletteQuery.addEventListener('input',()=>renderPalette());trapModalFocus(commandPalette);byId('observatory-title').tabIndex=-1;renderPalette();
commandPalette.addEventListener('close',restorePaletteFocus);
byId('command-palette-close').addEventListener('click',closePalette);
const traceDeepLinks=new Set(['lineage','chronicle']);const activateTraceHash=()=>{if(authenticated&&traceDeepLinks.has(location.hash.slice(1)))activateView('observatory')};window.addEventListener('hashchange',activateTraceHash);sectionLinks.filter((link)=>traceDeepLinks.has(link.dataset.section)).forEach((link)=>link.addEventListener('click',()=>setTimeout(activateTraceHash,0)));activateTraceHash();
const renderTraceSurfaces=(resource,trace)=>{const edges=Array.isArray(trace?.edges)?trace.edges:[];const chronicle=Array.isArray(trace?.chronicle)?trace.chronicle:[];const limit=Number.isInteger(trace?.coverage?.limit)?trace.coverage.limit:null;const partial=limit!==null&&(edges.length>=limit||chronicle.length>=limit);const boundedNote=partial?' Partial: trace limit '+limit+' may omit additional entries; continuation not supplied.':'';const lineageState=edges.length?(partial?'Partial':'Returned'):'Unknown';const chronicleState=chronicle.length?(partial?'Partial':'Returned'):'Unknown';const lineageTone=edges.length?(partial?'warning':'success'):'warning';const chronicleTone=chronicle.length?(partial?'warning':'success'):'warning';byId('lineage-state').textContent=lineageState;status('lineage-status',edges.length?lineageState+': '+edges.length+' lineage relationships returned.'+boundedNote:'Unknown: no lineage relationships returned; absence is not established.',lineageTone);const lineageList=byId('lineage-results');lineageList.replaceChildren(...(edges.length?edges.map((edge)=>{const item=document.createElement('li');const copy=document.createElement('div');const strong=document.createElement('strong');strong.textContent=(edge.from_id||'unknown')+'@'+(edge.from_revision??'unknown')+' → '+(edge.to_id||'unknown')+'@'+(edge.to_revision??'unknown');const detail=document.createElement('span');detail.textContent='Returned edge; source revision '+(edge.from_revision??'unknown')+'.';copy.append(strong,detail);const relation=document.createElement('span');relation.className='edge-label';relation.textContent=edge.edge_kind||'unknown relation';item.append(copy,relation);return item}):[Object.assign(document.createElement('li'),{className:'empty-state',textContent:'No lineage relationships returned. This is not evidence that no lineage exists.'})]));byId('chronicle-state').textContent=chronicleState;status('chronicle-status',chronicle.length?chronicleState+': '+chronicle.length+' history events returned.'+boundedNote:'Unknown: no Chronicle events returned; history coverage is not established.',chronicleTone);const chronicleList=byId('chronicle-results');chronicleList.replaceChildren(...(chronicle.length?chronicle.map((event)=>{const item=document.createElement('li');const heading=document.createElement('strong');heading.textContent=event.event_kind||'unknown event';const detail=document.createElement('p');detail.className='small-copy';detail.textContent=(event.observed_at||'time unknown')+' · subject '+(event.subject_id||resource.resource_id||'unknown')+(/conflict|dispute/i.test(String(event.event_kind||''))?' · conflict/dispute recorded':'');item.append(heading,detail);return item}):[Object.assign(document.createElement('li'),{className:'empty-state',textContent:'No Chronicle events returned. History coverage is unknown.'})]))};
const updatePipeline=(stage,state,message,units='unknown')=>{const safeState=state||'unknown';const stateCell=byId('pipeline-'+stage+'-state');const unitsCell=byId('pipeline-'+stage+'-units');const messageCell=byId('pipeline-'+stage+'-message');const visual=byId('pipeline-visual-'+stage);const node=byId('pipeline-node-'+stage);if(stateCell)stateCell.textContent=safeState;if(unitsCell)unitsCell.textContent=units;if(messageCell)messageCell.textContent=message||'No message';if(visual)visual.textContent=safeState;if(node){node.dataset.state=safeState==='waiting'?'waiting':safeState==='unknown'||safeState==='unavailable'?'unknown':'known'}const all=[...document.querySelectorAll('[id^="pipeline-"][id$="-state"]:not(#pipeline-state)')].map((cell)=>cell.textContent);byId('pipeline-state').textContent=all.every((value)=>value==='Unavailable'||value==='unknown')?'Indeterminate':'Updated';};
const updateBrain=(summary,facts)=>{byId('brain-summary').textContent=summary;const list=byId('brain-facts');list.replaceChildren(...facts.map((fact)=>{const item=document.createElement('li');const name=document.createElement('strong');name.textContent=fact[0];const value=document.createElement('span');value.textContent=fact[1];item.append(name,value);return item}))};
const formatScope=(scope)=>scope?.scope_id||scope?.project_id||'scope unavailable';const setSelectedContext=(resource)=>{if(!resource)return;const id=resource.resource_id||'unknown resource';const name=resource.display_name||id;const snapshot=resource.snapshots?.at(-1)||null;const version=snapshot?.version||'version unknown';const digest=snapshot?.digest?'sha256:'+snapshot.digest:'snapshot unknown';const scope=formatScope(resource.scope);byId('context-icon').textContent=name.slice(0,1).toUpperCase();byId('selected-resource-name').textContent=name;byId('selected-resource-scope').textContent=(resource.kind||'resource')+' · '+scope;byId('selected-resource-version').textContent=version;byId('selected-resource-id').textContent='id: '+id;byId('selected-resource-scope-chip').textContent='scope: '+scope;byId('inspector-title').textContent=name;byId('inspector-state').textContent='Selected';byId('inspector-resource-id').textContent=id;byId('inspector-version').textContent=version;byId('inspector-snapshot').textContent=digest;byId('inspector-scope').textContent=scope;byId('selected-inspector-badges').replaceChildren(...[resource.kind,resource.origin_facet].filter(Boolean).map((value)=>{const badge=document.createElement('span');badge.className='badge source';badge.textContent=value;return badge}));const states=resource.states||[];const evidence=byId('inspector-evidence');evidence.replaceChildren(...(states.length?states.map((state)=>{const item=document.createElement('li');item.textContent=state.state_kind+': '+state.state;return item}):[Object.assign(document.createElement('li'),{textContent:'Evidence states not computed.'})]));['forge-resource-id','lore-resource-id'].forEach((idName)=>{const input=byId(idName);if(input&&!input.value)input.value=id})};
const renderRelationship=(resource,trace)=>{renderTraceSurfaces(resource,trace);const rawEdges=trace.edges||[];const edges=rawEdges.slice(0,48);const list=byId('relationship-list');const visual=byId('relationship-visual');const summary=byId('relationship-summary');list.replaceChildren();if(!edges.length){summary.textContent='No relationships returned for selected resource; visual field unavailable.';visual.hidden=true;const empty=document.createElement('li');empty.className='empty-state';empty.textContent='No relationships returned. This is distinct from unknown coverage.';list.append(empty);return}const ids=[resource.resource_id,...edges.flatMap((edge)=>[edge.from_id,edge.to_id]).filter(Boolean)];const allNodes=[...new Set(ids)];const nodes=allNodes.slice(0,24);const positions=new Map(nodes.map((id,index)=>[id,{x:index===0?320:80+((index-1)%4)*145,y:index===0?125:54+Math.floor((index-1)/4)*86}]));visual.hidden=false;visual.replaceChildren();edges.forEach((edge)=>{const from=positions.get(edge.from_id);const to=positions.get(edge.to_id);if(!from||!to)return;const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1',from.x);line.setAttribute('y1',from.y);line.setAttribute('x2',to.x);line.setAttribute('y2',to.y);visual.append(line)});nodes.forEach((id)=>{const point=positions.get(id);const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('cx',point.x);circle.setAttribute('cy',point.y);circle.setAttribute('r',id===resource.resource_id?'18':'13');visual.append(circle);const text=document.createElementNS('http://www.w3.org/2000/svg','text');text.setAttribute('x',point.x);text.setAttribute('y',point.y+34);text.setAttribute('text-anchor','middle');text.textContent=id.length>22?id.slice(0,19)+'…':id;visual.append(text)});const omittedNodes=Math.max(0,allNodes.length-nodes.length);const omittedEdges=Math.max(0,rawEdges.length-edges.length);summary.textContent=nodes.length+' bounded nodes; '+edges.length+' returned relationships'+(omittedNodes?' ('+omittedNodes+' nodes omitted)':'')+(omittedEdges?' ('+omittedEdges+' relationships omitted)':'')+'. Geometry has no semantic distance.';list.append(...edges.map((edge)=>{const item=document.createElement('li');const copy=document.createElement('div');const strong=document.createElement('strong');strong.textContent=(edge.from_id||'unknown')+' → '+(edge.to_id||'unknown');const detail=document.createElement('span');detail.textContent='source revision '+(edge.from_revision??'unknown');copy.append(strong,detail);const relation=document.createElement('span');relation.className='edge-label';relation.textContent=edge.edge_kind||'unknown relation';item.append(copy,relation);return item}))};
const showResource=async(resource)=>{setBusy('atlas-status',true);status('atlas-status','Loading: selected resource and trace.','neutral');try{const [detail,trace]=await Promise.all([api('/api/resources/'+encodeURIComponent(resource.resource_id)),api('/api/trace/'+encodeURIComponent(resource.resource_id))]);setSelectedContext(detail);const target=byId('atlas-detail');target.replaceChildren();const heading=document.createElement('h3');heading.textContent=detail.display_name+' ['+detail.kind+']';const summary=document.createElement('p');summary.className='muted';summary.textContent='Snapshots: '+(detail.snapshots?.length??'unknown')+'; states: '+(detail.states?.map((state)=>state.state_kind+'='+state.state).join(', ')||'not computed')+'; history: '+(trace.chronicle?.length??'unknown')+' events.';const snapshots=document.createElement('ul');snapshots.className='result-list';snapshots.setAttribute('aria-label','Resource snapshots');const snapshotData=detail.snapshots||[];snapshots.append(...(snapshotData.length?snapshotData.map((snapshot)=>{const item=document.createElement('li');item.textContent=(snapshot.version||'unknown version')+' '+(snapshot.digest||'no digest')+' ['+(snapshot.status||'status unknown')+']';return item}):[Object.assign(document.createElement('li'),{className:'empty-state',textContent:'No snapshots returned; snapshot coverage is unknown.'})]));const field=document.createElement('div');field.className='relationship-panel';const title=document.createElement('h4');title.textContent='Bounded relationship field';const fieldSummary=document.createElement('p');fieldSummary.id='relationship-summary';fieldSummary.className='small-copy';const visual=document.createElementNS('http://www.w3.org/2000/svg','svg');visual.id='relationship-visual';visual.classList.add('relationship-visual');visual.setAttribute('viewBox','0 0 640 250');visual.setAttribute('aria-hidden','true');const relationList=document.createElement('ul');relationList.id='relationship-list';relationList.className='relationship-list';field.append(title,fieldSummary,visual,relationList);target.append(heading,summary,snapshots,field);renderRelationship(detail,trace);status('atlas-status','Complete: selected '+detail.display_name+'; scope and version remain pinned.','success')}catch(error){status('atlas-status','Error: Atlas selection failed. '+error.message,'error')}finally{setBusy('atlas-status',false)}};
document.getElementById('pair-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('pair-status',true);status('pair-status','Pairing: checking one-use code.','neutral');try{await api('/pair',{method:'POST',body:JSON.stringify({code:event.target.code.value})});status('pair-status','Paired: private data is available.','success');setAuthenticated(true);byId('pair-code').value='';byId('observatory-title').focus({preventScroll:true})}catch(error){status('pair-status','Error: pairing failed. '+error.message,'error')}finally{setBusy('pair-status',false)}});
document.getElementById('note-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('note-status',true);status('note-status','Saving: observation is being accepted by the service.','neutral');try{await api('/api/note',{method:'POST',body:JSON.stringify({content:event.target.content.value})});event.target.reset();status('note-status','Complete: observation accepted by the service.','success');updatePipeline('capture','accepted','Observation accepted');updateBrain('Known local action: observation accepted. No activity projection was returned.',[['Event','observation accepted'],['Projection','not supplied'],['Coverage','unknown']])}catch(error){status('note-status','Error: observation was not saved. '+error.message,'error')}finally{setBusy('note-status',false)}});
document.getElementById('recall-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('recall-status',true);status('recall-status','Loading: bounded recall query.','neutral');try{const body=await api('/api/recall?query='+encodeURIComponent(event.target.query.value));const list=byId('recall-results');const data=body.data||[];list.replaceChildren(...(data.length?data.map((hit)=>{const item=document.createElement('li');item.textContent=hit.statement+' ['+hit.record_id+'@'+hit.revision+']';return item}):[Object.assign(document.createElement('li'),{className:'empty-state',textContent:'No matching records returned.'})]));const coverage=body.coverage||{};const omitted=coverage.omitted;const omittedDetails=omitted===null||omitted===undefined?'unknown':typeof omitted==='object'?Object.entries(omitted).filter(([,count])=>Number.isFinite(count)&&count>0).map(([reason,count])=>reason+' '+count).join(', ')||'none reported':String(omitted);const omittedTotal=omitted&&typeof omitted==='object'?Object.values(omitted).filter((count)=>Number.isFinite(count)).reduce((total,count)=>total+count,0):omitted;const omittedText=(omittedTotal===null||omittedTotal===undefined?'unknown':String(omittedTotal))+' omitted'+(omittedDetails&&omittedDetails!=='unknown'?' ('+omittedDetails+')':'');const coverageState=coverage.truncated===true?'Partial':coverage.truncated===false?'Complete':'Unknown';const continuation=coverage.continuation===null||coverage.continuation===undefined?'not supplied':String(coverage.continuation);const tone=coverageState==='Complete'?'success':'warning';status('recall-status',coverageState+': '+(coverage.included??'unknown')+' included of '+(coverage.matched??'unknown')+' matched; '+omittedText+'; continuation '+continuation+'; '+(body.usage?.duration_ms??'unknown')+' ms; trace '+(body.trace_id||'unknown')+'.',tone)}catch(error){status('recall-status','Error: recall failed. '+error.message,'error')}finally{setBusy('recall-status',false)}});
let activeDream=null;const setDreamButtons=(enabled)=>{byId('dream-run-button').disabled=!enabled;byId('dream-cancel-button').disabled=!enabled};const renderDream=(body)=>{activeDream=body.job_id||activeDream;const state=body.state||'unknown';const progress=body.progress;const parts=['State: '+state];if(progress&&Number.isFinite(progress.completed)&&Number.isFinite(progress.total))parts.push('units '+progress.completed+'/'+progress.total);if(body.budget?.max_records!==undefined)parts.push('budget '+body.budget.max_records);if(activeDream)parts.push('job '+activeDream);status('dream-status',parts.join('; ')+'.',state==='failed'?'error':state==='completed'?'success':state==='waiting'?'warning':'neutral');byId('dream-job-label').textContent=activeDream?'Job '+activeDream:'No job selected';const list=byId('dream-output');const outputs=body.outputs||[];list.replaceChildren(...(outputs.length?outputs.map((output)=>{const item=document.createElement('li');item.textContent=output.type==='maintenance_receipt'?'Observation maintenance: '+output.status:((output.record_type||'hypothesis')+' ['+(output.payload?.epistemic_status||'hypothesis')+'] '+(output.payload?.statement||''));return item}):[Object.assign(document.createElement('li'),{className:'empty-state',textContent:'No outputs returned for this state.'})]));updatePipeline('dream',state,state==='waiting'?'Waiting: service supplied no known denominator.':'Service state: '+state);updateBrain('Known Reverie state: '+state+'. Activity outside this job is not inferred.',[['Job',activeDream||'unknown'],['State',state],['Progress',progress&&Number.isFinite(progress.completed)&&Number.isFinite(progress.total)?progress.completed+'/'+progress.total:'indeterminate']]);setDreamButtons(Boolean(activeDream)&&!['cancelled','completed','failed'].includes(state));try{if(activeDream)localStorage.setItem('noesis-active-dream',activeDream)}catch{}};document.getElementById('dream-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('dream-status',true);try{const modes=[...document.querySelectorAll('input[name="dream-mode"]:checked')].map((input)=>input.value);if(!modes.length)throw new Error('select at least one dream mode');const body=await api('/api/dream',{method:'POST',body:JSON.stringify({level:event.target.level.value,modes,focus:event.target.focus.value||null})});renderDream(body)}catch(error){status('dream-status','Error: Reverie job was not queued. '+error.message,'error')}finally{setBusy('dream-status',false)}});document.getElementById('dream-run-button').addEventListener('click',async()=>{if(!activeDream)return;setBusy('dream-status',true);try{renderDream(await api('/api/dream/'+encodeURIComponent(activeDream)+'/run',{method:'POST',body:JSON.stringify({max_records:100})}))}catch(error){status('dream-status','Error: job run failed. '+error.message,'error')}finally{setBusy('dream-status',false)}});document.getElementById('dream-cancel-button').addEventListener('click',async()=>{if(!activeDream)return;setBusy('dream-status',true);try{renderDream(await api('/api/dream/'+encodeURIComponent(activeDream)+'/cancel',{method:'POST',body:'{}'}));setDreamButtons(false);try{localStorage.removeItem('noesis-active-dream')}catch{}}catch(error){status('dream-status','Error: job cancel failed. '+error.message,'error')}finally{setBusy('dream-status',false)}});
document.getElementById('preferences-button').addEventListener('click',()=>{setBusy('preference-status',true);status('preference-status','Loading: preferences.','neutral');loadPreferences().then(()=>status('preference-status','Complete: preferences loaded.','success')).catch((error)=>status('preference-status','Error: preferences failed. '+error.message,'error')).finally(()=>setBusy('preference-status',false))});const loadPreferences=async()=>{const body=await api('/api/preferences');const list=byId('preference-results');const data=body.data||[];list.replaceChildren(...(data.length?data.map((preference)=>{const item=document.createElement('li');const copy=document.createElement('div');copy.textContent=preference.origin+' ['+preference.state+']: '+preference.statement;const form=document.createElement('form');form.className='action-row';const label=document.createElement('label');label.className='sr-only';label.textContent='Correct preference '+preference.preference_id;const input=document.createElement('input');input.name='statement';input.required=true;input.value=preference.statement;input.setAttribute('aria-label','Correct preference '+preference.preference_id);const button=document.createElement('button');button.className='button small secondary';button.type='submit';button.textContent='Correct';form.append(label,input,button);form.addEventListener('submit',async(event)=>{event.preventDefault();try{await api('/api/preferences/'+encodeURIComponent(preference.preference_id)+'/correct',{method:'POST',body:JSON.stringify({statement:input.value})});status('preference-status','Complete: preference corrected.','success');await loadPreferences()}catch(error){status('preference-status','Error: preference correction failed. '+error.message,'error')}});item.append(copy,form);return item}):[Object.assign(document.createElement('li'),{className:'empty-state',textContent:'No preferences returned. Zero and unavailable remain distinct.'})]))};
document.getElementById('preference-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('preference-status',true);try{await api('/api/preferences',{method:'POST',body:JSON.stringify({origin:event.target.origin.value,statement:event.target.statement.value})});event.target.reset();status('preference-status','Complete: preference recorded.','success');await loadPreferences()}catch(error){status('preference-status','Error: preference was not recorded. '+error.message,'error')}finally{setBusy('preference-status',false)}});
document.getElementById('ebb-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('ebb-status',true);try{const body=await api('/api/ebb/'+encodeURIComponent(event.target.record_id.value)+'/evaluate',{method:'POST',body:JSON.stringify({now:new Date().toISOString()})});status('ebb-status','Complete: activation evaluated at '+body.score+'.','success')}catch(error){status('ebb-status','Error: activation evaluation failed. '+error.message,'error')}finally{setBusy('ebb-status',false)}});
document.getElementById('revive-button').addEventListener('click',async()=>{const record_id=byId('ebb-record-id').value;if(!record_id){status('ebb-status','Error: enter a record ID before revival.','error');byId('ebb-record-id').focus();return}setBusy('ebb-status',true);try{const body=await api('/api/ebb/'+encodeURIComponent(record_id)+'/revive',{method:'POST',body:JSON.stringify({score:1})});status('ebb-status','Complete: record revived at '+body.score+'.','success')}catch(error){status('ebb-status','Error: revival failed. '+error.message,'error')}finally{setBusy('ebb-status',false)}});
let pendingForget=null;const forgetDialog=byId('forget-dialog');const closeForget=()=>{pendingForget=null;if(forgetDialog.open)forgetDialog.close();byId('forget-record-id').focus()};document.getElementById('forget-form').addEventListener('submit',(event)=>{event.preventDefault();pendingForget={target_id:event.target.target_id.value,reason:event.target.reason.value};byId('forget-dialog-target').textContent='Target: '+pendingForget.target_id+' · Reason: '+pendingForget.reason;if(typeof forgetDialog.showModal==='function'){forgetDialog.showModal();byId('forget-cancel').focus()}else if(window.confirm('Confirm explicit forgetting for '+pendingForget.target_id+'?'))byId('forget-confirm').click()});byId('forget-cancel').addEventListener('click',closeForget);byId('forget-confirm').addEventListener('click',async()=>{if(!pendingForget)return;const request=pendingForget;setBusy('ebb-status',true);try{const body=await api('/api/forget',{method:'POST',body:JSON.stringify(request)});status('ebb-status','Complete: forgetting recorded for '+body.target_id+'.','success');closeForget()}catch(error){status('ebb-status','Error: forgetting failed. '+error.message,'error')}finally{setBusy('ebb-status',false)}});forgetDialog.addEventListener('cancel',(event)=>event.preventDefault());
trapModalFocus(forgetDialog);
document.getElementById('atlas-button').addEventListener('click',async()=>{setBusy('atlas-status',true);status('atlas-status','Loading: bounded resource catalog.','neutral');try{const body=await api('/api/resources?limit=100');const list=byId('atlas-results');const data=body.data||[];const coverage=body.coverage||{};byId('atlas-coverage').textContent=(coverage.returned??'unknown')+' returned · total '+(coverage.total??'unknown');list.replaceChildren(...(data.length?data.map((resource)=>{const item=document.createElement('li');const button=document.createElement('button');button.type='button';button.textContent=resource.display_name+' ['+resource.kind+' / '+resource.origin_facet+']';button.setAttribute('aria-label','Open resource '+resource.display_name+' ['+resource.resource_id+']');button.addEventListener('click',()=>showResource(resource));item.append(button);return item}):[Object.assign(document.createElement('li'),{className:'empty-state',textContent:'No resources returned. The catalog is empty or the projection is unavailable.'})]));updatePipeline('atlas','completed','Resource catalog returned '+(coverage.returned??'unknown')+' rows');status('atlas-status','Complete: '+(coverage.returned??'unknown')+' resources returned; coverage total '+(coverage.total??'unknown')+'.','success')}catch(error){status('atlas-status','Error: Atlas catalog failed. '+error.message,'error')}finally{setBusy('atlas-status',false)}});
let activeLoreResource=null;const renderLore=(page,diff=null)=>{activeLoreResource=page.page_id.slice('resource:'.length);byId('lore-revision').value=page.revision;const currentContextId=byId('selected-resource-id').textContent.replace(/^id: /,'');if(currentContextId==='not selected'||currentContextId!==activeLoreResource)setSelectedContext({resource_id:activeLoreResource,display_name:page.title||activeLoreResource,kind:'resource',scope:null});const target=byId('lore-results');target.replaceChildren(...((page.sections||[]).length?page.sections.map((section)=>{const item=document.createElement('article');item.className='evidence-block';const heading=document.createElement('h3');heading.textContent=section.section_id+' ['+section.ownership+(section.stale?' / stale':'')+']';const content=document.createElement('p');content.textContent=section.content||'';item.append(heading,content);return item}):[Object.assign(document.createElement('p'),{className:'empty-state',textContent:'No Lore sections returned.'})]));const diffTarget=byId('lore-diff');diffTarget.replaceChildren();const diffHeading=document.createElement('strong');diffHeading.textContent='Diff';diffTarget.append(diffHeading);const changes=Array.isArray(diff)?diff:[];const diffText=document.createElement('p');diffText.className='small-copy';diffText.textContent=diff===null?'No diff returned for this read.':changes.length?changes.map((change)=>change.section_id+' changed').join('; '):'No section changes returned.';diffTarget.append(diffText)};const loadLore=async()=>{const id=byId('lore-resource-id').value;if(!id)throw new Error('resource id is required');renderLore(await api('/api/lore/'+encodeURIComponent(id)))};document.getElementById('lore-load-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('lore-status',true);try{await loadLore();status('lore-status','Complete: Lore loaded.','success')}catch(error){status('lore-status','Error: Lore load failed. '+error.message,'error')}finally{setBusy('lore-status',false)}});document.getElementById('lore-manual-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('lore-status',true);try{if(!activeLoreResource)await loadLore();const body=await api('/api/lore/'+encodeURIComponent(activeLoreResource)+'/manual',{method:'POST',body:JSON.stringify({section_id:event.target.section_id.value,content:event.target.content.value,expected_revision:Number(event.target.expected_revision.value)})});renderLore(body.page,body.diff);status('lore-status','Complete: authored section saved; returned diff rendered.','success')}catch(error){status('lore-status','Error: authored section was not saved. '+error.message,'error')}finally{setBusy('lore-status',false)}});document.getElementById('lore-refresh-button').addEventListener('click',async()=>{setBusy('lore-status',true);try{if(!activeLoreResource)await loadLore();const body=await api('/api/lore/'+encodeURIComponent(activeLoreResource)+'/refresh',{method:'POST',body:'{}'});renderLore(body.page,body.diff);status('lore-status','Complete: generated sections refreshed; returned diff rendered.','success')}catch(error){status('lore-status','Error: Lore refresh failed. '+error.message,'error')}finally{setBusy('lore-status',false)}});
let activeForgeResource=null;const loadForge=async()=>{const form=byId('forge-form');const id=form.resource_id.value;if(!id)throw new Error('resource id is required');activeForgeResource=id;const body=await api('/api/forge/'+encodeURIComponent(id));byId('forge-results').textContent=JSON.stringify({resource_id:body.resource_id,version:body.version,findings:body.findings.length,lessons:body.lessons.length,hypotheses:body.hypotheses.length,reproduction_cases:body.reproduction_cases.length,coverage:body.coverage},null,2);return body};document.getElementById('forge-form').addEventListener('submit',async(event)=>{event.preventDefault();setBusy('forge-status',true);try{await loadForge();status('forge-status','Complete: Forge view loaded.','success')}catch(error){status('forge-status','Error: Forge load failed. '+error.message,'error')}finally{setBusy('forge-status',false)}});document.getElementById('forge-blueprint-button').addEventListener('click',async()=>{setBusy('forge-status',true);try{if(!activeForgeResource)await loadForge();const privacy=byId('forge-privacy').value;const since=byId('forge-since').value;const query=new URLSearchParams({privacy});if(since)query.set('since',since);const body=await api('/api/blueprint/'+encodeURIComponent(activeForgeResource)+'?'+query);byId('forge-results').textContent=body.markdown;status('forge-status','Complete: Blueprint exported without patching the resource.','success')}catch(error){status('forge-status','Error: Blueprint export failed. '+error.message,'error')}finally{setBusy('forge-status',false)}});document.getElementById('forge-dream-button').addEventListener('click',async()=>{setBusy('forge-status',true);try{if(!activeForgeResource)await loadForge();const body=await api('/api/dream',{method:'POST',body:JSON.stringify({level:'dream',modes:['consolidate'],focus:{resource_id:activeForgeResource}})});activeDream=body.job_id;renderDream(body);status('forge-status','Queued: focused dream '+body.job_id+'.','success')}catch(error){status('forge-status','Error: focused dream was not queued. '+error.message,'error')}finally{setBusy('forge-status',false)}});
document.querySelectorAll('[data-handoff]').forEach((link)=>link.addEventListener('click',()=>{const id=byId('selected-resource-id').textContent.replace(/^id: /,'');if(id&&id!=='not selected')byId(link.dataset.handoff==='lore'?'lore-resource-id':'forge-resource-id').value=id}));
document.getElementById('context-detail-button').addEventListener('click',()=>{if(authenticated){activateView(viewForHash(location.hash));setTimeout(()=>byId('inspector-title').focus?.(),0)}});
const restoreDream=async()=>{let stored=null;try{stored=localStorage.getItem('noesis-active-dream')}catch{}if(!stored)return;activeDream=stored;setBusy('dream-status',true);status('dream-status','Loading: durable Reverie job '+stored+'.','neutral');try{renderDream(await api('/api/dream/'+encodeURIComponent(stored)))}catch(error){status('dream-status','Unavailable: saved job '+stored+' could not be read. '+error.message,'error')}finally{setBusy('dream-status',false)}};const checkPairing=async()=>{try{await api('/api/capabilities');setAuthenticated(true);await restoreDream()}catch(error){setAuthenticated(false);if(error.message&&error.message!=='pairing required')status('pair-status','Unavailable: pairing state could not be checked. '+error.message,'warning')}};checkPairing();
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

export function createRequestHandler({ service, pairing, atlas = createAtlas(service.store), adaptation = createAdaptation(service.store), themeRegistry = loadThemeRegistry() }) {
  const principal = { owner_id: "local", scope_ids: [] };
  const activeThemeRegistry = (() => {
    try { return validateThemeRegistry(themeRegistry); } catch { return loadThemeRegistry(); }
  })();
  const publicThemes = publicThemeRegistry(activeThemeRegistry);
  const themeAssets = new Map(activeThemeRegistry.themes.flatMap((theme) => theme.assets.map((asset) => [`/themes/${asset.path}`, asset])));
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
      const rawPath = String(request.url ?? "").split("?", 1)[0];
      if (rawPath.startsWith("/themes/")) {
        let decodedPath = rawPath;
        try { decodedPath = decodeURIComponent(rawPath); } catch { return sendJson(response, 404, { error: "not found" }); }
        if (decodedPath.split("/").some((segment) => segment === "." || segment === ".." || segment.includes("\\"))) return sendJson(response, 404, { error: "not found" });
      }
      if (url.pathname === "/themes/registry.json") {
        if (request.method !== "GET") return sendJson(response, 405, { error: "method not allowed" });
        return sendJson(response, 200, publicThemes, { "cache-control": "no-store" });
      }
      if (url.pathname.startsWith("/themes/")) {
        if (request.method !== "GET") return sendJson(response, 405, { error: "method not allowed" });
        const asset = themeAssets.get(url.pathname);
        if (!asset) return sendJson(response, 404, { error: "not found" });
        try {
          response.writeHead(200, { "content-type": asset.contentType, "cache-control": "no-cache", "x-content-type-options": "nosniff" });
          return response.end(readFileSync(asset.filePath));
        } catch {
          return sendJson(response, 404, { error: "not found" });
        }
      }
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
      const applyTaskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/apply$/);
      if (applyTaskMatch && request.method === "POST") {
        const resource_id = decodeURIComponent(applyTaskMatch[1]);
        const resource = atlas.inspect({ principal, resource_id });
        const body = await readBody(request);
        service.mindInspect({ principal, record_id: body.hypothesis_id });
        return sendJson(response, 200, service.mindApply({
          principal,
          scope: resource.scope,
          hypothesis_id: body.hypothesis_id,
          resource_id,
          producer_id: "dashboard",
          idempotency_key: body.idempotency_key ?? `dashboard-task-apply:${resource_id}:${body.hypothesis_id}:${Date.now()}`,
        }));
      }
      const outcomeTaskMatch = url.pathname.match(/^\/api\/tasks\/([^/]+)\/outcome$/);
      if (outcomeTaskMatch && request.method === "POST") {
        const resource_id = decodeURIComponent(outcomeTaskMatch[1]);
        const resource = atlas.inspect({ principal, resource_id });
        const body = await readBody(request);
        service.mindInspect({ principal, record_id: body.application_id });
        return sendJson(response, 200, service.mindOutcome({
          principal,
          scope: resource.scope,
          application_id: body.application_id,
          resource_id,
          statement: body.statement,
          outcome_status: body.outcome_status,
          producer_id: "dashboard",
          idempotency_key: body.idempotency_key ?? `dashboard-task-outcome:${resource_id}:${body.application_id}:${Date.now()}`,
        }));
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
        const revision = url.searchParams.get("revision");
        const max_bytes = url.searchParams.get("max_bytes");
        return sendJson(response, 200, service.mindInspect({ principal, record_id, revision: revision === null ? null : Number(revision), max_bytes: max_bytes === null ? null : Number(max_bytes), cursor: url.searchParams.get("cursor") }));
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

