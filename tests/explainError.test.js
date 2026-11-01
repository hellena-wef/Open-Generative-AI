const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

test('raw generation errors map to a plain-language explanation', async () => {
    const { explainError } = await import(pathToFileURL(path.join(__dirname, '..', 'src/lib/explainError.js')).href);
    const cases = [
        ["Error invoking remote method 'wan2gp:generate': TypeError: fetch failed", 'wan2gpOffline'],
        ["Error invoking remote method 'local-ai:generate': Error: Model file not found. Download \"Z-Image Turbo\" in Settings > Local Models.", 'modelMissing'],
        ['Text encoder (Qwen3-4B) not downloaded. Go to Settings', 'auxMissing'],
        ['Not enough memory for this model: it needs about 11.0 GB', 'notEnoughMemory'],
        ['API Request Failed: 402 Payment Required - insufficient balance', 'noCredits'],
        ['API Request Failed: 401 Unauthorized', 'keyInvalid'],
        ['API Key missing. Please set it in Settings.', 'noKey'],
        ['something odd', 'unknown'],
    ];
    for (const [raw, key] of cases) assert.equal(explainError(new Error(raw)).key, key, raw);
    assert.equal(explainError(new Error("Error invoking remote method 'x': Error: boom")).details, 'boom');
});
