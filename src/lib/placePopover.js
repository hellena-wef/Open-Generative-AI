// Positions a popover (dropdown, picker panel) next to its anchor button inside `container`
// (the popover's offset parent). It opens upward when it fits below the app header, otherwise
// downward, and scrolls when neither side has room — so it never ends up under the header.
const GAP = 8;
const MARGIN = 16;

export function placePopover(popover, anchor, container, { center = false } = {}) {
    const btn = anchor.getBoundingClientRect();
    const box = container.getBoundingClientRect();
    const headerBottom = document.querySelector('header')?.getBoundingClientRect().bottom || 0;
    const spaceAbove = btn.top - headerBottom - MARGIN;
    const spaceBelow = window.innerHeight - btn.bottom - MARGIN;

    popover.style.maxHeight = '';
    const needed = popover.scrollHeight;
    const openUp = needed <= spaceAbove || (needed > spaceBelow && spaceAbove >= spaceBelow);

    popover.style.maxHeight = `${Math.max(160, openUp ? spaceAbove : spaceBelow)}px`;
    popover.style.overflowY = 'auto';
    if (center) {
        popover.style.left = '50%';
        popover.style.transform = 'translateX(-50%)';
    } else {
        popover.style.left = `${btn.left - box.left}px`;
        popover.style.transform = '';
    }
    if (openUp) {
        popover.style.top = '';
        popover.style.bottom = `${box.bottom - btn.top + GAP}px`;
    } else {
        popover.style.bottom = '';
        popover.style.top = `${btn.bottom - box.top + GAP}px`;
    }
}
