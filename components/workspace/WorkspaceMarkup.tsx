import { profile, stationCopy } from '@/content/portfolio';

export function WorkspaceMarkup() {
  return (
    <>
      <a className="skip" href="#project-dock">Skip to projects</a>
      <header className="topbar">
        <button className="brand" id="brand" aria-label="Return to overview">
          <span className="brandmark">am<span>•</span></span>
          <span><span id="brand-name">{profile.firstName} {profile.lastName}</span><small>THE SYSTEMS DESK</small></span>
        </button>
        <nav className="mainnav" aria-label="Main navigation">
          <button id="work-nav" className="active">Workbench</button>
          <button id="journey-nav">Journey</button>
          <button data-open="fieldnotes">Field notes</button>
        </nav>
        <div className="header-right">
          <span className="prototype">EXPLORATION 01</span>
          <button className="tune-btn" id="customize" aria-expanded="false" aria-controls="custom-panel">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 17h16M9 4v6m6 4v6"/></svg>
            Customize
          </button>
        </div>
      </header>

      <main>
        <section className="intro" id="intro" aria-labelledby="name">
          <div className="eyebrow"><span/>ENGINEER. BUILDER. BACKPACKER.</div>
          <h1 id="name">{profile.firstName}<br/><em>{profile.lastName}.</em></h1>
          <p className="role">{profile.role} <span>at {profile.company}</span></p>
          <p className="intro-copy">{profile.intro}<br/>{profile.introNote}</p>
          <div className="facts">
            <div><strong>{profile.yearsAtCisco}</strong><span>years at Cisco</span></div>
            <div><strong>{profile.appCount}</strong><span>enterprise apps</span></div>
          </div>
          <button id="tour" className="primary">Take a guided tour <span>↗</span></button>
          <button id="free-explore" className="text-button">Or explore at your own pace <span>→</span></button>
          <div className="intro-foot">
            <span>BASED IN {profile.city}, {profile.country}</span>
            <span>BUILDING SINCE {profile.since}</span>
          </div>
        </section>

        <section id="scene" aria-label="Interactive 3D engineering workspace">
          <div id="loading"><span className="loader"/><span>Assembling the workspace…</span></div>
          <div className="scene-overline">
            <span className="signal-dot"/><span id="scene-name">WORKSPACE / OVERVIEW</span>
            <span className="scene-rule"/><span className="live-label">LIVE 3D</span>
          </div>
          <div id="labels" aria-label="Project locations">
            {Object.entries(stationCopy).map(([key, copy], index) => (
              <button className={`hotspot${key === 'fieldnotes' ? ' compact' : ''}`} data-station={key} key={key}>
                <span className="hotspot-dot"/>
                <span>{copy.eyebrow && <small>{copy.eyebrow}</small>}{copy.label}</span>
                <b>↗</b>
              </button>
            ))}
          </div>
          <div className="scene-controls">
            <button id="reset-view" title="Reset camera" aria-label="Reset camera">⌂</button>
            <button id="zoom-in" title="Zoom in" aria-label="Zoom in">+</button>
            <button id="zoom-out" title="Zoom out" aria-label="Zoom out">−</button>
          </div>
          <div className="scene-help"><span>↔ DRAG TO ORBIT</span><span>SCROLL TO ZOOM</span><span>CLICK TO EXPLORE</span></div>
          <div id="fallback" hidden>
            <h2>Explore the workbench</h2>
            <p>3D rendering is unavailable in this browser. You can still open every project using the controls below.</p>
          </div>
        </section>

        <div className="animation-strip" aria-label="Animation controls">
          <span>MOTION LAB</span>
          <button id="flow-toggle" className="chip active" aria-pressed="true">Data flow</button>
          <button id="explode-toggle" className="chip" aria-pressed="false">Exploded view</button>
          <button id="orbit-toggle" className="chip" aria-pressed="false">Auto orbit</button>
          <button id="replay" className="chip">↻ Arrival</button>
          <button id="pause-motion" className="chip" aria-pressed="false" aria-label="Pause animations">Ⅱ</button>
        </div>

        <nav className="project-dock" id="project-dock" aria-label="Explore project stations">
          {Object.entries(stationCopy).map(([key, copy], index) => (
            <button data-open={key} key={key}>
              <small>{String(index + 1).padStart(2, '0')}</small><span>{copy.nav}</span><b>↗</b>
            </button>
          ))}
        </nav>
        <footer className="bottom-bar">
          <form id="command-form">
            <span className="prompt">abhi<span>://</span>workspace</span><span className="caret">›</span>
            <input id="command" aria-label="Workspace command" placeholder="Try ‘tour’, ‘incident’ or ‘help’" autoComplete="off" spellCheck={false}/>
            <button aria-label="Run command">↵</button>
          </form>
          <div className="footer-links"><button data-open="contact">Let’s connect ↗</button><span>DESIGNED TO BE EXPLORED</span></div>
        </footer>
      </main>

      <aside className="panel" id="custom-panel" hidden aria-labelledby="custom-heading">
        <div className="panel-top">
          <div><small>MAKE IT YOURS</small><h2 id="custom-heading">Tune the workspace.</h2></div>
          <button className="close" data-close="custom-panel" aria-label="Close customization">×</button>
        </div>
        <p className="panel-intro">A live sketch. Change the atmosphere, play with depth, and find your angle.</p>
        <div className="control-section"><label>ATMOSPHERE</label><div className="segmented" id="themes">
          <button data-theme="studio" className="active">Studio</button><button data-theme="dusk">Dusk</button><button data-theme="daylight">Daylight</button>
        </div></div>
        <div className="control-section">
          <label htmlFor="accent">ACCENT COLOR <span id="accent-value">#B6C7A3</span></label>
          <div className="color-row">
            <button className="swatch sage" data-color="#b6c7a3" aria-label="Sage accent"/>
            <button className="swatch copper" data-color="#d4a07b" aria-label="Copper accent"/>
            <button className="swatch ice" data-color="#8fc4d0" aria-label="Ice accent"/>
            <input type="color" id="accent" defaultValue="#b6c7a3" aria-label="Custom accent color"/><span>Pick your own</span>
          </div>
        </div>
        <div className="control-section"><label htmlFor="light">STUDIO LIGHT <output id="light-value">100%</output></label><input type="range" id="light" min="50" max="160" defaultValue="100"/></div>
        <div className="control-section"><label htmlFor="speed">ANIMATION SPEED <output id="speed-value">1.0×</output></label><input type="range" id="speed" min="20" max="200" defaultValue="100"/></div>
        <div className="control-section"><label htmlFor="separation">LAYER SEPARATION <output id="separation-value">0%</output></label><input type="range" id="separation" min="0" max="100" defaultValue="0"/></div>
        <div className="control-section"><label>CAMERA ANGLE</label><div className="segmented" id="angles">
          <button data-angle="isometric" className="active">Isometric</button><button data-angle="overhead">Overhead</button><button data-angle="low">Low angle</button>
        </div></div>
        <label className="switch-row" htmlFor="gentle">
          <span>Reduced motion<small>Keep interactions, soften movement</small></span><input type="checkbox" id="gentle"/>
        </label>
        <div className="panel-actions">
          <button className="primary" id="save-look">Save this look <span>✓</span></button>
          <button className="secondary" id="export-look">Export settings ↗</button>
          <button className="text-button" id="reset-look">Restore defaults</button>
        </div>
        <p className="control-note">Your look is saved in this browser. Export settings to keep a copy.</p>
      </aside>

      <aside className="panel detail-panel" id="detail-panel" hidden aria-labelledby="detail-title"><div id="detail-content"/></aside>
      <div className="tour-card" id="tour-card" hidden>
        <div><small id="tour-count">01 / 04</small><button id="end-tour" aria-label="End tour">×</button></div>
        <h2 id="tour-title"/><p id="tour-copy"/>
        <footer><button id="tour-back" aria-label="Previous tour stop">←</button><div id="tour-dots"/><button id="tour-next">Next stop →</button></footer>
      </div>
      <div id="toast" role="status" aria-live="polite"/>
    </>
  );
}
