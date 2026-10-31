// The shared React studios (open workflow, workflow builder, agents) are drawn dark,
// with hardcoded dark backgrounds. The app's light theme maps "white" to ink, which
// makes their text dark-on-dark. This config rebuilds just their utilities with stock
// Tailwind colors, scoped under .dark-island so nothing leaks into the rest of the app.
const base = require('../../tailwind.config.js');

module.exports = {
    content: [
        './packages/Vibe-Workflow/packages/workflow-builder/src/**/*.{js,jsx}',
        './packages/studio/src/components/WorkflowStudio.jsx',
        './packages/studio/src/components/AgentStudio.jsx',
    ],
    important: '.dark-island',
    corePlugins: { preflight: false },
    theme: { extend: { fontFamily: base.theme.extend.fontFamily } },
};
