const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

test('desktop rewrites the Next /api proxy paths to MuAPI', async () => {
    const { toMuapiUrl } = await import(pathToFileURL(path.join(__dirname, '..', 'src/lib/muapiProxy.js')).href);
    const M = 'https://api.muapi.ai';
    assert.equal(toMuapiUrl('/api/workflow/get-template-workflows'), `${M}/workflow/get-template-workflows`);
    assert.equal(toMuapiUrl('/api/agents'), `${M}/agents`);
    assert.equal(toMuapiUrl('/api/agents/by-slug/x?y=1'), `${M}/agents/by-slug/x?y=1`);
    assert.equal(toMuapiUrl('/api/app/get_file_upload_url?filename=a.png'), `${M}/app/get_file_upload_url?filename=a.png`);
    assert.equal(toMuapiUrl('/api/api/v1/flux-schnell-image'), `${M}/api/v1/flux-schnell-image`);
    assert.equal(toMuapiUrl('/api/v1/models'), `${M}/api/v1/models`);
    assert.equal(toMuapiUrl('/api/workflowsomething'), null);
    assert.equal(toMuapiUrl('https://s3.amazonaws.com/bucket'), null);
    assert.equal(toMuapiUrl('/assets/x.png'), null);
});
