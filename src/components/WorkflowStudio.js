import { createElement as h } from 'react';
import Studio from 'studio/WorkflowStudio';
import { usePathname } from '../shims/next-navigation.js';
import { mountReactStudio } from '../lib/reactStudio.js';

function WorkflowsView({ apiKey }) {
    // The list follows the app's light theme; an open workflow (playground/builder) is drawn dark.
    const open = usePathname().startsWith('/workflow/');
    return h('div', { className: `w-full h-full${open ? ' dark-island' : ''}` }, h(Studio, { apiKey }));
}

export function WorkflowStudio() {
    return mountReactStudio(WorkflowsView, '/studio/workflows');
}
