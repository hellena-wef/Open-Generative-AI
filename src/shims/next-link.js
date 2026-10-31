// Desktop-only stand-in for next/link: an <a> that routes through the in-memory router.
import { createElement } from 'react';
import { useRouter } from './next-navigation.js';

export default function Link({ href, children, prefetch, replace, scroll, ...rest }) {
    const router = useRouter();
    const url = typeof href === 'string' ? href : href?.pathname || '/';
    const onClick = (e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented || /^https?:/.test(url)) return;
        e.preventDefault();
        router?.push(url);
    };
    return createElement('a', { ...rest, href: url, onClick }, children);
}
