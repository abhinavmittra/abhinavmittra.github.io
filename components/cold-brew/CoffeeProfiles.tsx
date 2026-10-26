'use client';

import { useState, type CSSProperties } from 'react';
import { indianCoffeeProfiles } from '@/content/cold-brew';

/** An origin field guide, kept separate from the roast and flavour selectors. */
export function CoffeeProfiles() {
  const [selected, setSelected] = useState(0);
  const coffee = indianCoffeeProfiles[selected];
  return <div className="brew-origins">
    <h3>Three Indian coffee profiles</h3>
    <p className="brew-note">Process and grade shape the cup. Roast is a separate choice below.</p>
    <div className="brew-origin-options" aria-label="Explore Indian coffee profiles">
      {indianCoffeeProfiles.map((item, index) => <button key={item.key} aria-pressed={selected === index} aria-controls="coffee-origin-panel" onClick={() => setSelected(index)}>{item.name}</button>)}
    </div>
    <article id="coffee-origin-panel" className="brew-origin-card" aria-live="polite" style={{'--origin-bg': coffee.color, '--origin-ink': coffee.ink} as CSSProperties}>
      <p className="brew-origin-kind">{coffee.kind}</p>
      <h4>{coffee.headline}</h4>
      <p>{coffee.body}</p>
      <ol className="brew-origin-process" aria-label="Processing stages">{coffee.process.map(step => <li key={step}>{step}</li>)}</ol>
      <dl>
        <div><dt>In the cup</dt><dd>{coffee.notes}<small>{coffee.noteDetail}</small></dd></div>
        <div><dt>Elevation</dt><dd>{coffee.altitude}<small>{coffee.altitudeDetail}</small></dd></div>
      </dl>
      <p className="brew-origin-detail">{coffee.detail}</p>
      <details><summary>Read the field notes</summary><nav aria-label={`Sources for ${coffee.name}`}>{coffee.sources.map(source => <a key={source.href} href={source.href} target="_blank" rel="noopener noreferrer">{source.label} ↗</a>)}</nav></details>
    </article>
    <p className="brew-note">A tasting guide, not today’s stock list. Notes vary with the lot, roast and brew.</p>
  </div>;
}
