const test = require('node:test');
const assert = require('node:assert/strict');

const {
    isCudaBuild,
    pickBinaryAssetForPlatform,
    pickCudaRuntimeAsset,
    getBundledBinaryResourceDir,
} = require('../electron/lib/localInferenceAssets');

test('pickBinaryAssetForPlatform prefers native linux arm64 assets', () => {
    const zipNames = [
        'sd-master-abc-bin-Linux-Ubuntu-24.04-x86_64.zip',
        'sd-master-abc-bin-Linux-Ubuntu-24.04-aarch64.zip',
        'sd-master-abc-bin-Linux-Ubuntu-24.04-aarch64-vulkan.zip',
    ];

    const picked = pickBinaryAssetForPlatform({
        platform: 'linux',
        arch: 'arm64',
        zipNames,
    });

    assert.equal(picked, 'sd-master-abc-bin-Linux-Ubuntu-24.04-aarch64.zip');
});

// Asset names as published by leejet/stable-diffusion.cpp master-1030 (Oct 2026).
const WIN_RELEASE = [
    'cudart-sd-bin-win-cu12-x64.zip',
    'sd-master-0a06712-bin-Darwin-macOS-26.6.2-arm64.zip',
    'sd-master-0a06712-bin-win-cpu-x64.zip',
    'sd-master-0a06712-bin-win-cuda12-x64.zip',
    'sd-master-0a06712-bin-win-rocm-10.1.0-x64.zip',
    'sd-master-0a06712-bin-win-vulkan-x64.zip',
];

test('windows with NVIDIA GPU picks the CUDA build plus its runtime', () => {
    const picked = pickBinaryAssetForPlatform({ platform: 'win32', arch: 'x64', zipNames: WIN_RELEASE, hasNvidiaGpu: true });
    assert.equal(picked, 'sd-master-0a06712-bin-win-cuda12-x64.zip');
    assert.ok(isCudaBuild(picked));
    assert.equal(pickCudaRuntimeAsset(WIN_RELEASE), 'cudart-sd-bin-win-cu12-x64.zip');
});

test('windows without NVIDIA GPU picks the CPU build, never CUDA or cudart', () => {
    const picked = pickBinaryAssetForPlatform({ platform: 'win32', arch: 'x64', zipNames: WIN_RELEASE });
    assert.equal(picked, 'sd-master-0a06712-bin-win-cpu-x64.zip');
    assert.ok(!isCudaBuild(picked));
});

test('windows still recognises older avx2 asset names', () => {
    const picked = pickBinaryAssetForPlatform({
        platform: 'win32',
        arch: 'x64',
        zipNames: ['sd-master-abc-bin-win-avx-x64.zip', 'sd-master-abc-bin-win-avx2-x64.zip'],
    });
    assert.equal(picked, 'sd-master-abc-bin-win-avx2-x64.zip');
});

test('getBundledBinaryResourceDir resolves linux arm64 bundled path', () => {
    const bundledDir = getBundledBinaryResourceDir({
        resourcesPath: '/opt/Open Generative AI/resources',
        platform: 'linux',
        arch: 'arm64',
    });

    assert.equal(
        bundledDir,
        '/opt/Open Generative AI/resources/local-ai/linux-arm64/bin'
    );
});
