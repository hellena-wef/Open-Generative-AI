// Desktop-only stand-in for next/dynamic: React.lazy + Suspense.
import { Suspense, createElement, lazy } from 'react';

export default function dynamic(loader, opts = {}) {
    const Lazy = lazy(() => loader().then((m) => ({ default: m.default ?? m })));
    const fallback = opts.loading ? createElement(opts.loading) : null;
    return (props) => createElement(Suspense, { fallback }, createElement(Lazy, props));
}
