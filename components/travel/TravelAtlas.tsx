'use client';

import {useEffect,useRef,useState} from 'react';
import {profile} from '@/content/portfolio';
import {visitedCountries,nextCountries,travel} from '@/content/travel';
import {globePalette} from './geography';
import {createTravelGlobe} from './travelGlobe';
import {sitePath} from '@/lib/sitePath';

export function TravelAtlas(){
  const [selected,setSelected]=useState<string>('IND');
  const [spin,setSpin]=useState(true);
  const [rolling,setRolling]=useState(true);
  const [expanded,setExpanded]=useState(false);
  const [gentle,setGentle]=useState(false);
  const [status,setStatus]=useState('Loading the map…');
  const [failed,setFailed]=useState(false);
  const [attempt,setAttempt]=useState(0);
  const host=useRef<HTMLDivElement>(null),mini=useRef<HTMLDivElement>(null);
  const runtime=useRef<ReturnType<typeof createTravelGlobe>|null>(null);
  const selection=useRef(selected),turning=useRef(spin);selection.current=selected;turning.current=spin;
  const country=visitedCountries.find(c=>c.code===selected)||visitedCountries[0];
  useEffect(()=>{
    const abort=new AbortController();const media=matchMedia('(prefers-reduced-motion: reduce)');setGentle(media.matches);
    const motion=(e:MediaQueryListEvent)=>setGentle(e.matches);media.addEventListener('change',motion);
    setFailed(false);setStatus('Loading the map…');
    fetch(sitePath('/travel/countries.json'),{signal:abort.signal}).then(r=>{if(!r.ok)throw Error('Map unavailable');return r.json();}).then(records=>{
      if(abort.signal.aborted||!host.current||!mini.current)return;
      runtime.current=createTravelGlobe(host.current,mini.current,records,visitedCountries,{onSelect:(code:string)=>{setSelected(code);setSpin(false);},onInteract:()=>setSpin(false),onRenderer:setStatus});
      runtime.current.select(selection.current);runtime.current.setSpin(turning.current);
    }).catch(error=>{if(error.name!=='AbortError'){setFailed(true);setStatus('The globe couldn’t load. The country list is still here.');}});
    return()=>{abort.abort();media.removeEventListener('change',motion);runtime.current?.dispose();runtime.current=null;};
  },[attempt]);
  useEffect(()=>{runtime.current?.select(selected);},[selected]);
  useEffect(()=>{runtime.current?.setSpin(spin);},[spin]);
  function select(code:string){if(code===selected)runtime.current?.select(code);setSelected(code);setSpin(false);}
  const coordinate=(n:number,positive:string,negative:string)=>`${Math.abs(n).toFixed(2)}° ${n>=0?positive:negative}`;
  return <main className="travel-atlas" style={{'--map-visited':globePalette.visited,'--map-selected':globePalette.selected,'--map-land':globePalette.land} as React.CSSProperties}>
    <header className="travel-header"><a href={sitePath('/')}>← Systems Desk</a><nav aria-label="Travel navigation"><a href={profile.youtube} target="_blank" rel="noopener noreferrer">YouTube</a><a href={profile.instagram} target="_blank" rel="noopener noreferrer">Instagram</a><a href={sitePath('/cold-brew/')}>A•WAKE Cold Brew ↗</a></nav></header>
    <section className="travel-intro" aria-labelledby="travel-title"><div><h1 id="travel-title">29 countries. Still curious.</h1><p>Four years of backpacking, walking a little further, and stopping for coffee. Here’s where I’ve been.</p></div><div className="travel-progress"><strong>{travel.percent}%</strong><span>of the world’s countries</span><p>{travel.count} / {travel.total} visited</p><a href="#map-sources">How I’m counting ↓</a></div></section>
    <section className="travel-explorer" aria-label="Explore the countries I’ve visited">
      <div className="travel-list-heading"><h2>Every flag has a place.</h2><span>Choose a country to turn the globe.</span></div>
      <div className="travel-countries" id="visited-countries" data-expanded={expanded} aria-label="Visited countries">{visitedCountries.map(c=><button key={c.code} onClick={()=>select(c.code)} aria-pressed={selected===c.code} aria-controls="travel-globe" data-country={c.code}><img src={sitePath(`/travel/flags/${c.flag}.svg`)} width="24" height="18" alt=""/>{c.name}</button>)}</div>
      <button className="travel-list-toggle" aria-expanded={expanded} aria-controls="visited-countries" onClick={()=>setExpanded(!expanded)}>{expanded?'Show fewer countries ↑':'All 29 countries ↓'}</button>
      <div className="travel-globe-layout">
        <section className="travel-globe-stage" aria-label="Globe and rotation controls">
          <div className="travel-globe" id="travel-globe" ref={host}/>
          <div className={`travel-map-status${failed?' has-error':''}`} role="status">{status}{failed&&<button onClick={()=>setAttempt(attempt+1)}>Try loading again</button>}</div>
          <div className="travel-globe-controls"><button onClick={()=>setSpin(!spin)} disabled={gentle||failed} aria-pressed={spin&&!gentle}>{gentle?'Reduced motion':spin?'Pause turn':'Slow turn'}</button><button onClick={()=>{select('IND');runtime.current?.reset();}}>Back to India</button></div>
        </section>
        <aside className="travel-country-note">
          <div aria-live="polite" className="travel-selected"><img src={sitePath(`/travel/flags/${country.flag}.svg`)} width="56" height="42" alt=""/><div><h2>{country.name}</h2><p>{country.region}</p></div></div>
          <p className="travel-coordinate">{coordinate(country.latitude,'N','S')} · {coordinate(country.longitude,'E','W')}</p><p className="travel-coordinate-note">Map focus point, not a trip location.</p>
          <div className="travel-mini-map" ref={mini}/>
          <div className="travel-legend"><span><i className="visited"/>Visited</span><span><i className="selected"/>Selected: {country.name}</span><span><i/>Still to go</span></div>
          <p>Countries tell one part of the story. The walks, conversations and coffee stops are what I bring home.</p>
          <a href={profile.youtube} target="_blank" rel="noopener noreferrer">Backpacking Abi on YouTube</a><a href={profile.instagram} target="_blank" rel="noopener noreferrer">Backpacking Abi on Instagram</a>
        </aside>
      </div>
    </section>
    <section className="travel-next" aria-labelledby="next-country-title"><div className="travel-next-heading"><div><h2 id="next-country-title">Next country?</h2><p>Somewhere I haven’t been yet.</p></div><button onClick={()=>setRolling(!rolling)} disabled={gentle} aria-pressed={rolling&&!gentle}>{gentle?'Reduced motion':rolling?'Pause flags':'Roll the flags'}</button></div><div className="travel-next-window"><div className="travel-next-track" data-running={rolling&&!gentle}>{[0,1].map(copy=><ul key={copy} aria-hidden={copy===1||undefined}>{nextCountries.map(c=><li key={c.code}><img src={sitePath(`/travel/flags/${c.flag}.svg`)} alt="" width="36" height="27"/>{c.name}</li>)}</ul>)}</div></div></section>
    <footer className="travel-footer" id="map-sources"><details><summary>Map sources & counting countries</summary><p>The 29 visits are my own list. Coverage means countries visited, not land area: 29 ÷ 195 = {travel.percent}%. The denominator uses <a href="https://www.un.org/pga/81/general-assembly/" target="_blank" rel="noopener noreferrer">193 UN member states</a> and <a href="https://research.un.org/en/unmembers/observers" target="_blank" rel="noopener noreferrer">two observer states</a>.</p><p>Boundaries and focus coordinates: <a href="https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/" target="_blank" rel="noopener noreferrer">Natural Earth, 1:50m</a>, pinned to v5.1.2. Shapes are simplified for this display. Natural Earth uses de facto boundaries; disputed areas follow that dataset. A country highlight includes its mapped territories and does not claim a visit to every region.</p><p>Flags: <a href="https://github.com/lipis/flag-icons" target="_blank" rel="noopener noreferrer">flag-icons</a>, <a href={sitePath('/travel/flags/LICENSE')}>MIT licence</a>. All map and flag assets are hosted here.</p></details><a className="travel-back" href={sitePath('/')}>Back to the rest of my work ↗</a></footer>
  </main>;
}
