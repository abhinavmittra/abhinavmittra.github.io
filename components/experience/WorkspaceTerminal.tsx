'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { commandDocuments, searchWorkspace, terminalActions, terminalSuggestions, type WorkspaceDocument, type WorkspaceTarget } from '@/content/workspace-search';
import type { SearchResult } from '@/lib/workspaceSearch';
import './workspace-terminal.css';

type Result = SearchResult<WorkspaceTarget>;
const asResult = (item: WorkspaceDocument): Result => ({
  ...item, score: 0,
  excerpt: `${item.aliases?.join(' · ') || ''} — ${item.text.length > 120 ? `${item.text.slice(0, 117).replace(/\s+\S*$/, '')}…` : item.text}`,
});
const starters = ['tour', 'brew', 'clock'].map(command => asResult(commandDocuments.find(item => item.id === `command:${command}`)!));

export function WorkspaceTerminal({ onSelect }: { onSelect: (target: WorkspaceTarget) => void }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(0);
  const [selectionMade, setSelectionMade] = useState(false);
  const [lastAction, setLastAction] = useState('');
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const id = useId();
  const help = ['help', '?'].includes(query.trim().toLowerCase());
  const clear = query.trim().toLowerCase() === 'clear';
  const results = useMemo(() => help ? terminalActions.map(asResult) : query.trim() ? searchWorkspace(query) : starters, [query, help]);
  const selected = Math.min(active, Math.max(0, results.length - 1));
  const shown = expanded && !clear && results.length > 0;
  function change(value: string) { setQuery(value); setActive(0); setSelectionMade(false); setExpanded(true); }
  function choose(result: Result) {
    setLastAction(`${query.trim() || result.title} → ${result.title}`);
    setQuery('');
    // Return focus to the launcher before a dialog captures its restore-focus target.
    input.current?.focus({ preventScroll: true });
    setExpanded(false);
    onSelect(result.target);
  }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setExpanded(false); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setExpanded(true);
      setSelectionMade(true);
      setActive(current => results.length ? (current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) % results.length : 0);
    }
  }
  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !document.querySelector('dialog[open]')) {
        event.preventDefault(); input.current?.focus(); setExpanded(true);
      }
    };
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setExpanded(false); };
    document.addEventListener('keydown', shortcut);
    document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', shortcut); document.removeEventListener('pointerdown', outside); };
  }, []);
  useEffect(() => {
    if (!expanded) return;
    const viewport = window.visualViewport;
    const measure = () => {
      if (!root.current) return;
      const bottom = root.current.getBoundingClientRect().bottom;
      const available = (viewport?.height ?? innerHeight) + (viewport?.offsetTop ?? 0) - bottom - 12;
      root.current.style.setProperty('--terminal-room', `${Math.max(120, available)}px`);
    };
    if (matchMedia('(max-width: 800px)').matches) root.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
    measure();
    viewport?.addEventListener('resize', measure);
    viewport?.addEventListener('scroll', measure);
    window.addEventListener('resize', measure);
    return () => {
      viewport?.removeEventListener('resize', measure);
      viewport?.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [expanded]);
  useEffect(() => {
    if (shown) document.getElementById(`${id}-option-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }, [id, selected, shown]);
  return <div className="workspace-terminal" ref={root} data-ui data-expanded={expanded}
    onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false); }}>
    <div className="terminal-chrome">
      <span className="terminal-lights" aria-hidden="true"><i/><i/><i/></span>
      <span>abhi’s workspace</span><kbd aria-hidden="true">⌘ / Ctrl K</kbd>
    </div>
    <form className="terminal-prompt" role="search" aria-label="Search the workspace" onSubmit={event => {
      event.preventDefault();
      if (composing.current) return;
      if (clear) { setQuery(''); setLastAction(''); setActive(0); setExpanded(false); }
      else if (!expanded || (help && !selectionMade)) setExpanded(true);
      else if (results[selected]) choose(results[selected]);
    }}>
      <span aria-hidden="true">abhi ~ %</span>
      <input ref={input} role="combobox" aria-label="Search content or run a workspace command"
        aria-autocomplete="list" aria-expanded={shown} aria-controls={expanded ? `${id}-results` : undefined}
        aria-activedescendant={shown ? `${id}-option-${selected}` : undefined}
        aria-describedby={expanded ? `${id}-hint` : undefined} value={query} maxLength={180}
        placeholder="Find a project, a place, a coffee…" autoComplete="off" autoCapitalize="none" spellCheck={false}
        onFocus={() => setExpanded(true)} onChange={event => change(event.target.value)} onKeyDown={keyDown}
        onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}/>
      <button type="submit" aria-label={clear ? 'Clear terminal' : 'Open selected result'}>↵</button>
    </form>
    {expanded && <div className="terminal-output">
      <div className="terminal-output-heading"><span>{help ? 'Commands & shortcuts' : clear ? 'Clear the terminal' : query.trim() ? `${results.length} matching ${results.length === 1 ? 'destination' : 'destinations'}` : 'Where to?'}</span>
        <button type="button" aria-label="Close search results" onClick={() => { input.current?.focus(); setExpanded(false); }}>×</button></div>
      <div id={`${id}-results`} role="listbox" aria-label="Workspace results" className="terminal-results">
        {!clear && results.map((result, index) => <div key={result.id} id={`${id}-option-${index}`} role="option"
          aria-selected={index === selected} className="terminal-result"
          onPointerMove={() => { setSelectionMade(true); if (active !== index) setActive(index); }}
          onPointerDown={event => event.preventDefault()} onClick={() => choose(result)}>
          <div className="terminal-result-location">{result.location}<span aria-hidden="true">{result.target.kind === 'command' ? 'run ↵' : 'open ↗'}</span></div>
          <strong>{result.title}</strong><p>{result.excerpt}</p>
        </div>)}
      </div>
      {!results.length && !clear && <p className="terminal-empty">No match yet. Try a technology, country or coffee flavour. <button type="button" onClick={() => change('help')}>Show commands</button></p>}
      {clear && <p className="terminal-empty">Press Enter to clear your last action and search.</p>}
      {!query.trim() && <div className="terminal-suggestions">{terminalSuggestions.map(value => <button type="button" key={value} onClick={() => { change(value); input.current?.focus(); }}>{value}</button>)}</div>}
      <p className="terminal-hint" id={`${id}-hint`}>↑ ↓ to choose · Enter to open · Esc to close · help for commands</p>
    </div>}
    {!expanded && lastAction && <p className="terminal-last" title={lastAction}>{lastAction}</p>}
    <span className="sr-only" role="status" aria-live="polite">{expanded && query.trim() && !clear ? `${results.length} ${results.length === 1 ? 'result' : 'results'}. ${results[0]?.title || 'Try another search.'}` : lastAction}</span>
  </div>;
}
