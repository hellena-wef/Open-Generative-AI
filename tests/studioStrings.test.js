const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src/lib/locales/studios');
const english = JSON.parse(fs.readFileSync(path.join(dir, 'strings-en.json'), 'utf8'));

test('every Workflows/Agents translation covers every English string', () => {
    for (const code of ['pt-BR', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh-CN']) {
        const dict = JSON.parse(fs.readFileSync(path.join(dir, `${code}.json`), 'utf8'));
        assert.deepEqual(Object.keys(dict).sort(), [...english].sort(), `${code} keys differ`);
        for (const [k, v] of Object.entries(dict)) assert.ok(String(v).trim(), `${code}: empty value for "${k}"`);
    }
});

