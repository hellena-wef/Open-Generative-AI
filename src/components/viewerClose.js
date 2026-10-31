import { t } from '../lib/i18n.js';

// Lets the result viewer close with an X button, a click outside the media, or Esc.
export function addViewerClose(canvas, close) {
    const btn = document.createElement('button');
    btn.className = 'absolute top-4 right-28 md:right-32 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10';
    btn.setAttribute('aria-label', t('common.close'));
    btn.title = t('common.close');
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    btn.onclick = close;
    canvas.appendChild(btn);

    canvas.addEventListener('click', (e) => { if (e.target === canvas) close(); });
    const isOpen = () => !canvas.classList.contains('pointer-events-none');
    const onKey = (e) => {
        if (!canvas.isConnected) return document.removeEventListener('keydown', onKey);
        if (e.key === 'Escape' && isOpen()) close();
    };
    document.addEventListener('keydown', onKey);
}
