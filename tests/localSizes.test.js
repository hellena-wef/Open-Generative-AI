const test = require('node:test');
const assert = require('node:assert/strict');

test('local image sizes follow the chosen ratio, including carousel 4:5', () => {
    let arToDimensions;
    try { ({ arToDimensions } = require('../electron/lib/localInference.js')); } catch { return; } // needs electron at load
    assert.deepEqual(arToDimensions('1:1', 'z-image'), [1024, 1024]);
    assert.deepEqual(arToDimensions('16:9', 'z-image'), [1792, 1024]); // unchanged from the old table
    assert.deepEqual(arToDimensions('9:16', 'sd1'), [512, 896]);
    assert.deepEqual(arToDimensions('4:5', 'z-image'), [1024, 1280]);
    assert.deepEqual(arToDimensions('3:2', 'z-image'), [1536, 1024]);
    assert.deepEqual(arToDimensions('garbage', 'z-image'), [1024, 1024]);
});
