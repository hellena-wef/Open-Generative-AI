// Generation prices from MuAPI's public pricing API (no key needed).
// GET /api/v1/models gives every model's base price; models with dynamic
// pricing (most of them) get the exact figure from /estimate-cost, which runs
// the price formula without generating or charging anything.
import { getLang } from './i18n.js';

const API = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ? '' : 'https://api.muapi.ai';
const CATALOG_KEY = 'muapi_price_catalog';
const CATALOG_TTL_MS = 60 * 60 * 1000; // MuAPI suggests caching the catalog for about an hour

let catalogPromise = null;
const estimates = new Map(); // `${endpoint} ${payload}` → Promise<number|null>

function loadCatalog() {
    try {
        const cached = JSON.parse(localStorage.getItem(CATALOG_KEY) || 'null');
        if (cached && Date.now() - cached.at < CATALOG_TTL_MS) return Promise.resolve(cached.models);
    } catch { /* corrupt cache: refetch */ }
    return fetch(`${API}/api/v1/models`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then(({ models = [] }) => {
            const slim = {};
            for (const m of models) {
                slim[m.endpoint_url || m.name] = { cost: m.cost, estimate: m.estimate_endpoint || null };
            }
            try { localStorage.setItem(CATALOG_KEY, JSON.stringify({ at: Date.now(), models: slim })); } catch { /* storage full */ }
            return slim;
        });
}

function catalog() {
    if (!catalogPromise) catalogPromise = loadCatalog().catch((err) => { catalogPromise = null; throw err; });
    return catalogPromise;
}

/** USD price for one request to `endpoint` with this body, or null when MuAPI doesn't know the model. */
export async function estimatePrice(endpoint, payload = {}) {
    const entry = (await catalog())[endpoint];
    if (!entry) return null;
    if (!entry.estimate) return entry.cost;
    const key = `${endpoint} ${JSON.stringify(payload)}`;
    if (!estimates.has(key)) {
        estimates.set(key, fetch(`${API}${entry.estimate}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => (typeof d?.cost === 'number' ? d.cost : entry.cost))
            .catch(() => { estimates.delete(key); return entry.cost; }));
    }
    return estimates.get(key);
}

export function formatUsd(amount) {
    return new Intl.NumberFormat(getLang(), {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: amount < 0.1 ? 3 : 2,
    }).format(amount);
}
