// Compact aspect-ratio picker body: every ratio as a small tile with its shape drawn
// to scale, in a grid, so all options fit without scrolling.
export function ratioGrid(ratios, selected, onPick) {
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-4 gap-1.5 p-1';
    for (const r of ratios) {
        const [w, h] = String(r).split(':').map(Number);
        const valid = w > 0 && h > 0;
        const scale = valid ? 22 / Math.max(w, h) : 0;
        const tile = document.createElement('button');
        tile.type = 'button';
        tile.className = `flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl transition-colors ${r === selected ? 'bg-primary/10 text-primary' : 'text-white hover:bg-white/5'}`;
        tile.innerHTML = `
            <span class="flex items-center justify-center w-6 h-6">
                <span class="block rounded-[3px] border-2 ${r === selected ? 'border-primary' : 'border-white/40'}"
                      style="width:${valid ? Math.max(6, Math.round(w * scale)) : 18}px;height:${valid ? Math.max(6, Math.round(h * scale)) : 18}px"></span>
            </span>
            <span class="text-[11px] font-bold leading-none">${r}</span>`;
        tile.onclick = (e) => { e.stopPropagation(); onPick(r); };
        grid.appendChild(tile);
    }
    return grid;
}
