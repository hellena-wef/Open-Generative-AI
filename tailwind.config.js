/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./packages/studio/src/**/*.{js,jsx}",
        "./packages/Open-AI-Design-Agent/packages/design-agent/src/**/*.{js,jsx}",
        "./packages/Open-Poe-AI/packages/agents/src/**/*.{js,jsx,ts,tsx}",
        "./packages/Vibe-Workflow/packages/workflow-builder/src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Faísca brand: paper, ink and a red marker.
                // ponytail: the UI was written dark-first (text-white, bg-white/5, border-white/10
                // in ~400 places), so "white" now means ink and "black" means paper. Every
                // translucent white wash becomes a dark wash on light paper. Rename the classes
                // if a dark theme ever comes back.
                white: '#111111',
                black: '#FCFCFA',
                primary: {
                    DEFAULT: '#E5251E',
                    hover: '#C21C16',
                },
                'app-bg': '#FCFCFA',
                'panel-bg': '#F6F6F3',
                'card-bg': '#F1F1EE',
                secondary: '#55554F',
                muted: '#8A8A84',
                mint: '#A8F0E0',
                butter: '#FFE98A',
            },
            fontFamily: {
                sans: ['"Hanken Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
                script: ['"Mr Dafoe"', 'cursive'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'glow': '0 0 0 1px rgba(229, 37, 30, 0.35)',
                'glow-sm': '0 0 0 1px rgba(229, 37, 30, 0.25)',
                'glow-accent': '0 0 0 1px rgba(17, 17, 17, 0.2)',
                '3xl': '0 20px 40px -20px rgba(17, 17, 17, 0.18)',
            }
        },
    },
    plugins: [],
}
