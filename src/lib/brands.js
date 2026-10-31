// Brands and projects live only on this computer (localStorage).
// A brand holds a default look; a project inside it can add to that look.
// Shape: [{ id, name, style, avoid, ar, refs: [url], projects: [{ id, name, style, avoid, refs: [url] }] }]
const BRANDS_KEY = 'faisca_brands';
const ACTIVE_KEY = 'faisca_active_brand';
export const BRAND_CHANGE_EVENT = 'faisca-brand-change';

const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const newId = () => Math.random().toString(36).slice(2, 10);

export function getBrands() {
    return read(BRANDS_KEY, []);
}

export function saveBrands(brands) {
    write(BRANDS_KEY, brands);
    window.dispatchEvent(new CustomEvent(BRAND_CHANGE_EVENT));
}

export function createBrand(name) {
    const brand = { id: newId(), name, style: '', avoid: '', ar: '', refs: [], projects: [] };
    saveBrands([...getBrands(), brand]);
    return brand;
}

export function createProject(brandId, name) {
    const project = { id: newId(), name, style: '', avoid: '', refs: [] };
    saveBrands(getBrands().map((b) => (b.id === brandId ? { ...b, projects: [...b.projects, project] } : b)));
    return project;
}

/** { brandId, projectId } — either may be null (no brand = plain generation). */
export function getActive() {
    return read(ACTIVE_KEY, { brandId: null, projectId: null });
}

export function setActive(brandId, projectId = null) {
    write(ACTIVE_KEY, { brandId, projectId });
    window.dispatchEvent(new CustomEvent(BRAND_CHANGE_EVENT));
}

/** The active brand/project merged into what generation needs, or null when no brand is active. */
export function activeLook() {
    const { brandId, projectId } = getActive();
    const brand = getBrands().find((b) => b.id === brandId);
    if (!brand) return null;
    const project = brand.projects.find((p) => p.id === projectId) || null;
    const join = (...parts) => parts.map((s) => (s || '').trim()).filter(Boolean).join(', ');
    return {
        label: project ? `${brand.name} · ${project.name}` : brand.name,
        style: join(brand.style, project?.style),
        avoid: join(brand.avoid, project?.avoid),
        ar: brand.ar || '',
        refs: [...(brand.refs || []), ...(project?.refs || [])],
    };
}

/** The user's prompt with the brand look appended. */
export function applyLook(prompt, look) {
    if (!look) return prompt;
    let out = (prompt || '').trim();
    if (look.style) out = out ? `${out}. Style: ${look.style}` : `Style: ${look.style}`;
    if (look.avoid) out += `. Avoid: ${look.avoid}`;
    return out;
}
