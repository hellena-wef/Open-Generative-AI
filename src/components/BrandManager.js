import { t } from '../lib/i18n.js';
import { muapi } from '../lib/muapi.js';
import { getBrands, saveBrands, createBrand, createProject, getActive, setActive } from '../lib/brands.js';

const ASPECT_RATIOS = ['', '1:1', '4:5', '3:4', '9:16', '16:9'];

const input = 'w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50';
const label = 'block font-mono text-[10px] uppercase tracking-[0.12em] text-secondary mb-1.5';
const chip = (active) => `w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-white/10 text-white font-medium' : 'text-secondary hover:bg-white/5'}`;

// Modal to create brands and projects and edit their look (style text, what to avoid,
// default aspect ratio and reference images). Everything autosaves.
export function BrandManager() {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-white/30 p-4';

    const modal = document.createElement('div');
    modal.className = 'w-[min(94vw,56rem)] h-[min(88vh,40rem)] bg-app-bg border border-white/10 rounded-2xl shadow-3xl flex flex-col overflow-hidden';
    overlay.appendChild(modal);

    const close = () => overlay.remove();
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);

    let { brandId, projectId } = getActive();
    if (!getBrands().some((b) => b.id === brandId)) { brandId = getBrands()[0]?.id || null; projectId = null; }

    const update = (fn) => {
        saveBrands(getBrands().map((b) => (b.id === brandId ? fn(b) : b)));
    };
    const updateTarget = (patch) => update((b) => (projectId
        ? { ...b, projects: b.projects.map((p) => (p.id === projectId ? { ...p, ...patch } : p)) }
        : { ...b, ...patch }));

    const render = () => {
        const brands = getBrands();
        const brand = brands.find((b) => b.id === brandId) || null;
        const project = brand?.projects.find((p) => p.id === projectId) || null;
        const target = project || brand;

        modal.innerHTML = `
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 class="text-lg font-light text-white">${t('brand.manageTitle')}</h2>
                <button data-act="close" class="text-secondary hover:text-white" aria-label="${t('common.close')}">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
            </div>
            <div class="flex-1 flex min-h-0">
                <aside class="w-60 shrink-0 border-r border-white/10 p-3 overflow-y-auto flex flex-col gap-1">
                    ${brands.map((b) => `
                        <button data-brand="${b.id}" class="${chip(b.id === brandId && !projectId)}">${escapeHtml(b.name)}</button>
                        ${b.id === brandId ? b.projects.map((p) => `
                            <button data-project="${p.id}" class="${chip(p.id === projectId)} pl-7">↳ ${escapeHtml(p.name)}</button>`).join('') : ''}
                        ${b.id === brandId ? `<button data-act="new-project" class="w-full text-left pl-7 px-3 py-2 text-xs text-primary hover:underline">+ ${t('brand.newProject')}</button>` : ''}
                    `).join('')}
                    <button data-act="new-brand" class="mt-2 w-full text-left px-3 py-2 text-sm text-primary hover:underline">+ ${t('brand.newBrand')}</button>
                </aside>
                <section class="flex-1 p-6 overflow-y-auto">
                    ${!target ? `<p class="text-secondary text-sm">${t('brand.empty')}</p>` : `
                        <div class="flex items-center gap-3 mb-5">
                            <input data-field="name" class="${input} text-base font-medium" value="${escapeHtml(target.name)}" />
                            <button data-act="use" class="shrink-0 px-4 py-2 rounded-xl bg-primary text-black text-sm font-bold">${t('brand.useNow')}</button>
                            <button data-act="delete" class="shrink-0 px-3 py-2 rounded-xl text-sm text-secondary hover:text-primary">${t('brand.delete')}</button>
                        </div>
                        ${project ? `<p class="text-xs text-secondary mb-4">${t('brand.projectInherits')}</p>` : ''}
                        <label class="${label}">${t('brand.style')}</label>
                        <textarea data-field="style" rows="4" class="${input} mb-1" placeholder="${t('brand.stylePlaceholder')}">${escapeHtml(target.style)}</textarea>
                        <p class="text-[11px] text-muted mb-4">${t('brand.styleHelp')}</p>
                        <label class="${label}">${t('brand.avoid')}</label>
                        <textarea data-field="avoid" rows="2" class="${input} mb-4" placeholder="${t('brand.avoidPlaceholder')}">${escapeHtml(target.avoid)}</textarea>
                        ${project ? '' : `
                            <label class="${label}">${t('brand.ar')}</label>
                            <select data-field="ar" class="${input} mb-4 w-40">
                                ${ASPECT_RATIOS.map((r) => `<option value="${r}" ${r === (brand.ar || '') ? 'selected' : ''}>${r || t('brand.arAny')}</option>`).join('')}
                            </select>`}
                        <label class="${label}">${t('brand.refs')}</label>
                        <p class="text-[11px] text-muted mb-2">${t('brand.refsHelp')}</p>
                        <div class="flex flex-wrap gap-2">
                            ${(target.refs || []).map((url, i) => `
                                <div class="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 group">
                                    <img src="${escapeHtml(url)}" class="w-full h-full object-cover" alt="" />
                                    <button data-remove-ref="${i}" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/80 text-white text-xs opacity-0 group-hover:opacity-100" aria-label="${t('upload.removeFromHistory')}">×</button>
                                </div>`).join('')}
                            <label class="w-20 h-20 rounded-lg border border-dashed border-white/20 flex items-center justify-center text-2xl text-secondary hover:border-primary/50 cursor-pointer">
                                <span data-upload-label>+</span>
                                <input data-act="add-ref" type="file" accept="image/*" multiple class="hidden" />
                            </label>
                        </div>
                        <p data-ref-error class="text-xs text-primary mt-2"></p>
                    `}
                </section>
            </div>
        `;
    };

    modal.addEventListener('click', (e) => {
        const el = e.target.closest('[data-act],[data-brand],[data-project],[data-remove-ref]');
        if (!el) return;
        if (el.dataset.brand) { brandId = el.dataset.brand; projectId = null; return render(); }
        if (el.dataset.project) { projectId = el.dataset.project; return render(); }
        if (el.dataset.removeRef !== undefined) {
            const i = Number(el.dataset.removeRef);
            const target = currentTarget();
            updateTarget({ refs: target.refs.filter((_, j) => j !== i) });
            return render();
        }
        switch (el.dataset.act) {
            case 'close': return close();
            // Electron has no window.prompt(): create with a placeholder name and focus the name field.
            case 'new-brand':
                brandId = createBrand(t('brand.untitledBrand')).id; projectId = null;
                render(); return focusName();
            case 'new-project':
                projectId = createProject(brandId, t('brand.untitledProject')).id;
                render(); return focusName();
            case 'use': setActive(brandId, projectId); return close();
            case 'delete': {
                if (!confirm(t('brand.deleteConfirm'))) return;
                if (projectId) {
                    update((b) => ({ ...b, projects: b.projects.filter((p) => p.id !== projectId) }));
                    projectId = null;
                } else {
                    saveBrands(getBrands().filter((b) => b.id !== brandId));
                    if (getActive().brandId === brandId) setActive(null);
                    brandId = getBrands()[0]?.id || null;
                }
                return render();
            }
        }
    });

    const focusName = () => {
        const el = modal.querySelector('[data-field="name"]');
        el?.focus(); el?.select();
    };

    const currentTarget = () => {
        const brand = getBrands().find((b) => b.id === brandId);
        return brand?.projects.find((p) => p.id === projectId) || brand;
    };

    modal.addEventListener('input', (e) => {
        const field = e.target.dataset.field;
        if (field && field !== 'name') updateTarget({ [field]: e.target.value });
    });
    modal.addEventListener('change', async (e) => {
        const field = e.target.dataset.field;
        if (field === 'name') {
            if (e.target.value.trim()) updateTarget({ name: e.target.value.trim() });
            return render();
        }
        if (field) return;
        if (e.target.dataset.act !== 'add-ref') return;
        const files = [...e.target.files];
        const status = modal.querySelector('[data-upload-label]');
        const error = modal.querySelector('[data-ref-error]');
        status.textContent = '…';
        try {
            // References are sent to the image model, so they need a hosted URL.
            const urls = await Promise.all(files.map((f) => muapi.uploadFile(f)));
            updateTarget({ refs: [...(currentTarget().refs || []), ...urls] });
            render();
        } catch (err) {
            status.textContent = '+';
            error.textContent = `${t('brand.refUploadFailed')} ${err.message}`;
        }
    });

    render();
    return overlay;
}

function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
