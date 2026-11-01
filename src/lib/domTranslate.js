// The shared React studios (workflows, agents) have their English text hardcoded, and
// the web app uses the same source, so instead of editing it the desktop translates
// what they render: exact-match text nodes and placeholder/title/aria-label attributes,
// using src/lib/locales/studios/<lang>.json (English string -> translation).
// ponytail: exact matches only; strings built from variables stay English.
import { getLang } from './i18n.js';

const bundles = import.meta.glob('./locales/studios/*.json', { import: 'default' });
const ATTRS = ['placeholder', 'title', 'aria-label'];

export async function loadStudioDictionary(lang = getLang()) {
    const load = bundles[`./locales/studios/${lang}.json`];
    return load ? load() : null;
}

/** Translate one text value, keeping its surrounding whitespace. */
export function translateText(text, dict) {
    const key = text.trim();
    const hit = key && dict[key];
    return hit ? text.replace(key, hit) : null;
}

function translateNode(node, dict) {
    if (node.nodeType === Node.TEXT_NODE) {
        const out = translateText(node.nodeValue, dict);
        if (out !== null && out !== node.nodeValue) node.nodeValue = out;
        return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    for (const attr of ATTRS) {
        const value = node.getAttribute(attr);
        const out = value && translateText(value, dict);
        if (out && out !== value) node.setAttribute(attr, out);
    }
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.nodeType === Node.TEXT_NODE) {
            const out = translateText(n.nodeValue, dict);
            if (out !== null && out !== n.nodeValue) n.nodeValue = out;
        } else {
            for (const attr of ATTRS) {
                const value = n.getAttribute(attr);
                const out = value && translateText(value, dict);
                if (out && out !== value) n.setAttribute(attr, out);
            }
        }
    }
}

/** Keep everything rendered under `root` translated, including later React updates. */
export async function translateTree(root) {
    const dict = await loadStudioDictionary();
    if (!dict) return;
    translateNode(root, dict);
    new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === 'characterData') translateNode(m.target, dict);
            else if (m.type === 'attributes') translateNode(m.target, dict);
            else m.addedNodes.forEach((n) => translateNode(n, dict));
        }
    }).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
