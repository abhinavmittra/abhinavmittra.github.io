import { initializeWorkspace } from './app.js';

const root = document.getElementById('workspace-root');
if (!root) throw new Error('Workspace mount element was not found.');

const content = window.systemsDeskContent ?? await import('./content.js');
const cleanup = initializeWorkspace(root, content);
window.dispatchEvent(new CustomEvent('systems-desk:initialized', { detail: cleanup }));
