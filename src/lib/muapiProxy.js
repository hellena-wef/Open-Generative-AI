// The React studios (workflow builder, agents) call relative /api/... paths that the
// Next web app proxies to MuAPI (app/api/**/route.js). The desktop renderer has no
// server, so rewrite those calls here, in one place, for both fetch and XHR (axios).
const MUAPI = 'https://api.muapi.ai';

export function toMuapiUrl(url) {
    if (typeof url !== 'string' || !url.startsWith('/api/')) return null;
    const p = url.slice(4);                                    // "/workflow/..." etc.
    if (p.startsWith('/api/v1/') || p.startsWith('/v1/')) {    // /api/api/v1/* and /api/v1/* -> /api/v1/*
        return MUAPI + (p.startsWith('/api/') ? p : '/api' + p);
    }
    if (/^\/(workflow|agents|app)([/?]|$)/.test(p)) return MUAPI + p;
    return null;
}

export function currentKey() {
    try { return window.__MUAPI_KEY__ || localStorage.getItem('muapi_key') || null; } catch { return null; }
}

let installed = false;
export function installMuapiProxy() {
    if (installed || typeof window === 'undefined') return;
    installed = true;

    const origFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
        const target = toMuapiUrl(input);
        if (!target) return origFetch(input, init);
        const headers = new Headers(init?.headers);
        const key = currentKey();
        if (key && !headers.has('x-api-key')) headers.set('x-api-key', key);
        return origFetch(target, { ...init, headers });
    };

    const XHR = window.XMLHttpRequest.prototype;
    const origOpen = XHR.open;
    XHR.open = function (method, url, ...rest) {
        const target = toMuapiUrl(typeof url === 'string' ? url : String(url));
        origOpen.call(this, method, target || url, ...rest);
        // The key only ever goes to MuAPI URLs we rewrote, never to S3/CDN uploads.
        const key = target && currentKey();
        if (key) this.setRequestHeader('x-api-key', key);
    };
}
