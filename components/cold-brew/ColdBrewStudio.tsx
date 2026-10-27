'use client';

import { useEffect, useRef, useState } from 'react';
import { coldBrew, brewOrderUrl, beanSpecies, roastStages, coffeeProcess, coffeeMoments, coffeeFacts, coffeeReading, type BrewFlavour } from '@/content/cold-brew';
import { createBrewScene } from './brewScene';
import { BackpackerStep } from './BackpackerStep';
import { CoffeeMomentScene } from './CoffeeMomentScene';
import { CoffeeProfiles } from './CoffeeProfiles';
import { profile } from '@/content/portfolio';
import { AwakeLogo } from './AwakeLogo';
import { sitePath } from '@/lib/sitePath';

export function ColdBrewStudio() {
  const [selected,setSelected]=useState<BrewFlavour>('classic');
  const [species,setSpecies]=useState(0);
  const [roast,setRoast]=useState(2);
  const [moment,setMoment]=useState(0);
  const [fact,setFact]=useState<string>('alertness');
  const [spin,setSpin]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  const [rendererName,setRendererName]=useState('Preparing the bottle…');
  const host=useRef<HTMLDivElement>(null);
  const runtime=useRef<ReturnType<typeof createBrewScene>|null>(null);
  const flavour=coldBrew.flavours.find(item=>item.key===selected)||coldBrew.flavours[0];

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    const requested=params.get('flavour');
    const requestedMoment=coffeeMoments.findIndex(item=>item.key===params.get('moment'));
    if(requestedMoment>=0){setMoment(requestedMoment);setSelected(coffeeMoments[requestedMoment].flavour);}
    const requestedFact=coffeeFacts.find(item=>item.key===params.get('fact'));
    if(requestedFact)setFact(requestedFact.key);
    const requestedRoast=roastStages.findIndex(item=>item.key===params.get('roast'));
    const requestedSpecies=beanSpecies.findIndex(item=>item.key===params.get('species'));
    if(requestedRoast>=0)setRoast(requestedRoast);
    if(requestedSpecies>=0)setSpecies(requestedSpecies);
    if(coldBrew.flavours.some(item=>item.key===requested))setSelected(requested as BrewFlavour);
    if(!host.current)return;
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(media.matches);
    const onMotion=(event:MediaQueryListEvent)=>setReducedMotion(event.matches);
    media.addEventListener('change',onMotion);
    try{runtime.current=createBrewScene(host.current,{onRenderer:setRendererName});}
    catch{setRendererName('Bottle preview unavailable. The flavour controls and ordering still work.');}
    return()=>{media.removeEventListener('change',onMotion);runtime.current?.dispose();runtime.current=null;};
  },[]);
  useEffect(()=>{runtime.current?.select(flavour);},[flavour]);
  useEffect(()=>{runtime.current?.setSpin(spin);},[spin]);
  useEffect(()=>{runtime.current?.setRoast(roastStages[roast].color);},[roast]);
  const flavourStyle=(item: typeof coldBrew.flavours[number])=>({'--flavour-color':item.color,'--flavour-ink':item.key==='cinnamon'?'#f2eee4':item.key==='anise'?coldBrew.palette.deep:'#243019'} as React.CSSProperties);
  const selectedIndex=coldBrew.flavours.findIndex(item=>item.key===selected);
  const neighbour=(step:number)=>coldBrew.flavours[(selectedIndex+step+coldBrew.flavours.length)%coldBrew.flavours.length];
  const stepFlavour=(step:number)=>setSelected(neighbour(step).key);
  const readingLink=(key:keyof typeof coffeeReading)=><nav className="brew-sources" aria-label="Source for this coffee note"><a className="brew-reference" href={coffeeReading[key].href} target="_blank" rel="noopener noreferrer">{coffeeReading[key].label} ↗</a></nav>;

  return (
    <main className="brew-studio">
      <header className="brew-header">
        <a className="brew-home" href={sitePath('/')}>← Systems Desk</a>
        <nav aria-label="Coffee guide"><a href="#bean-explorer">Beans & roasting</a><a href="#coffee-moments">Find your moment</a><a href="#behind-brew">Meet Abhinav</a></nav>
      </header>
      <div className="brew-layout">
        <section className="brew-stage" aria-labelledby="bottle-heading">
          <div className="brew-stage-title"><div><h2 id="bottle-heading">{coldBrew.sceneLabel}</h2><p className="brew-volume">{coldBrew.volume}</p></div><div className="brew-price" aria-label={`₹${coldBrew.price} for each flavour`}><strong>₹{coldBrew.price}</strong><span>Each flavour</span></div></div><p className={`brew-renderer-status${rendererName.includes('unavailable')?' is-error':''}`} role="status">{rendererName}</p>
          <div className="brew-scene" ref={host}/>
          <div className="brew-purchase-bar">
            <div className="brew-quick-flavours" aria-label="Choose a cold brew flavour">{coldBrew.flavours.map(item=><button key={item.key} style={flavourStyle(item)} onClick={()=>setSelected(item.key)} aria-pressed={selected===item.key}>{item.name}</button>)}</div>
            <a className="brew-order" href={brewOrderUrl(selected)} target="_blank" rel="noopener noreferrer" aria-label={`Order ${flavour.name} on WhatsApp for ₹${coldBrew.price}`}>{coldBrew.orderLabel}<span aria-hidden="true">↗</span></a>
          </div>
          <footer className="brew-scene-footer" role="group" aria-label="Bottle view controls"><p>Drag to turn. Scroll to zoom.</p><div><button onClick={()=>runtime.current?.reset()}>Reset view</button><button onClick={()=>setSpin(!spin)} aria-pressed={spin&&!reducedMotion} disabled={reducedMotion}>{reducedMotion?'Reduced motion':`Slow turn ${spin?'on':'off'}`}</button></div></footer>
        </section>

        <div className="brew-reading">
          <section className="brew-intro" aria-labelledby="brew-title">
            <div className="brew-brand-intro"><h1 id="brew-title">{coldBrew.name}<br/>Cold Brew.</h1><AwakeLogo/></div>
            <p className="brew-location">Cold brew, made at home in {coldBrew.location}.</p>
            <p className="brew-performance">{coldBrew.taglines.performance}</p>
            <p>{coldBrew.intro}</p>
          </section>
          <section className="brew-selection" aria-labelledby="flavour-title">
            <h2 id="flavour-title">Choose your brew</h2>
            <div className="brew-flavour-copy"><div className="brew-product-heading"><h3 aria-live="polite">{flavour.name}</h3><nav className="brew-catalog-nav" aria-label="Browse coffee flavours">
              <button className="brew-previous" onClick={()=>stepFlavour(-1)} aria-label={`Previous flavour: ${neighbour(-1).name}`} title={`Previous: ${neighbour(-1).name}`}><BackpackerStep direction="previous"/><span>Previous</span></button>
              <button className="brew-next" onClick={()=>stepFlavour(1)} aria-label={`Next flavour: ${neighbour(1).name}`} title={`Next: ${neighbour(1).name}`}><BackpackerStep direction="next"/><span>Next</span></button>
            </nav></div><div aria-live="polite"><p>{flavour.description}</p></div></div>
            <p className="brew-availability">{coldBrew.availability}</p>
          </section>
          <section className="brew-beans" id="bean-explorer" aria-labelledby="bean-title">
            <h2 id="bean-title">Get to know the bean.</h2>
            <p>A little origin, a little heat. Plenty to taste.</p>
            <CoffeeProfiles/>
            <div className="brew-species" id="coffee-species" aria-label="Explore coffee species">{beanSpecies.map((item,index)=><button key={item.key} aria-pressed={species===index} onClick={()=>setSpecies(index)}>{item.name}</button>)}</div>
            <div className="brew-species-copy" aria-live="polite"><h3>{beanSpecies[species].botanical}</h3><p>{beanSpecies[species].body}</p><p>{beanSpecies[species].detail}</p></div>
            {readingLink('species')}
            <div className="brew-roast-display" id="coffee-roasts" style={{'--roast-color':roastStages[roast].color} as React.CSSProperties} aria-hidden="true"><svg viewBox="0 0 320 190" preserveAspectRatio="xMidYMid meet"><g transform="translate(160 95) rotate(-26)">
              <path d="M-91 3C-97-34-65-62-20-63 30-69 83-43 92-10 102 24 67 58 22 63-31 72-84 43-91 3Z" fill="currentColor"/>
              <path d="M-75 9C-65-24-34-44 4-47 31-49 57-36 68-22 32-38-3-33-27-19-48-7-61 8-75 9Z" fill="#fff" opacity=".09"/>
              <path d="M-76 34C-44 13-18 14 8-4 32-22 41-39 70-44 45-29 42-12 18 5-12 25-41 22-76 34Z" fill="#171810" opacity=".66"/>
            </g></svg><span>{roastStages[roast].name}</span></div>
            <div className="brew-roasts" aria-label="Explore roast levels">{roastStages.map((item,index)=><button key={item.key} aria-pressed={roast===index} onClick={()=>setRoast(index)}>{item.name}</button>)}</div>
            <div aria-live="polite" className="brew-roast-copy"><h3>{roastStages[roast].headline}</h3><p>{roastStages[roast].body}</p></div>
            <p className="brew-note">Change the roast to recolour the loose beans in the scene. This is a learning guide; ask me about the beans in today’s batch.</p>
            {readingLink('roasting')}
          </section>
          <section className="brew-process" aria-labelledby="process-title"><h2 id="process-title">From cherry to glass.</h2><ol>{coffeeProcess.map(item=><li key={item.name}><h3>{item.name}</h3><p>{item.body}</p></li>)}</ol>{readingLink('process')}<p className="brew-note">Cold brew extracts in cool water. Iced coffee can be brewed hot and then chilled. They may arrive at the same temperature by different routes.</p>{readingLink('cold')}</section>
          <section className="brew-moments" id="coffee-moments" aria-labelledby="moments-title"><h2 id="moments-title">Make a little time.</h2><div className="brew-moment-options" aria-label="Choose a coffee occasion">{coffeeMoments.map((item,index)=><button key={item.key} aria-pressed={moment===index} onClick={()=>{setMoment(index);setSelected(item.flavour);}}>{item.title}</button>)}</div><div className="brew-moodboard" data-moment={coffeeMoments[moment].key}><div className="brew-mood-art"><CoffeeMomentScene moment={coffeeMoments[moment].key}/></div><div aria-live="polite"><h3>{coffeeMoments[moment].heading}</h3><p>{coffeeMoments[moment].body}</p><ul>{coffeeMoments[moment].objects.map(object=><li key={object}>{object}</li>)}</ul></div></div><nav aria-label="Choose the coffee for this occasion"><a href="#flavour-title" className="brew-reference">Choose {coldBrew.flavours.find(item=>item.key===coffeeMoments[moment].flavour)?.name} ↑</a></nav></section>
          <section className="brew-facts" aria-labelledby="facts-title"><h2 id="facts-title">A little coffee sense.</h2>{coffeeFacts.map(item=><details key={item.key} open={fact===item.key}><summary>{item.title}</summary><p>{item.body}</p>{readingLink(item.source)}</details>)}</section>
          <section className="brew-about" id="behind-brew" aria-labelledby="about-brew-title"><h2 id="about-brew-title">{coldBrew.aboutTitle}</h2><p>{coldBrew.about}</p><a href={profile.instagram} target="_blank" rel="noopener noreferrer">Backpacking Abi on Instagram</a><a href={profile.youtube} target="_blank" rel="noopener noreferrer">Backpacking Abi on YouTube</a><a href={sitePath('/travel/')}>See all 29 countries on the globe ↗</a><br/><a href={sitePath('/#workbench')}>Back to the rest of my work ↗</a></section>
        </div>
      </div>
    </main>
  );
}
