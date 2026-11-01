import { t } from '../lib/i18n.js';
import { estimatePrice, formatUsd } from '../lib/pricing.js';

// Shows what the next generation will cost inside the generate button, after its label
// ("Gerar ✨ · US$ 0,03"). It lives in a data attribute drawn by CSS (.price-tag::after),
// so the many places that reset the button's label don't wipe it.
// getRequest() returns { local: true }, { endpoint, payload }, or null (nothing to price).
export function attachPriceTag(generateBtn, getRequest) {
    // The app's CSS tooltips draw with ::before/::after too, so the button keeps its hint
    // as a native title instead.
    const hint = generateBtn.getAttribute('data-tooltip');
    generateBtn.removeAttribute('data-tooltip');
    generateBtn.classList.add('price-tag');
    generateBtn.title = [hint, t('price.tooltip')].filter(Boolean).join(' · ');
    const set = (text) => {
        if (text) generateBtn.dataset.price = text;
        else delete generateBtn.dataset.price;
    };

    let timer = null;
    let seq = 0;
    const refresh = async () => {
        const req = getRequest();
        const mine = ++seq;
        if (!req) return set('');
        if (req.local) return set(t('price.freeShort'));
        try {
            const usd = await estimatePrice(req.endpoint, req.payload);
            if (mine === seq) set(usd == null ? '' : formatUsd(usd));
        } catch {
            if (mine === seq) set('');
        }
    };
    // Listens to the whole document instead of hooking every picker in the studio,
    // and unhooks itself the first time it fires after the studio is gone.
    const events = ['click', 'change', 'input'];
    const schedule = () => {
        if (!generateBtn.isConnected) {
            for (const ev of events) document.removeEventListener(ev, schedule, true);
            return;
        }
        clearTimeout(timer);
        timer = setTimeout(refresh, 300);
    };
    for (const ev of events) document.addEventListener(ev, schedule, true);
    queueMicrotask(refresh);
    return { refresh: schedule };
}
