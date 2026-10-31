import { t } from '../lib/i18n.js';
import { estimatePrice, formatUsd } from '../lib/pricing.js';

// Shows what the next generation will cost, next to the generate button.
// getRequest() returns { local: true }, { endpoint, payload }, or null (nothing to price).
export function attachPriceTag(generateBtn, getRequest) {
    const tag = document.createElement('span');
    tag.className = 'font-mono text-[11px] uppercase tracking-[0.1em] text-white whitespace-nowrap shrink-0 self-center mr-3';
    tag.title = t('price.tooltip');
    const wrap = document.createElement('div');
    wrap.className = 'flex items-center shrink-0';
    generateBtn.replaceWith(wrap);
    wrap.append(tag, generateBtn);

    let timer = null;
    let seq = 0;
    const refresh = async () => {
        const req = getRequest();
        const mine = ++seq;
        if (!req) { tag.textContent = ''; return; }
        if (req.local) { tag.textContent = t('price.free'); return; }
        tag.textContent = '…';
        try {
            const usd = await estimatePrice(req.endpoint, req.payload);
            if (mine !== seq) return;
            tag.textContent = usd == null ? '' : `≈ ${formatUsd(usd)}`;
        } catch {
            if (mine === seq) tag.textContent = '';
        }
    };
    // Listens to the whole document instead of hooking every picker in the studio,
    // and unhooks itself the first time it fires after the studio is gone.
    const events = ['click', 'change', 'input'];
    const schedule = () => {
        if (!tag.isConnected) {
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
