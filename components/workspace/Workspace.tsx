'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { profile, projects, stationCopy } from '@/content/portfolio';
import { initializeWorkspace } from './scene';

export function Workspace({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    return initializeWorkspace(root, { profile, projects, stationCopy });
  }, []);

  return <div id="workspace-root" ref={rootRef} style={{ position: 'fixed', inset: 0 }}>{children}</div>;
}
