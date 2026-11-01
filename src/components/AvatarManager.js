import { t, tf } from '../lib/i18n.js';
import { estimatePrice, formatUsd } from '../lib/pricing.js';
import {
    getAvatars, deleteAvatar, setActiveAvatar, getActiveAvatarId, trainAvatar,
    AVATAR_CHANGE_EVENT, TRAINER, TRAIN_STEPS,
} from '../lib/avatars.js';
import { showErrorBanner } from './ErrorBanner.js';

const MIN_PHOTOS = 10;
const MAX_PHOTOS = 30;
const label = 'block font-mono text-[10px] uppercase tracking-[0.12em] text-secondary mb-1.5';
const input = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50';
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Modal to create trained avatars (photos -> LoRA) and pick the one to generate with.
export function AvatarManager() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-white/30 p-4';
    const modal = document.createElement('div');
    modal.className = 'w-[min(94vw,56rem)] h-[min(88vh,42rem)] bg-app-bg border border-white/10 rounded-2xl shadow-3xl flex flex-col overflow-hidden';
    overlay.appendChild(modal);

    const close = () => { overlay.remove(); window.removeEventListener(AVATAR_CHANGE_EVENT, render); };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } });

    let selectedId = getAvatars()[0]?.id || 'new';
    let draft = { name: '', files: [], previews: [], step: '' };
    let price = '';
    estimatePrice(TRAINER, { steps: TRAIN_STEPS }).then((usd) => { if (usd != null) { price = formatUsd(usd); render(); } }).catch(() => {});

    const statusBadge = (a) => {
        const map = { training: ['bg-butter', t('avatar.statusTraining')], ready: ['bg-primary/10 text-primary', t('avatar.statusReady')], failed: ['bg-white/10', t('avatar.statusFailed')] };
        const [cls, text] = map[a.status] || map.training;
        return `<span class="font-mono text-[9px] uppercase tracking-[0.1em] px-1.5 py-0.5 rounded ${cls}">${text}</span>`;
    };

    function render() {
        const avatars = getAvatars();
        const current = avatars.find((a) => a.id === selectedId);
        const activeId = getActiveAvatarId();
        modal.innerHTML = `
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 class="text-lg font-light text-white">${t('avatar.title')}</h2>
                <button data-act="close" class="text-secondary hover:text-white" aria-label="${t('common.close')}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="flex-1 flex min-h-0">
                <aside class="w-60 shrink-0 border-r border-white/10 p-3 overflow-y-auto flex flex-col gap-1">
                    ${avatars.map((a) => `
                        <button data-pick="${a.id}" class="flex items-center gap-2.5 w-full text-left px-2 py-2 rounded-lg ${a.id === selectedId ? 'bg-white/10' : 'hover:bg-white/5'}">
                            <span class="w-9 h-9 rounded-full overflow-hidden bg-white/10 shrink-0">${a.cover ? `<img src="${a.cover}" class="w-full h-full object-cover" alt="">` : ''}</span>
                            <span class="flex flex-col gap-0.5 min-w-0">
                                <span class="text-sm text-white truncate">${esc(a.name)}${a.id === activeId ? ' ✳' : ''}</span>
                                ${statusBadge(a)}
                            </span>
                        </button>`).join('')}
                    <button data-pick="new" class="mt-2 w-full text-left px-3 py-2 text-sm text-primary hover:underline">+ ${t('avatar.new')}</button>
                </aside>
                <section class="flex-1 p-6 overflow-y-auto">${current ? detail(current, activeId) : form()}</section>
            </div>`;
    }

    function detail(a, activeId) {
        const body = a.status === 'ready'
            ? `<p class="text-sm text-secondary mb-4">${t('avatar.readyHelp')}</p>
               <div class="flex gap-2">
                 ${a.id === activeId
                    ? `<button data-act="unuse" class="px-4 py-2 rounded-xl bg-white/10 text-sm">${t('avatar.stopUsing')}</button>`
                    : `<button data-act="use" class="px-4 py-2 rounded-xl bg-primary text-black text-sm font-bold">${t('avatar.useNow')}</button>`}
               </div>`
            : a.status === 'training'
                ? `<p class="text-sm text-white mb-1">${t('avatar.trainingTitle')}</p><p class="text-sm text-secondary">${t('avatar.trainingHelp')}</p>`
                : `<p class="text-sm text-white mb-1">${t('avatar.failedTitle')}</p><p class="text-xs text-secondary font-mono whitespace-pre-wrap">${esc(a.error)}</p>`;
        return `
            <div class="flex items-center gap-4 mb-6">
                <span class="w-20 h-20 rounded-2xl overflow-hidden bg-white/10">${a.cover ? `<img src="${a.cover}" class="w-full h-full object-cover" alt="">` : ''}</span>
                <div>
                    <p class="text-2xl font-light text-white">${esc(a.name)}</p>
                    <p class="text-xs text-secondary mt-1">${tf('avatar.photoCount', a.photoCount)} · ${statusBadge(a)}</p>
                </div>
            </div>
            ${body}
            <button data-act="delete" class="mt-8 text-xs text-secondary hover:text-primary">${t('brand.delete')}</button>`;
    }

    function form() {
        const n = draft.files.length;
        const ok = draft.name.trim() && n >= MIN_PHOTOS && n <= MAX_PHOTOS && !draft.step;
        return `
            <p class="text-sm text-secondary mb-5">${t('avatar.intro')}</p>
            <label class="${label}">${t('avatar.name')}</label>
            <input data-field="name" class="${input} mb-5 max-w-sm" placeholder="Hellena" value="${esc(draft.name)}" />
            <label class="${label}">${tf('avatar.photosLabel', MIN_PHOTOS, MAX_PHOTOS)}</label>
            <ul class="text-xs text-secondary mb-3 list-disc pl-5 space-y-0.5">
                <li>${t('avatar.tip1')}</li><li>${t('avatar.tip2')}</li><li>${t('avatar.tip3')}</li>
            </ul>
            <div class="flex flex-wrap gap-2 mb-2">
                ${draft.previews.map((src, i) => `
                    <div class="relative w-16 h-16 rounded-lg overflow-hidden border border-white/10 group">
                        <img src="${src}" class="w-full h-full object-cover" alt="">
                        <button data-remove="${i}" class="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100" aria-label="${t('upload.removeFromHistory')}">×</button>
                    </div>`).join('')}
                <label class="w-16 h-16 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-2xl text-secondary hover:border-primary/50 cursor-pointer">
                    +<input data-act="add-photos" type="file" accept="image/*" multiple class="hidden" />
                </label>
            </div>
            <p class="text-xs mb-6 ${n && (n < MIN_PHOTOS || n > MAX_PHOTOS) ? 'text-primary' : 'text-secondary'}">${tf('avatar.photosSelected', n)}</p>
            <div class="flex items-center gap-4">
                <button data-act="train" class="px-5 py-2.5 rounded-xl bg-primary text-black text-sm font-bold ${ok ? '' : 'opacity-40 pointer-events-none'}">
                    ${draft.step ? t(`avatar.step.${draft.step}`) : t('avatar.train')}
                </button>
                <span class="text-xs text-secondary">${price ? tf('avatar.cost', price) : ''}</span>
            </div>`;
    }

    modal.addEventListener('click', async (e) => {
        const el = e.target.closest('[data-act],[data-pick],[data-remove]');
        if (!el) return;
        if (el.dataset.pick) { selectedId = el.dataset.pick; return render(); }
        if (el.dataset.remove !== undefined) {
            const i = Number(el.dataset.remove);
            draft.files.splice(i, 1); draft.previews.splice(i, 1);
            return render();
        }
        switch (el.dataset.act) {
            case 'close': return close();
            case 'use': setActiveAvatar(selectedId); return close();
            case 'unuse': setActiveAvatar(null); return render();
            case 'delete':
                if (confirm(t('brand.deleteConfirm'))) { deleteAvatar(selectedId); selectedId = getAvatars()[0]?.id || 'new'; render(); }
                return;
            case 'train': {
                try {
                    const avatar = await trainAvatar({
                        name: draft.name.trim(),
                        files: draft.files,
                        onStep: (step) => { draft.step = step; render(); },
                    });
                    draft = { name: '', files: [], previews: [], step: '' };
                    selectedId = avatar.id;
                    render();
                } catch (err) {
                    draft.step = '';
                    render();
                    showErrorBanner(err);
                }
            }
        }
    });
    modal.addEventListener('input', (e) => { if (e.target.dataset.field === 'name') draft.name = e.target.value; });
    modal.addEventListener('change', (e) => {
        if (e.target.dataset.field === 'name') return render();
        if (e.target.dataset.act !== 'add-photos') return;
        for (const f of e.target.files) {
            if (draft.files.length >= MAX_PHOTOS) break;
            draft.files.push(f);
            draft.previews.push(URL.createObjectURL(f));
        }
        render();
    });

    window.addEventListener(AVATAR_CHANGE_EVENT, render);
    render();
    return overlay;
}
