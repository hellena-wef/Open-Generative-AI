const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

test('price comes from the estimate endpoint, falls back to base price, null for unknown models', async () => {
    const calls = [];
    global.fetch = async (url, opts = {}) => {
        calls.push(url);
        if (url.endsWith('/api/v1/models')) {
            return { ok: true, json: async () => ({ models: [
                { endpoint_url: 'fixed-model', cost: 0.025, estimate_endpoint: null },
                { endpoint_url: 'video-model', cost: 0.1, estimate_endpoint: '/api/v1/models/video-model/estimate-cost' },
                { endpoint_url: 'flaky-model', cost: 0.2, estimate_endpoint: '/api/v1/models/flaky-model/estimate-cost' },
            ] }) };
        }
        if (url.includes('video-model/estimate-cost')) {
            const body = JSON.parse(opts.body);
            return { ok: true, json: async () => ({ cost: 0.1 * body.duration }) };
        }
        throw new Error('network down');
    };
    const { estimatePrice } = await import(pathToFileURL(path.join(__dirname, '..', 'src/lib/pricing.js')).href);

    assert.equal(await estimatePrice('fixed-model'), 0.025);
    assert.equal(await estimatePrice('video-model', { duration: 10 }), 1);
    assert.equal(await estimatePrice('flaky-model', { duration: 5 }), 0.2);
    assert.equal(await estimatePrice('not-in-catalog'), null);

    await estimatePrice('video-model', { duration: 10 });
    assert.equal(calls.filter((u) => u.endsWith('/api/v1/models')).length, 1, 'catalog fetched once');
    assert.equal(calls.filter((u) => u.includes('video-model/estimate-cost')).length, 1, 'same request estimated once');
});
