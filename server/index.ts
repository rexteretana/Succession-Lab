import caseLibraryJsonl from "../public/cases/philippine-succession-cases.jsonl";
import advancedLibraryJsonl from "../public/cases/advanced-succession-mastery-15.jsonl";
import example16Jsonl from "../public/cases/example-16-mercado-two-marriages.jsonl";
import concurringSecondaryJsonl from "../public/cases/examples-17-20-concurring-secondary-heirs.jsonl";
import appHtml from "../dist/index.html";
import appJavaScript from "../dist/assets/app.js";
import appCss from "../dist/assets/index.css";

function contentFingerprint(content: string) {
  let hash = 2166136261;
  for (let index = 0; index < content.length; index += 1) {
    hash ^= content.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

const assetVersion = `${contentFingerprint(appJavaScript)}-${contentFingerprint(appCss)}`;
const cacheBustedHtml = appHtml
  .replace('src="/assets/app.js"', `src="/assets/app.js?v=${assetVersion}"`)
  .replace('href="/assets/index.css"', `href="/assets/index.css?v=${assetVersion}"`);

interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

type StoredCase = {
  id: string;
  title: string;
  source?: { grNo?: string; date?: string };
};

function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function appAsset(body: string, contentType: string, cacheControl: string) {
  return new Response(body, { headers: { "Content-Type": contentType, "Cache-Control": cacheControl } });
}

function isStoredCase(value: unknown): value is StoredCase {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<StoredCase>;
  return typeof item.id === "string" && item.id.length > 0 && typeof item.title === "string" && item.title.length > 0;
}

function parseBundledCases(source: string) {
  return source.split(/\r?\n/).flatMap((line) => {
    if (!line.trim()) return [];
    try {
      const item: unknown = JSON.parse(line);
      return isStoredCase(item) ? [item] : [];
    } catch {
      return [];
    }
  });
}

const bundledCases = [
  ...parseBundledCases(advancedLibraryJsonl),
  ...parseBundledCases(example16Jsonl),
  ...parseBundledCases(concurringSecondaryJsonl),
];

async function seedMissingBundledCases(env: Env) {
  const now = Date.now();
  const statements = bundledCases.map((item) => env.DB.prepare(`
    INSERT OR IGNORE INTO cases (id, title, gr_no, decision_date, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(item.id, item.title, item.source?.grNo ?? null, item.source?.date ?? null, JSON.stringify(item), now, now));
  if (statements.length) await env.DB.batch(statements);
}

async function saveCases(cases: StoredCase[], env: Env) {
  const now = Date.now();
  const statements = cases.map((item) => env.DB.prepare(`
    INSERT INTO cases (id, title, gr_no, decision_date, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      gr_no = excluded.gr_no,
      decision_date = excluded.decision_date,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at
  `).bind(item.id, item.title, item.source?.grNo ?? null, item.source?.date ?? null, JSON.stringify(item), now, now));
  if (statements.length) await env.DB.batch(statements);
}

async function casesApi(request: Request, env: Env) {
  if (request.method === "GET") {
    await seedMissingBundledCases(env);
    const result = await env.DB.prepare("SELECT payload_json FROM cases ORDER BY decision_date DESC, title COLLATE NOCASE").all<{ payload_json: string }>();
    let cases = result.results.flatMap((row) => {
      try { return [JSON.parse(row.payload_json)]; } catch { return []; }
    });
    if (!cases.length) cases = bundledCases;
    return json({ cases });
  }

  if (request.method === "POST") {
    const body = await request.json().catch(() => null) as { cases?: unknown[] } | null;
    const cases = body?.cases;
    if (!Array.isArray(cases) || !cases.length || cases.some((item) => !isStoredCase(item))) {
      return json({ error: "A non-empty cases array with an id and title is required." }, 400);
    }
    if (cases.length > 100) return json({ error: "Import batches are limited to 100 cases." }, 413);
    await saveCases(cases, env);
    return json({ saved: cases.length });
  }

  return json({ error: "Method not allowed." }, 405);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return appAsset(cacheBustedHtml, "text/html; charset=utf-8", "no-cache");
    }
    if (request.method === "GET" && url.pathname === "/assets/app.js") {
      return appAsset(appJavaScript, "text/javascript; charset=utf-8", "public, max-age=31536000, immutable");
    }
    if (request.method === "GET" && url.pathname === "/assets/index.css") {
      return appAsset(appCss, "text/css; charset=utf-8", "public, max-age=31536000, immutable");
    }
    if (url.pathname === "/cases/philippine-succession-cases.jsonl" && request.method === "GET") {
      return new Response(caseLibraryJsonl, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Content-Disposition": 'attachment; filename="philippine-succession-cases.jsonl"',
          "Cache-Control": "public, max-age=300",
        },
      });
    }
    if (url.pathname === "/api/cases") {
      try { return await casesApi(request, env); }
      catch (error) {
        console.error("Cases API failed", error);
        return json({ error: "The permanent case library is temporarily unavailable." }, 503);
      }
    }

    const asset = await env.ASSETS.fetch(request);
    if (asset.status !== 404 || request.method !== "GET") return asset;
    return appAsset(cacheBustedHtml, "text/html; charset=utf-8", "no-cache");
  },
};
