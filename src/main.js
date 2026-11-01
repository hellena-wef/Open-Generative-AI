import './style.css';
import { Header } from './components/Header.js';
import { ImageStudio } from './components/ImageStudio.js';
import { showNotice } from './components/ErrorBanner.js';

window.alert = showNotice;

const app = document.querySelector('#app');
let contentArea;

// Keep all mounted page nodes so async generation survives tab switches
const mountedPages = {};

// A tab is loaded on first visit. If its code can't be loaded (usually because the app
// was rebuilt while this window was open and the old file names are gone), reload once
// to pick up the new build instead of leaving a blank tab.
function mountLazy(wrapper, load, exportName) {
  load()
    .then((mod) => {
      sessionStorage.removeItem('faisca_chunk_reload');
      wrapper.appendChild(mod[exportName]());
    })
    .catch((err) => {
      console.error('[navigate] failed to load', exportName, err);
      if (!sessionStorage.getItem('faisca_chunk_reload')) {
        sessionStorage.setItem('faisca_chunk_reload', '1');
        location.reload();
        return;
      }
      wrapper.innerHTML = `<div class="m-auto max-w-md text-center text-secondary text-sm p-8">${err.message}</div>`;
    });
}

// Router — show/hide instead of destroy
function navigate(page) {
  if (!contentArea) return;

  // Hide all existing pages
  Object.values(mountedPages).forEach(node => { node.style.display = 'none'; });

  if (mountedPages[page]) {
    // Already mounted — just show it again
    mountedPages[page].style.display = '';
  } else {
    // First visit — create a wrapper and mount the studio into it
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column;';
    contentArea.appendChild(wrapper);
    mountedPages[page] = wrapper;

    if (page === 'image') {
      wrapper.appendChild(ImageStudio());
    } else if (page === 'video') {
      mountLazy(wrapper, () => import('./components/VideoStudio.js'), 'VideoStudio');
    } else if (page === 'cinema') {
      mountLazy(wrapper, () => import('./components/CinemaStudio.js'), 'CinemaStudio');
    } else if (page === 'lipsync') {
      mountLazy(wrapper, () => import('./components/LipSyncStudio.js'), 'LipSyncStudio');
    } else if (page === 'workflows') {
      mountLazy(wrapper, () => import('./components/WorkflowStudio.js'), 'WorkflowStudio');
    } else if (page === 'agents') {
      mountLazy(wrapper, () => import('./components/AgentStudio.js'), 'AgentStudio');
    } else if (page === 'mcp-cli') {
      mountLazy(wrapper, () => import('./components/McpCliStudio.js'), 'McpCliStudio');
    }
  }
}

app.innerHTML = '';
// Pass navigate to Header so links work
app.appendChild(Header(navigate));

contentArea = document.createElement('main');
contentArea.id = 'content-area';
contentArea.className = 'flex-1 relative w-full overflow-hidden flex flex-col bg-app-bg';
app.appendChild(contentArea);

// Initial Route
navigate('image');

// Event Listener for Navigation
window.addEventListener('navigate', (e) => {
  if (e.detail.page === 'settings') {
    import('./components/SettingsModal.js').then(({ SettingsModal }) => {
      document.body.appendChild(SettingsModal());
    });
  } else {
    navigate(e.detail.page);
  }
});
