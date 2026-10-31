const test = require('node:test');
const assert = require('node:assert/strict');

const { parseNvidiaSmi, planMemory } = require('../electron/lib/localHardware');

const RTX_2060 = [{ name: 'NVIDIA GeForce RTX 2060', totalMB: 12288, freeMB: 10415 }];

test('parseNvidiaSmi reads csv rows and ignores junk', () => {
    const gpus = parseNvidiaSmi('NVIDIA GeForce RTX 2060, 12288, 10415\r\n\r\nnot a gpu line\n');
    assert.deepEqual(gpus, RTX_2060);
});

test('model that fits in VRAM runs fully on GPU', () => {
    const plan = planMemory({ weightsGB: 5.2, useGpu: true, gpus: RTX_2060, freeRamGB: 4 });
    assert.equal(plan.ok, true);
    assert.equal(plan.offload, false);
});

test('model too big for VRAM but fits in RAM is offloaded', () => {
    const plan = planMemory({ weightsGB: 9.5, useGpu: true, gpus: RTX_2060, freeRamGB: 14 });
    assert.equal(plan.ok, true);
    assert.equal(plan.offload, true);
});

test('model that fits nowhere is refused with a readable reason', () => {
    const plan = planMemory({ weightsGB: 9.5, useGpu: true, gpus: RTX_2060, freeRamGB: 6 });
    assert.equal(plan.ok, false);
    assert.match(plan.message, /needs about 11\.0 GB/);
    assert.match(plan.message, /VRAM/);
});

test('CPU-only machine is judged on RAM alone', () => {
    assert.equal(planMemory({ weightsGB: 2.1, useGpu: false, gpus: [], freeRamGB: 8 }).ok, true);
    const plan = planMemory({ weightsGB: 6.9, useGpu: false, gpus: [], freeRamGB: 5 });
    assert.equal(plan.ok, false);
    assert.doesNotMatch(plan.message, /VRAM/);
});
