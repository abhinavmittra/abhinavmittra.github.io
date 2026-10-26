/** Original trail-navigation illustration; never substitutes for the A•WAKE logo. */
export function BackpackerStep({ direction }: { direction: 'previous' | 'next' }) {
  const previous = direction === 'previous';
  return <svg viewBox="0 0 104 52" width="84" height="42" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {previous ? <g opacity=".65"><path d="M3 42q7-5 14 0t14 0M4 47q7-5 14 0t14 0M15 38l5-23M8 19q7-11 17-5M20 15q10-4 12 5M20 15q-9 1-12 9"/><circle cx="7" cy="8" r="3"/></g> : <g opacity=".65"><path d="m67 42 16-28 18 28H67Zm-8 0 11-19 7 9M78 23l5 3 4-4"/><circle cx="95" cy="9" r="3"/></g>}
    <g transform={previous ? 'translate(103 0) scale(-1 1)' : undefined}>
      <path d="M43 8c0-5 9-5 10 0v4l-3 3-5-2Z" fill="currentColor" stroke="none"/>
      <path d="M43 7h13M45 17q4-3 8 1l4 12-11 3-5-9Z" fill="currentColor" stroke="none"/>
      <path d="m44 31-7 10-5 5h8l8-11m2-3 5 8 4 6h8l-8-10-4-8" strokeWidth="3.4"/>
      <path d="m52 20 7 5 5-4" strokeWidth="3"/>
      <path d="M61 15h8l-1 8h-6ZM61 14h8M64 10q-2-2 0-4"/>
      <path d="M35 16q2-3 7-1l1 14-9 1-2-8Z" fill="currentColor"/>
      <path d="m35 19 5-1m-5 8 5-1" stroke="var(--brew-surface)" strokeWidth="1"/>
      <path d="M36 11v5m3-6v5"/>
    </g>
  </svg>;
}
