import { SettingsModal } from './SettingsModal.js';
import { t, getLang, setLang, LANGUAGES } from '../lib/i18n.js';
import { BrandManager } from './BrandManager.js';
import { getBrands, getActive, setActive, BRAND_CHANGE_EVENT } from '../lib/brands.js';

export function Header(navigate) {
    const header = document.createElement('header');
    header.className = 'w-full flex flex-col z-50 sticky top-0';


    // 2. Main Navigation Bar
    const navBar = document.createElement('div');
    navBar.className = 'w-full h-16 bg-black flex items-center justify-between px-4 md:px-6 border-b border-white/5 backdrop-blur-md bg-opacity-95';

    const leftPart = document.createElement('div');
    leftPart.className = 'flex items-center gap-8';

    // Logo
    const logoContainer = document.createElement('div');
    logoContainer.className = 'cursor-pointer flex items-center gap-2 group';
    logoContainer.innerHTML = `
        <svg width="28" height="28" viewBox="-50 -50 100 100" class="text-white transition-transform duration-500 group-hover:rotate-45" aria-hidden="true">
            <path fill="currentColor" d="M0-46C5-20 8-18 30-34 18-12 20-8 46-4 20 2 18 6 32 30 12 16 6 20 2 46-2 20-6 16-30 34-16 12-20 6-46 2-20-4-18-10-32-30-12-16-6-20 0-46Z"/>
        </svg>
        <span class="text-[22px] font-medium tracking-tight text-white leading-none">Faísca</span>
        <span class="font-mono text-[10px] uppercase tracking-[0.15em] text-secondary self-end">lab</span>
    `;

    const menu = document.createElement('nav');
    menu.className = 'hidden lg:flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.12em] text-secondary';
    const items = [
        { label: t('nav.image'),   page: 'image' },
        { label: t('nav.video'),   page: 'video' },
        { label: t('nav.lipsync'), page: 'lipsync' },
        { label: t('nav.cinema'),  page: 'cinema' },
        { label: t('nav.workflows'), page: 'workflows' },
        { label: t('nav.agents'),  page: 'agents' },
        { label: t('nav.mcpcli'),  page: 'mcp-cli' },
    ];

    const dot = document.createElement('div');
    dot.className = 'absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full';

    items.forEach(({ label, page }, idx) => {
        const link = document.createElement('a');
        link.textContent = label;
        link.className = `hover:text-white transition-all cursor-pointer relative group ${idx === 0 ? 'text-white' : ''}`;
        if (idx === 0) link.appendChild(dot);

        link.onclick = () => {
            Array.from(menu.children).forEach(child => child.classList.remove('text-white'));
            link.classList.add('text-white');
            link.appendChild(dot);
            navigate(page);
        };

        menu.appendChild(link);
    });

    leftPart.appendChild(logoContainer);
    leftPart.appendChild(menu);

    const rightPart = document.createElement('div');
    rightPart.className = 'flex items-center gap-4';

    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 text-[13px] font-bold text-white/80 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors';
    settingsBtn.title = t('web.settingsTitle');
    settingsBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>${t('nav.settings')}</span>
    `;
    settingsBtn.onclick = () => {
        document.body.appendChild(SettingsModal());
    };

    // Language picker
    const langBtn = document.createElement('select');
    langBtn.className = 'px-2 py-1.5 rounded-md border border-white/10 bg-white/5 font-mono text-[11px] uppercase tracking-[0.1em] text-white/80 hover:text-white hover:border-white/20 transition-colors cursor-pointer outline-none';
    langBtn.title = t('web.language');
    langBtn.setAttribute('aria-label', t('web.language'));
    for (const [code, name] of Object.entries(LANGUAGES)) {
        langBtn.add(new Option(name, code, false, code === getLang()));
    }
    langBtn.onchange = () => setLang(langBtn.value);

    // Brand / project picker: the active look is applied to every generation.
    const brandSelect = document.createElement('select');
    brandSelect.className = 'max-w-[16rem] px-2 py-1.5 rounded-md border border-primary/30 bg-primary/5 text-[13px] font-medium text-white hover:border-primary/60 transition-colors cursor-pointer outline-none';
    brandSelect.title = t('brand.pickerTitle');
    brandSelect.setAttribute('aria-label', t('brand.pickerTitle'));
    const fillBrands = () => {
        const { brandId, projectId } = getActive();
        brandSelect.replaceChildren(new Option(t('brand.none'), ''));
        for (const b of getBrands()) {
            brandSelect.add(new Option(b.name, b.id, false, b.id === brandId && !projectId));
            for (const p of b.projects) {
                brandSelect.add(new Option(`${b.name} · ${p.name}`, `${b.id}/${p.id}`, false, b.id === brandId && p.id === projectId));
            }
        }
        brandSelect.add(new Option(`${t('brand.manage')}…`, '__manage'));
    };
    brandSelect.onchange = () => {
        if (brandSelect.value === '__manage') {
            fillBrands();
            document.body.appendChild(BrandManager());
            return;
        }
        const [brandId, projectId] = brandSelect.value.split('/');
        setActive(brandId || null, projectId || null);
    };
    window.addEventListener(BRAND_CHANGE_EVENT, fillBrands);
    fillBrands();

    rightPart.appendChild(brandSelect);
    rightPart.appendChild(langBtn);
    rightPart.appendChild(settingsBtn);

    navBar.appendChild(leftPart);
    navBar.appendChild(rightPart);

    header.appendChild(navBar);

    return header;
}
