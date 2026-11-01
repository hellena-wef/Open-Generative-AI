// The shared React studios (workflows, workflow builder, agents) are written dark-first,
// like the rest of the app was: white text, black/zinc/gray panels, blue and cyan accents.
// This config rebuilds just their utilities with the Faísca palette, scoped under
// .dark-island so nothing leaks into the rest of the app:
// white = ink, black = paper, gray/zinc scales inverted, blue/cyan/purple = marker red.
// Arbitrary hex classes (bg-[#0c0d0f] ...) can't be remapped here; dark-island.css handles them.
const base = require('../../tailwind.config.js');

const inverted = {
    50: '#111111', 100: '#1C1C1A', 200: '#2A2A27', 300: '#3D3D39', 400: '#55554F',
    500: '#8A8A84', 600: '#B5B5AE', 700: '#D6D6D0', 800: '#E4E1D8', 900: '#EFEDE6', 950: '#F6F6F3',
};
const red = {
    50: '#FDECEB', 100: '#FAD3D1', 200: '#F4A9A5', 300: '#EE7B75', 400: '#E5251E', 500: '#E5251E',
    600: '#C21C16', 700: '#A01712', 800: '#7E120E', 900: '#5C0D0A', 950: '#3A0806',
};

module.exports = {
    content: [
        './packages/Vibe-Workflow/packages/workflow-builder/src/**/*.{js,jsx}',
        './packages/studio/src/components/WorkflowStudio.jsx',
        './packages/studio/src/components/WorkflowUI.jsx',
        './packages/studio/src/components/AgentStudio.jsx',
    ],
    important: '.dark-island',
    corePlugins: { preflight: false },
    theme: {
        extend: {
            fontFamily: base.theme.extend.fontFamily,
            colors: {
                white: '#111111',
                black: '#FCFCFA',
                gray: inverted, zinc: inverted, neutral: inverted, slate: inverted,
                blue: red, cyan: red, sky: red, indigo: red, purple: red, violet: red,
            },
        },
    },
};
