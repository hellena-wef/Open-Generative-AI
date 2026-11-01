const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

test('storeZip writes an archive that a real unzip tool can read back', async () => {
    const { storeZip, crc32 } = await import(pathToFileURL(path.join(__dirname, '..', 'src/lib/storeZip.js')).href);
    assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926); // standard CRC-32 check value

    const files = [
        { name: 'photo_01.jpg', data: new Uint8Array([0xff, 0xd8, 1, 2, 3, 0xff, 0xd9]) },
        { name: 'photo_01.txt', data: new TextEncoder().encode('hellena, portrait') },
    ];
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zip-'));
    const zipPath = path.join(dir, 'set.zip');
    fs.writeFileSync(zipPath, storeZip(files));

    // Windows ships bsdtar (understands zip); elsewhere use unzip.
    const out = path.join(dir, 'out');
    fs.mkdirSync(out);
    const tar = process.platform === 'win32' ? path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe') : 'unzip';
    if (process.platform === 'win32') execFileSync(tar, ['-xf', zipPath, '-C', out]);
    else execFileSync(tar, ['-q', zipPath, '-d', out]);
    assert.deepEqual([...fs.readFileSync(path.join(out, 'photo_01.jpg'))], [...files[0].data]);
    assert.equal(fs.readFileSync(path.join(out, 'photo_01.txt'), 'utf8'), 'hellena, portrait');
});
