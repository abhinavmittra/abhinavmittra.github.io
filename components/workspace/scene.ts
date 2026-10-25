import type { Project, Profile, StationCopy } from '@/content/portfolio';
import { initializeWorkspace as initializeSceneRuntime } from './sceneRuntime.js';

export interface WorkspaceContent {
  profile: Profile;
  projects: Record<string, Project>;
  stationCopy: Record<string, StationCopy>;
}

export function initializeWorkspace(root: HTMLElement, content: WorkspaceContent): () => void {
  const cleanup = initializeSceneRuntime(root, content);
  if (typeof cleanup !== 'function') {
    throw new TypeError('Workspace scene initialization did not return a cleanup function.');
  }
  return cleanup;
}
