const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

test('brand + project look merges and is appended to the prompt', async () => {
    const store = {};
    global.localStorage = { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); } };
    global.window = { dispatchEvent: () => {} };
    global.CustomEvent = class { constructor(type) { this.type = type; } };
    const b = await import(pathToFileURL(path.join(__dirname, '..', 'src/lib/brands.js')).href);

    assert.equal(b.activeLook(), null);
    assert.equal(b.applyLook('a cat', null), 'a cat');

    const brand = b.createBrand('Das Solas');
    b.saveBrands(b.getBrands().map((x) => ({ ...x, style: 'warm 35mm film', avoid: 'text', ar: '4:5', refs: ['https://x/1.jpg'] })));
    const project = b.createProject(brand.id, 'Verão');
    b.saveBrands(b.getBrands().map((x) => ({ ...x, projects: x.projects.map((p) => ({ ...p, style: 'beach light', refs: ['https://x/2.jpg'] })) })));

    b.setActive(brand.id);
    assert.equal(b.activeLook().label, 'Das Solas');
    assert.deepEqual(b.activeLook().refs, ['https://x/1.jpg']);

    b.setActive(brand.id, project.id);
    const look = b.activeLook();
    assert.equal(look.label, 'Das Solas · Verão');
    assert.equal(look.style, 'warm 35mm film, beach light');
    assert.deepEqual(look.refs, ['https://x/1.jpg', 'https://x/2.jpg']);
    assert.equal(look.ar, '4:5');
    assert.equal(b.applyLook('a woman reading', look), 'a woman reading. Style: warm 35mm film, beach light. Avoid: text');
    assert.equal(b.applyLook('', look), 'Style: warm 35mm film, beach light. Avoid: text');
});
