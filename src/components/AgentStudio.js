import { Suspense, createElement as h, lazy } from 'react';
import Studio from 'studio/AgentStudio';
import { usePathname } from '../shims/next-navigation.js';
import { mountReactStudio } from '../lib/reactStudio.js';

// The studio's AgentStudio does list / chat / create inline; edit lives in the ai-agent package.
const EditAgentPage = lazy(() => import('ai-agent/src/EditPage.jsx'));

function AgentsView({ apiKey }) {
    const path = usePathname();
    if (path.startsWith('/agents/edit/')) {
        const useUser = () => ({ user: null, isAuthorized: !!apiKey });
        return h(Suspense, { fallback: null }, h(EditAgentPage, { useUser, usedIn: 'studio' }));
    }
    // Every inline agents view is drawn dark (bg-[#030303] text-white).
    return h('div', { className: 'w-full h-full dark-island' }, h(Studio, { apiKey, locale: 'en' }));
}

export function AgentStudio() {
    return mountReactStudio(AgentsView, '/agents');
}
