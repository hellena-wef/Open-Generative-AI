import { t } from '../lib/i18n.js';
import { explainError } from '../lib/explainError.js';

// A banner under the header that explains a failed generation and stays until closed.
export function showErrorBanner(err) {
    const { key, details } = explainError(err);
    document.getElementById('faisca-error-banner')?.remove();

    const banner = document.createElement('div');
    banner.id = 'faisca-error-banner';
    banner.setAttribute('role', 'alert');
    banner.className = 'fixed top-20 left-1/2 -translate-x-1/2 z-[150] w-[min(92vw,36rem)] bg-black border border-primary/40 rounded-2xl shadow-3xl p-4 pr-12';
    banner.innerHTML = `
        <p class="font-mono text-[10px] uppercase tracking-[0.12em] text-primary mb-1">${t('error.label')}</p>
        <p class="text-sm font-medium text-white mb-1"></p>
        <p class="text-sm text-secondary"></p>
        <details class="mt-3 text-xs text-secondary">
            <summary class="cursor-pointer select-none">${t('error.details')}</summary>
            <pre class="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] bg-white/5 rounded-lg p-2"></pre>
        </details>
        <button class="absolute top-3 right-3 w-8 h-8 rounded-full hover:bg-white/10 text-secondary hover:text-white flex items-center justify-center" aria-label="${t('common.close')}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
    `;
    const [, title, fix] = banner.querySelectorAll('p');
    title.textContent = t(`error.${key}.title`);
    fix.textContent = t(`error.${key}.fix`);
    banner.querySelector('pre').textContent = details || '—';
    if (!details) banner.querySelector('details').remove();
    banner.querySelector('button').onclick = () => banner.remove();
    document.body.appendChild(banner);
    return key;
}
