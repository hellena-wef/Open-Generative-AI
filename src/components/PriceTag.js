import { t } from '../lib/i18n.js';
import { estimatePrice, formatUsd } from '../lib/pricing.js';

// Shows what the next generation will cost as a small tag pinned to the generate
// button's top edge, so it takes no room from the option pills.
// getRequest() returns { local: true }, { endpoint, payload }, or null (nothing to price).
export function attachPriceTag(generateBtn, getRequest) {
    const tag = document.createElement('span');
    tag.className = 'absolute -top-2.5 right-3 z-10 px-2 py-1 rounded-full bg-black border border-white/10 shadow-sm font-mono text-[10px] uppercase tracking-[0.08em] text-white whitespace-nowrap leading-none pointer-events-none empty:hidden';
    tag.title = t('price.tooltip');
    const wrap = document.createElement('div');
    wrap.className = 'relative shrink-0';
    generateBtn.replaceWith(wrap);
    wrap.append(generateBtn, tag);

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
