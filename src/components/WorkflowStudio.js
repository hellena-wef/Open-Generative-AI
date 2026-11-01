import { createElement as h } from 'react';
import Studio from 'studio/WorkflowStudio';
import { mountReactStudio } from '../lib/reactStudio.js';

// Published workflows without an author photo point at /user_profile.png, which only
// exists on the web app. Swap any broken image for a neutral avatar.
const FALLBACK_AVATAR = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="#E4E1D8"/><circle cx="8" cy="6.5" r="2.5" fill="#8A8A84"/><path d="M3.5 13a4.5 4.5 0 0 1 9 0" fill="#8A8A84"/></svg>'
);
const fixBrokenImages = (el) => {
    el?.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG' && e.target.src !== FALLBACK_AVATAR) e.target.src = FALLBACK_AVATAR;
    }, true);
};

function WorkflowsView({ apiKey }) {
    return h('div', { className: 'w-full h-full dark-island', ref: fixBrokenImages }, h(Studio, { apiKey }));
}

export function WorkflowStudio() {
    return mountReactStudio(WorkflowsView, '/studio/workflows');
}
