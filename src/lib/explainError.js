// Turns raw generation errors (MuAPI HTTP errors, Electron IPC errors from the local
// engines) into a plain-language "what happened" + "what to do" pair. The raw text is
// kept as technical details. Order matters: the first matching rule wins.
const RULES = [
    { key: 'noKey', test: /API Key missing/i },
    { key: 'keyInvalid', test: /\b(401|403)\b|invalid api key|unauthori[sz]ed/i },
    { key: 'noCredits', test: /\b402\b|insufficient (credit|balance|funds)|not enough credits/i },
    { key: 'rateLimit', test: /\b429\b|rate limit|too many requests/i },
    { key: 'wan2gpOffline', test: /wan2gp[\s\S]*(fetch failed|ECONNREFUSED)|(fetch failed|ECONNREFUSED)[\s\S]*wan2gp/i },
    { key: 'wan2gpNotSet', test: /Wan2GP is not configured/i },
    { key: 'engineMissing', test: /sd\.cpp binary not installed/i },
    { key: 'cudaMissing', test: /CUDA runtime|runtime DLLs are missing/i },
    { key: 'auxMissing', test: /Text encoder .* not downloaded|VAE .* not downloaded/i },
    { key: 'modelMissing', test: /Model file not found|not downloaded|Unknown local model/i },
    { key: 'notEnoughMemory', test: /Not enough memory for this model/i },
    { key: 'outOfMemory', test: /out of memory|CUDA error|OOM\b|std::bad_alloc/i },
    { key: 'cancelled', test: /Generation cancelled/i },
    { key: 'offline', test: /Failed to fetch|NetworkError|ERR_INTERNET_DISCONNECTED|ENOTFOUND|ETIMEDOUT/i },
    { key: 'serverError', test: /\b5\d\d\b/ },
];

/** { key, details } — key indexes `error.<key>.title` / `error.<key>.fix` in the locales. */
export function explainError(err) {
    const raw = String(err?.message || err || '');
    const details = raw
        .replace(/^Error invoking remote method '[^']+':\s*/, '')
        .replace(/^(Type)?Error:\s*/, '')
        .trim();
    // Match on the raw text: the IPC prefix names the engine (e.g. 'wan2gp:generate').
    const rule = RULES.find((r) => r.test.test(raw));
    return { key: rule ? rule.key : 'unknown', details };
}
