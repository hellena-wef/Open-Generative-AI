const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { pathToFileURL } = require('url');

const load = (rel) => import(pathToFileURL(path.join(__dirname, '..', 'src/lib', rel)).href);

test('computer locales map to a bundled language', async () => {
    const { normalizeLang } = await load('i18n.js');
    assert.equal(normalizeLang('pt-PT'), 'pt-BR');
    assert.equal(normalizeLang('pt_BR'), 'pt-BR');
    assert.equal(normalizeLang('es-419'), 'es');
    assert.equal(normalizeLang('zh-TW'), 'zh-CN');
    assert.equal(normalizeLang('ja-JP'), 'ja');
    assert.equal(normalizeLang('ru-RU'), 'en');
    assert.equal(normalizeLang(null), 'en');
});

test('every language has every English key, with matching function arity', async () => {
    const { LANGUAGES } = await load('i18n.js');
    const en = (await load('locales/en.js')).default;
    for (const code of Object.keys(LANGUAGES)) {
        const dict = (await load(`locales/${code}.js`)).default;
        assert.deepEqual(Object.keys(dict).sort(), Object.keys(en).sort(), `${code} keys differ from en`);
        for (const [key, val] of Object.entries(en)) {
            if (typeof val === 'function') {
                assert.equal(typeof dict[key], 'function', `${code}.${key} should be a function`);
                assert.equal(dict[key].length, val.length, `${code}.${key} arity`);
            }
        }
    }
});
