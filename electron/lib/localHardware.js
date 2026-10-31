const os = require('os');
const { execFile } = require('child_process');

// Rough headroom for activations, VAE decode and runtime buffers on top of the weights.
// ponytail: flat estimate per run; replace with per-model numbers if users hit false positives.
const RUNTIME_OVERHEAD_GB = 1.5;

function parseNvidiaSmi(stdout) {
    return String(stdout || '')
        .split(/\r?\n/)
        .map((line) => line.split(',').map((s) => s.trim()))
        .filter((cols) => cols.length >= 3 && cols[0])
        .map(([name, totalMB, freeMB]) => ({ name, totalMB: Number(totalMB), freeMB: Number(freeMB) }))
        .filter((gpu) => Number.isFinite(gpu.totalMB) && Number.isFinite(gpu.freeMB));
}

// Resolves to [] when nvidia-smi is missing (no NVIDIA GPU or no driver).
function queryNvidiaGpus() {
    return new Promise((resolve) => {
        execFile(
            'nvidia-smi',
            ['--query-gpu=name,memory.total,memory.free', '--format=csv,noheader,nounits'],
            { timeout: 5000, windowsHide: true },
            (err, stdout) => resolve(err ? [] : parseNvidiaSmi(stdout))
        );
    });
}

function freeRamGB() {
    return os.freemem() / 1024 ** 3;
}

// Decide how to run a model of `weightsGB` given the hardware:
// all on GPU, weights in RAM with --offload-to-cpu, or refuse with a clear reason.
function planMemory({ weightsGB, useGpu, gpus, freeRamGB: ramGB }) {
    const needGB = weightsGB + RUNTIME_OVERHEAD_GB;
    const fmt = (n) => n.toFixed(1);
    const vramGB = useGpu && gpus.length ? Math.max(...gpus.map((g) => g.freeMB)) / 1024 : 0;

    if (useGpu && vramGB >= needGB) return { ok: true, offload: false, needGB };
    if (ramGB >= needGB) return { ok: true, offload: useGpu, needGB };

    const where = useGpu
        ? `${fmt(vramGB)} GB of free VRAM and ${fmt(ramGB)} GB of free RAM`
        : `${fmt(ramGB)} GB of free RAM`;
    return {
        ok: false,
        offload: false,
        needGB,
        message: `Not enough memory for this model: it needs about ${fmt(needGB)} GB, you have ${where}. `
            + 'Close other apps, pick a smaller model (e.g. an SD 1.5 one), or use an API provider.',
    };
}

module.exports = {
    RUNTIME_OVERHEAD_GB,
    freeRamGB,
    parseNvidiaSmi,
    planMemory,
    queryNvidiaGpus,
};
