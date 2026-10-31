// Mounts one of the shared React studios (packages/studio) inside a desktop tab.
import { createElement as h, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from '../shims/next-navigation.js';
import { currentKey, installMuapiProxy } from './muapiProxy.js';
import '../styles/dark-island.css';

function useApiKey() {
    const [key, setKey] = useState(currentKey);
    useEffect(() => {
        // ponytail: 2s poll, because Settings/AuthModal write localStorage without an event.
        // Swap for a 'muapi-key-change' event if those ever dispatch one.
        const id = setInterval(() => setKey(currentKey()), 2000);
        return () => clearInterval(id);
    }, []);
    return key;
}

export function mountReactStudio(View, initialPath) {
    installMuapiProxy();
    const el = document.createElement('div');
    el.className = 'w-full h-full relative overflow-hidden flex flex-col';
    function Root() {
        const apiKey = useApiKey();
        return h(RouterProvider, { initialPath }, h(View, { apiKey }));
    }
    createRoot(el).render(h(Root));
    return el;
}
