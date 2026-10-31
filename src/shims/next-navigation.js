// Desktop-only stand-in for next/navigation (aliased in vite.config.mjs).
// Each React studio gets its own in-memory path, so the Workflows and Agents tabs
// don't fight over one URL and nothing touches file:// location.
import { createContext, createElement, useContext, useMemo, useState } from 'react';

const RouterContext = createContext({ path: '/', router: null });

export function RouterProvider({ initialPath = '/', children }) {
    const [path, setPath] = useState(initialPath);
    const router = useMemo(() => {
        const go = (url) => {
            // WorkflowStudio reloads the whole window when it sees this flag after leaving
            // the builder (a Next-era CSS reset). In the desktop app that would wipe every tab.
            try { sessionStorage.removeItem('fromWorkflowBuilder'); } catch { /* ignore */ }
            setPath(String(url).split(/[?#]/)[0] || '/');
        };
        return { push: go, replace: go, back() {}, forward() {}, refresh() {}, prefetch() {} };
    }, []);
    return createElement(RouterContext.Provider, { value: { path, router } }, children);
}

// Same shapes the Next routes produce:
//   /workflow/:id/:tab   -> { id, tab }
//   /agents/edit/:id     -> { id }
//   anything else        -> { tab: [...segments] }  (the [[...tab]] catch-all)
export function paramsFor(path) {
    const s = path.split('/').filter(Boolean).map(decodeURIComponent);
    if (s[0] === 'workflow' && s[1]) return s[2] ? { id: s[1], tab: s[2] } : { id: s[1] };
    if (s[0] === 'agents' && s[1] === 'edit' && s[2]) return { id: s[2] };
    return { tab: s };
}

export function useRouter() {
    return useContext(RouterContext).router;
}

export function usePathname() {
    return useContext(RouterContext).path;
}

export function useParams() {
    const { path } = useContext(RouterContext);
    return useMemo(() => paramsFor(path), [path]);
}
