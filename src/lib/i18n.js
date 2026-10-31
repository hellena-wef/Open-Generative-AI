// All translations ship inside the app (src/lib/locales), so nothing is
// fetched or machine-translated at runtime. Missing keys fall back to English.
import en from './locales/en.js';
import ptBR from './locales/pt-BR.js';
import es from './locales/es.js';
import fr from './locales/fr.js';
import de from './locales/de.js';
import it from './locales/it.js';
import ja from './locales/ja.js';
import ko from './locales/ko.js';
import zhCN from './locales/zh-CN.js';

const LANG_KEY = 'og_lang';

/** Language code → native name, in the order the picker shows them. */
export const LANGUAGES = {
    'pt-BR': 'Português',
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    ja: '日本語',
    ko: '한국어',
    'zh-CN': '中文',
};

const translations = { en, 'pt-BR': ptBR, es, fr, de, it, ja, ko, 'zh-CN': zhCN };

/** Map stored values and OS/browser locales (pt-PT, zh_TW, es-419…) to a supported code. */
export function normalizeLang(raw) {
    if (!raw) return 'en';
    const base = String(raw).toLowerCase().replace('_', '-').split('-')[0];
    if (base === 'pt') return 'pt-BR';
    if (base === 'zh') return 'zh-CN';
    return base in translations ? base : 'en';
}

/** First run follows the computer's language; afterwards the user's choice sticks. */
export function getLang() {
    if (typeof localStorage === 'undefined') return 'en';
    const stored = localStorage.getItem(LANG_KEY);
    const lang = normalizeLang(stored || (typeof navigator !== 'undefined' ? navigator.language : 'en'));
    if (stored !== lang) localStorage.setItem(LANG_KEY, lang);
    return lang;
}

export const initLocale = getLang;

export function setLang(lang, { reload = true } = {}) {
    const normalized = normalizeLang(lang);
    localStorage.setItem(LANG_KEY, normalized);
    if (reload && typeof location !== 'undefined') {
        location.reload();
    } else if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('og_lang_change', { detail: normalized }));
    }
}

function lookup(key) {
    const dict = translations[getLang()];
    if (dict[key] !== undefined) return dict[key];
    return en[key] !== undefined ? en[key] : key;
}

export function t(key) {
    return lookup(key);
}

export function tf(key, ...args) {
    const val = lookup(key);
    return typeof val === 'function' ? val(...args) : val;
}
