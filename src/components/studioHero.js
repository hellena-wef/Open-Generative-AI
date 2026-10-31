import { t } from '../lib/i18n.js';

const SPARK_PATH = 'M0-46C5-20 8-18 30-34 18-12 20-8 46-4 20 2 18 6 32 30 12 16 6 20 2 46-2 20-6 16-30 34-16 12-20 6-46 2-20-4-18-10-32-30-12-16-6-20 0-46Z';

// Shared empty-state header for the studios: thin title, mono label row, subtitle.
export function studioHeroHTML(title, subtitle) {
    return `
        <h1 class="text-3xl sm:text-5xl md:text-7xl font-light text-white tracking-tight leading-none mb-8 selection:bg-primary selection:text-black text-center px-4">${title}</h1>
        <div class="w-full max-w-xl px-4 mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.15em] text-white">
            <span>Faísca</span>
            <svg width="12" height="12" viewBox="-50 -50 100 100" class="text-primary" aria-hidden="true"><path fill="currentColor" d="${SPARK_PATH}"/></svg>
            <span>${t('image.tagline')}</span>
        </div>
        <p class="text-secondary text-sm font-medium tracking-wide text-center px-4">${subtitle}</p>
    `;
}
