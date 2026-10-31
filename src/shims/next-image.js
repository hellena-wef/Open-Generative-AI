// Desktop-only stand-in for next/image: a plain <img> without Next's optimizer props.
import { createElement } from 'react';

export default function Image({ src, fill, priority, quality, placeholder, blurDataURL, unoptimized, loader, style, ...rest }) {
    const url = typeof src === 'object' ? src?.src : src;
    const fillStyle = fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%' } : null;
    return createElement('img', { ...rest, src: url, style: { ...fillStyle, ...style } });
}
