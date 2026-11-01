// Trained avatars: a Z-Image LoRA learned from 10-30 photos of one person.
// Stored on this computer (localStorage); the LoRA file itself is hosted by MuAPI and,
// once downloaded, also kept next to the local models so sd.cpp can use it offline.
// Shape: [{ id, name, trigger, cover, photoCount, status: 'training'|'ready'|'failed',
//           requestId, loraUrl, error, createdAt }]
import { muapi } from './muapi.js';
import { storeZip } from './storeZip.js';

const KEY = 'faisca_avatars';
const ACTIVE_KEY = 'faisca_active_avatar';
export const AVATAR_CHANGE_EVENT = 'faisca-avatar-change';
export const TRAINER = 'z-image-lora-trainer';
export const LORA_ENDPOINT = 'z-image-turbo-text-to-image-lora';
export const TRAIN_STEPS = 1000;
const API = (typeof import.meta !== 'undefined' && import.meta.env?.DEV) ? '' : 'https://api.muapi.ai';

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const emit = () => window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT));

export const getAvatars = () => read(KEY, []);
function saveAvatars(list) { localStorage.setItem(KEY, JSON.stringify(list)); emit(); }
function patchAvatar(id, patch) { saveAvatars(getAvatars().map((a) => (a.id === id ? { ...a, ...patch } : a))); }
export function deleteAvatar(id) {
    saveAvatars(getAvatars().filter((a) => a.id !== id));
    if (getActiveAvatarId() === id) setActiveAvatar(null);
}

export const getActiveAvatarId = () => read(ACTIVE_KEY, null);
export function setActiveAvatar(id) { localStorage.setItem(ACTIVE_KEY, JSON.stringify(id)); emit(); }
/** The active avatar if it's trained and usable, else null. */
export function activeAvatar() {
    const a = getAvatars().find((x) => x.id === getActiveAvatarId());
    return a && a.status === 'ready' && a.loraUrl ? a : null;
}

/** A rare token the model can bind the face to, e.g. "hellena" -> "fsk_hellena". */
export function triggerFor(name) {
    const slug = String(name).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12);
    return `fsk_${slug || 'avatar'}`;
}

/** Prompt for a generation with this avatar: trigger word first so the LoRA engages. */
export const avatarPrompt = (avatar, prompt) => `${avatar.trigger}, ${prompt}`;

// Photos are resized to at most 1024 px (plenty for LoRA training) to keep the zip small.
async function toTrainingJpeg(file, maxSide = 1024) {
    const bmp = await createImageBitmap(file);
    try {
        const s = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
        const c = document.createElement('canvas');
        c.width = Math.round(bmp.width * s);
        c.height = Math.round(bmp.height * s);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
        return { bytes: new Uint8Array(await blob.arrayBuffer()), cover: c.toDataURL('image/jpeg', 0.6) };
    } finally {
        bmp.close?.();
    }
}

/**
 * Packs the photos, uploads them and starts training. Returns the new avatar.
 * onStep(stepKey) reports 'preparing' | 'uploading' | 'starting'.
 */
export async function trainAvatar({ name, files, onStep = () => {} }) {
    const key = muapi.getKey();
    onStep('preparing');
    const prepared = [];
    for (const f of files) prepared.push(await toTrainingJpeg(f));
    const zip = storeZip(prepared.map((p, i) => ({ name: `photo_${String(i + 1).padStart(2, '0')}.jpg`, data: p.bytes })));

    onStep('uploading');
    const dataUrl = await muapi.uploadFile(new File([zip], 'avatar-photos.zip', { type: 'application/zip' }));

    onStep('starting');
    const trigger = triggerFor(name);
    const res = await fetch(`${API}/api/v1/${TRAINER}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key },
        body: JSON.stringify({ data: dataUrl, trigger_word: trigger, steps: TRAIN_STEPS }),
    });
    if (!res.ok) throw new Error(`Training request failed: ${res.status} - ${(await res.text()).slice(0, 200)}`);
    const body = await res.json();
    const requestId = body.request_id || body.id || body.data?.request_id;
    if (!requestId) throw new Error('Training started but no request id came back.');

    const avatar = {
        id: Math.random().toString(36).slice(2, 10),
        name, trigger, cover: prepared[0]?.cover || '', photoCount: files.length,
        status: 'training', requestId, loraUrl: '', error: '', createdAt: new Date().toISOString(),
    };
    saveAvatars([...getAvatars(), avatar]);
    watchTraining(avatar.id);
    return avatar;
}

const watching = new Set();
/** Polls a training job until it finishes. Safe to call again (e.g. after an app restart). */
export async function watchTraining(id) {
    if (watching.has(id)) return;
    watching.add(id);
    try {
        for (;;) {
            const a = getAvatars().find((x) => x.id === id);
            if (!a || a.status !== 'training') return;
            let data;
            try {
                const r = await fetch(`${API}/api/v1/predictions/${a.requestId}/result`, { headers: { 'x-api-key': muapi.getKey() } });
                data = r.ok ? await r.json() : null;
            } catch { data = null; }
            const status = String(data?.status || '').toLowerCase();
            const outputs = data?.outputs || data?.output?.outputs || data?.data?.outputs || [];
            if (['completed', 'succeeded', 'success'].includes(status) && outputs[0]) {
                patchAvatar(id, { status: 'ready', loraUrl: outputs[0] });
                return;
            }
            if (['failed', 'error', 'cancelled', 'canceled'].includes(status)) {
                patchAvatar(id, { status: 'failed', error: data?.error || data?.message || status });
                return;
            }
            await new Promise((r) => setTimeout(r, 15000)); // training takes minutes; poll gently
        }
    } finally {
        watching.delete(id);
    }
}

/** Resume watching every unfinished training (call once at startup). */
export function resumeTrainings() {
    for (const a of getAvatars()) if (a.status === 'training') watchTraining(a.id);
}
