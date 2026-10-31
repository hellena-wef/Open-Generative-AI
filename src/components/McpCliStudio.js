import { t, tf } from '../lib/i18n.js';

export function McpCliStudio() {
    const container = document.createElement('div');
    container.className = 'w-full h-full overflow-y-auto bg-app-bg text-white';

    const inner = document.createElement('div');
    inner.className = 'max-w-5xl mx-auto px-6 py-12 flex flex-col gap-12';
    container.appendChild(inner);

    // Hero
    const hero = document.createElement('section');
    hero.className = 'flex flex-col items-center text-center gap-4';
    hero.innerHTML = `
        <div class="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-bold uppercase tracking-widest text-secondary">
            ${t('mcp.tagline')}
        </div>
        <h1 class="text-4xl md:text-5xl font-bold tracking-tight">${t('mcp.title')}</h1>
        <p class="text-secondary text-base md:text-lg max-w-2xl">
            ${t('mcp.subtitle')}
        </p>
    `;
    inner.appendChild(hero);

    // Quick start
    const quick = document.createElement('section');
    quick.className = 'glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-4';
    quick.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold uppercase tracking-widest text-secondary">${t('mcp.quickStart')}</span>
            <div class="flex-1 h-px bg-white/5"></div>
        </div>
        <div class="grid md:grid-cols-3 gap-4">
            ${quickStep('1', t('mcp.stepInstall'), 'npm install -g muapi-cli')}
            ${quickStep('2', t('mcp.stepSignIn'), 'muapi auth login')}
            ${quickStep('3', t('mcp.stepGenerate'), 'npx skills add SamurAIGPT/muapi-skills')}
        </div>
    `;
    inner.appendChild(quick);

    // Feature cards
    const cards = document.createElement('section');
    cards.className = 'grid md:grid-cols-3 gap-4';

    cards.appendChild(featureCard({
        tag: 'CLI',
        title: 'muapi-cli',
        body: t('mcp.cliBody'),
        code: 'npm install -g muapi-cli\nmuapi image generate "a cyberpunk city" \\\n  --model flux-dev',
        link: 'https://github.com/SamurAIGPT/muapi-cli',
        linkLabel: tf('mcp.viewNamedOnGithub', 'muapi-cli'),
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    }));

    cards.appendChild(featureCard({
        tag: 'MCP',
        title: 'muapi-mcp-server',
        body: t('mcp.serverBody'),
        code: 'claude mcp add --transport http muapi \\\n  https://api.muapi.ai/mcp \\\n  --header "Authorization: Bearer YOUR_KEY"',
        link: 'https://github.com/SamurAIGPT/muapi-mcp-server',
        linkLabel: tf('mcp.viewNamedOnGithub', 'muapi-mcp-server'),
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"/></svg>`,
    }));

    cards.appendChild(featureCard({
        tag: t('mcp.tagSkills'),
        title: 'Generative Media Skills',
        body: t('mcp.skillsBody'),
        code: 'npx skills add SamurAIGPT/muapi-skills --all',
        link: 'https://github.com/SamurAIGPT/muapi-skills',
        linkLabel: tf('mcp.viewNamedOnGithub', 'muapi-skills'),
        icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l2.39 4.84L20 8l-4 3.9.94 5.5L12 14.77 7.06 17.4 8 11.9 4 8l5.61-1.16L12 2z"/></svg>`,
    }));

    inner.appendChild(cards);

    // Usage examples
    const examples = document.createElement('section');
    examples.className = 'flex flex-col gap-4';
    examples.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold uppercase tracking-widest text-secondary">${t('mcp.examples')}</span>
            <div class="flex-1 h-px bg-white/5"></div>
        </div>
        <div class="grid md:grid-cols-2 gap-4">
            ${exampleBlock(t('mcp.exImage'), 'muapi image generate "a serene mountain lake at sunrise" \\\n  --model flux-dev --download ./outputs')}
            ${exampleBlock(t('mcp.exVideo'), 'muapi video generate "a dog running on a beach" \\\n  --model kling-master')}
            ${exampleBlock(t('mcp.exAudio'), 'muapi audio create "upbeat lo-fi hip hop for studying"')}
            ${exampleBlock(t('mcp.exSkill'), 'bash library/visual/nano-banana/scripts/\\\n  generate-nano-art.sh --file image.jpg --view')}
        </div>
    `;
    inner.appendChild(examples);

    // NEW FEATURE: Interactive Command Generator Playground
    const playground = document.createElement('section');
    playground.className = 'glass-panel rounded-2xl p-6 md:p-8 flex flex-col gap-6';
    playground.innerHTML = `
        <div class="flex items-center gap-2">
            <span class="text-[11px] font-bold uppercase tracking-widest text-secondary">${t('mcp.builder')}</span>
            <div class="flex-1 h-px bg-white/5"></div>
        </div>
        <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex flex-col gap-1.5 flex-1 w-full">
                <label class="text-[11px] font-bold tracking-wider uppercase text-secondary">${t('mcp.targetModel')}</label>
                <select id="modelSelector" class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                    <option value="image generate 'a retro-futuristic synthwave car' --model flux-dev">FLUX.1 Dev (${t('mcp.kindImage')})</option>
                    <option value="image generate 'oil painting of an astronaut' --model midjourney">Midjourney (${t('mcp.kindImage')})</option>
                    <option value="video generate 'cinematic drone shot of an ancient castle' --model kling-master">Kling Master (${t('mcp.kindVideo')})</option>
                    <option value="video generate 'cyberpunk neon alleyway rain' --model luma-ray">Luma Ray (${t('mcp.kindVideo')})</option>
                    <option value="audio create 'ambient electronic space synth for gaming'">Lyria 3 (${t('mcp.kindAudio')})</option>
                </select>
            </div>
            <div class="flex flex-col gap-1.5 flex-1 w-full">
                <label class="text-[11px] font-bold tracking-wider uppercase text-secondary">${t('mcp.outputFormat')}</label>
                <select id="flagSelector" class="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30">
                    <option value="">${t('mcp.fmtDefault')}</option>
                    <option value=" --output-json">${t('mcp.fmtJson')}</option>
                    <option value=" --output-json | jq '.data.url'">${t('mcp.fmtJq')}</option>
                </select>
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <span class="text-[12px] font-bold text-white/80">${t('mcp.generatedCommand')}</span>
            <pre id="interactiveTerminal" class="text-[12px] font-mono text-primary bg-black/60 border border-white/5 rounded-lg px-4 py-3 overflow-x-auto whitespace-pre"></pre>
        </div>
    `;
    inner.appendChild(playground);

    // Event listener block to power the dynamic playground execution
    const modelSel = playground.querySelector('#modelSelector');
    const flagSel = playground.querySelector('#flagSelector');
    const termDisp = playground.querySelector('#interactiveTerminal');

    const updateCommandDisplay = () => {
        termDisp.textContent = `muapi ${modelSel.value}${flagSel.value}`;
    };

    modelSel.addEventListener('change', updateCommandDisplay);
    flagSel.addEventListener('change', updateCommandDisplay);
    updateCommandDisplay(); // Run once immediately on build mount

    // Footer note
    const footer = document.createElement('p');
    footer.className = 'text-center text-xs text-secondary opacity-60 pb-4';
    footer.textContent = t('mcp.footer');
    inner.appendChild(footer);

    return container;
}

function quickStep(num, title, code) {
    return `
        <div class="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2">
            <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center">${num}</span>
                <span class="text-sm font-bold">${title}</span>
            </div>
            <code class="text-[12px] font-mono text-primary bg-black/40 rounded-md px-2 py-1.5 break-all">${escapeHtml(code)}</code>
        </div>
    `;
}

function featureCard({ tag, title, body, code, link, linkLabel, icon }) {
    const card = document.createElement('a');
    card.href = link;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.setAttribute('aria-label', linkLabel);
    card.className = 'glass-panel rounded-2xl p-6 flex flex-col gap-3 hover:bg-white/[0.04] transition-colors group';
    card.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">${icon}</div>
            <span class="text-[10px] font-bold uppercase tracking-widest text-secondary">${tag}</span>
        </div>
        <h3 class="text-lg font-bold">${title}</h3>
        <p class="text-[13px] text-secondary leading-relaxed">${body}</p>
        <pre class="text-[11px] font-mono text-primary bg-black/40 rounded-md px-3 py-2 overflow-x-auto whitespace-pre">${escapeHtml(code)}</pre>
        <div class="flex items-center gap-1 text-[12px] font-bold text-secondary group-hover:text-white transition-colors mt-auto">
            <span>${t('mcp.viewOnGithub')}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </div>
    `;
    return card;
}

function exampleBlock(title, code) {
    return `
        <div class="rounded-xl border border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2">
            <span class="text-[12px] font-bold text-white/80">${title}</span>
            <pre class="text-[11px] font-mono text-primary bg-black/40 rounded-md px-3 py-2 overflow-x-auto whitespace-pre">${escapeHtml(code)}</pre>
        </div>
    `;
}

function escapeHtml(s) {
    return s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
