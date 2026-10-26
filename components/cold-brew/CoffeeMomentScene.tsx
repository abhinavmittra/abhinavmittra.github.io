type Moment = 'morning' | 'afternoon' | 'company';

function Glass({x,y}: {x:number;y:number}) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 0H25L22 38H4Z" fill="#d7cbb0" stroke="#6b6556" strokeWidth="2"/><path d="M3 12H22L20 35H5Z" fill="#543a29"/><path d="M6 5l8 2-2 9-8-2zm9 3 7 2-2 8-7-2z" fill="#f2eee4" opacity=".8"/></g>;
}

/** Original vector scenes: each occasion has its own posture, props and daylight. */
export function CoffeeMomentScene({moment}: {moment:Moment}) {
  const morning=moment==='morning',company=moment==='company';
  const description=morning?'A reader beside a sunlit window, with an open book, toast and iced coffee.':company?'Two friends facing each other over two glasses of cold brew.':'A person leaning back with iced coffee, one arm stretched overhead; a closed laptop and cinnamon sit on the shaded table.';
  return <svg className="coffee-moment-scene" viewBox="0 0 600 250" role="img" aria-label={description}>
    <rect width="600" height="250" fill={morning?'#e3d5b5':'#c9cbb4'}/>
    <path d="M0 209H600V250H0Z" fill="#b0a080"/>
    <path d="M28 18H176V191H28Z" fill="#f4eddb" stroke="#82775d" strokeWidth="9"/>
    <path d="M35 25H169V184H35Z" fill={morning?'#f1dfaa':'#b3c4bd'}/>
    <circle cx={morning?66:140} cy={morning?147:51} r="24" fill="#efd594"/>
    <path d="M35 160l35-30 30 24 36-42 33 39v33H35Z" fill="#929d77"/>
    <path d="M102 23V187M32 105H173" stroke="#82775d" strokeWidth="7"/>
    {morning?<path d="M177 112L352 209H200L177 176Z" fill="#f1dfaa" opacity=".55"/>:<path d="M30 29H175M30 43H175M30 57H175" stroke="#82775d" strokeWidth="5"/>}
    <path d="M238 153V214H305M242 214v31M296 214v31" fill="none" stroke="#655f4c" strokeWidth="10" strokeLinejoin="round"/>
    <path d={morning?'M261 173l32 15 21 53M263 177l-5 36 21 29':'M260 174l47 18 25 49M259 177l11 38 27 28'} fill="none" stroke="#39444b" strokeWidth="17" strokeLinecap="round"/>
    <path d="M276 242h17m31 0h17" stroke="#252c30" strokeWidth="9" strokeLinecap="round"/>
    <path d={morning?'M252 111q24-7 38 12l1 51-40 7-11-38Z':'M239 112q23-10 40 10l14 51-41 9-23-49Z'} fill={morning?'#7d89a9':'#69784f'}/>
    <path d={morning?'M261 99l2 16':'M248 99l3 16'} stroke="#bc8a62" strokeWidth="13"/>
    <g transform={morning?'translate(264 83) rotate(12)':'translate(246 81) rotate(-12)'}>
      <ellipse rx="20" ry="25" fill="#c4936e"/>
      <path d="M-20 1q-5-36 25-30 20 4 15 23L7-10-1-2-7-11-13 9Z" fill="#252a2a"/>
      <path d="M17-1l7 8-8 2" fill="#c4936e"/>
      <path d="M11-2h3m-1 17h5" stroke="#453c34" strokeWidth="2" strokeLinecap="round"/>
    </g>
    {morning?<>
      <path d="M278 123l20 32 39 1M249 129l19 30 45 7" fill="none" stroke="#c4936e" strokeWidth="11" strokeLinecap="round"/>
      <path d="M303 146l29 6 27-12-4 29-27 9-28-8Z" fill="#f2eee4" stroke="#77765e" strokeWidth="2"/>
      <path d="M332 152l-4 26m-21-22 17 4m-19 3 17 4m16-10 15-7m-16 15 14-6" stroke="#a59b7d" strokeWidth="2"/>
    </>:<>
      <path d={company?'M237 121l16 34 42-3':'M237 121l-28-22 10-43 20-4'} fill="none" stroke="#c4936e" strokeWidth="11" strokeLinecap="round"/>
      <path d="M276 124l28 20 23-20" fill="none" stroke="#c4936e" strokeWidth="11" strokeLinecap="round"/>
      <Glass x={318} y={99}/>
    </>}
    <path d="M351 177h175M370 182l-10 63m145-63 13 63" stroke="#716047" strokeWidth="10" strokeLinecap="round"/>
    <path d="M344 164h189v14H344Z" fill="#9c8260"/>
    {morning?<><Glass x={375} y={124}/><ellipse cx="459" cy="157" rx="35" ry="7" fill="#f2eee4"/><path d="M441 151v-18q-5-14 13-16h14q18 4 9 16v18Z" fill="#a8753c"/><path d="M446 146v-16q-3-8 11-9h9q11 3 5 10v15Z" fill="#dec28b"/></>:<><path visibility={company?'hidden':undefined} d="M385 151h97l12 10H378Z" fill="#737f87" stroke="#46505a" strokeWidth="2"/><path visibility={company?'hidden':undefined} d="M402 148h68" stroke="#a8b3b6" strokeWidth="3"/><path d="M490 151l25-8m-23 14 25-8" stroke="#8d5937" strokeWidth="6" strokeLinecap="round"/></>}
    {company&&<g><path d="M540 244l-12-40-32-17" stroke="#4b5250" strokeWidth="15" fill="none" strokeLinecap="round"/><path d="M543 124l-19 17-9 42 35 13 18-60Z" fill="#7d89a9"/><ellipse cx="550" cy="102" rx="19" ry="23" fill="#aa7757"/><path d="M531 101q-5-35 27-27 19 7 12 29l-13-19-24 12Z" fill="#302e2a"/><path d="M533 139l-26 12-25-9" stroke="#aa7757" strokeWidth="11" fill="none" strokeLinecap="round"/><Glass x={453} y={124}/></g>}
    <path d="M558 210v-40m0 16q-28-17-24-30 25 2 24 30m0-8q25-26 30-14-5 20-30 25" fill="#65774f" stroke="#65774f" strokeWidth="3"/>
    <path d="M542 208h33l-5 32h-23Z" fill="#82775d"/>
  </svg>;
}
