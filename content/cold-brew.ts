export type BrewFlavour = 'classic' | 'cinnamon' | 'anise';

// A•WAKE product information and ordering destination.
export const coldBrew = {
  name: 'A•WAKE',
  packagingName: 'A•WAKE',
  logo: {src: '/cold-brew/awake-mood-board.png', x: 68, y: 92, width: 265, height: 255},
  palette: {paper: '#f2eee4', ink: '#292f2d', olive: '#39471f', sand: '#efd594', periwinkle: '#7d89d9', deep: '#271b72', stage: '#d2c3a5'},
  taglines: {story: 'Wide A•Wake on the Trail', ingredients: 'Real Spices. Zero Syrups. Stay A•Wake.', performance: 'Steeped 48 Hours. Hits Fast.'},
  location: 'Jaipur',
  price: 199,
  currency: 'INR',
  whatsapp: '919560171989',
  intro: 'Small batches from my kitchen in Jaipur.',
  availability: 'Small batches. Limited orders each day. Message me to check today’s batch.',
  aboutTitle: 'Behind the brew',
  about: 'I’m Abhinav Mittra. I love backpacking, looking for good coffee, and brewing at home in Jaipur. Over the last four years, I’ve visited 29 countries. When I’m back home, there’s usually another batch brewing. That’s my home-ground advantage.',
  orderLabel: 'Order on WhatsApp',
  sceneLabel: 'The A•WAKE flask',
  volume: '200 ml',
  flavours: [
    { key: 'classic' as const, name: 'Classic', label: 'Classic cold brew', taste: 'Rounded · Clean finish', description: 'Just coffee, water and a long, cold steep. Pour over ice and take your time.', note: 'Classic. Smooth and easy.', color: '#efd594', orderName: 'Classic Cold Brew' },
    { key: 'cinnamon' as const, name: 'Fresh Cinnamon', label: 'Fresh cinnamon cold brew', taste: 'Mellow · Warming finish', description: 'Fresh cinnamon infuses slowly with the coffee. A little spice for your afternoon glass.', note: 'Fresh cinnamon. Warm and smooth.', color: '#39471f', orderName: 'Fresh Cinnamon Cold Brew' },
    { key: 'anise' as const, name: 'Star Anise', label: 'Star anise cold brew', taste: 'Fragrant · Lingering finish', description: 'Whole star anise brings a fragrant, gently liquorice-like finish. Take a sip, then another.', note: 'Star anise. Aromatic and different.', color: '#7d89d9', orderName: 'Star Anise Cold Brew' }
  ]
};

export function brewOrderUrl(key: BrewFlavour) {
  const flavour=coldBrew.flavours.find(item=>item.key===key)||coldBrew.flavours[0];
  return `https://wa.me/${coldBrew.whatsapp}?text=${encodeURIComponent(`Hi Abhi, I’d like to order the A•WAKE ${flavour.orderName} for ₹${coldBrew.price}.`)}`;
}

// General coffee education; these are not sourcing or nutrition claims about our bottles.
export const beanSpecies = [
  {key:'arabica',name:'Arabica',botanical:'Coffea arabica',body:'A species, not a roast level. Bourbon, Typica, and many other varieties belong here. Growing conditions, processing, and roasting all help shape the cup.',detail:'Try comparing two origins at the same roast before deciding what “Arabica” tastes like.'},
  {key:'robusta',name:'Robusta',botanical:'Coffea canephora',body:'The other widely cultivated coffee species. Robusta is the familiar trade name; canephora is the botanical one. Variety and growing conditions matter here too.',detail:'Species is a starting point, not a quality score. A good tasting starts with the coffee in the cup.'}
] as const;
export const roastStages = [
  {key:'green',name:'Green',color:'#586246',headline:'Before the familiar aroma',body:'The seed has been processed and dried, but not roasted. What we call a coffee bean began inside a coffee cherry.'},
  {key:'light',name:'Light',color:'#84542f',headline:'A lighter touch',body:'Heat changes the seed’s chemistry and develops aroma. Lighter roasts tend to retain more acidity and less roasted flavour.'},
  {key:'medium',name:'Medium',color:'#56331f',headline:'Find the middle',body:'Further roast development changes the balance of acidity, sweetness, and roasted flavours. Colour is a clue, not a complete tasting note.'},
  {key:'dark',name:'Dark',color:'#492d1e',headline:'More roast in the cup',body:'Darker roasting brings stronger roasted and bitter flavours. A darker colour alone does not tell you the caffeine in a serving.'}
] as const;
export const coffeeProcess = [
  {name:'A fruit first',body:'Coffee grows as a cherry. The “bean” is the seed inside it.'},
  {name:'Process & dry',body:'Fruit is removed before drying in washed processing; natural processing dries the cherry with its fruit around the seed. These choices change the journey to green coffee.'},
  {name:'Roast & cool',body:'Roasting develops the aromas we recognize. Cooling stops the roast from continuing on its own heat.'},
  {name:'Grind & extract',body:'Water draws soluble compounds out of the grounds. Grind, temperature, time, and the coffee-to-water ratio all affect what lands in the cup.'}
];
export const coffeeMoments = [
  {key:'morning',title:'A slow morning',flavour:'classic' as BrewFlavour,heading:'Before the day begins.',body:'Classic over ice, a piece of toast, and something to read before the day starts asking for things.',colors:['#d7c5a0','#76503b','#e7e3d6'],objects:['Window light','A full glass','An open book']},
  {key:'afternoon',title:'An afternoon pause',flavour:'cinnamon' as BrewFlavour,heading:'Put the laptop aside.',body:'Fresh Cinnamon, a little ice, and ten minutes away from the screen. Warm spice, served cold.',colors:['#ac885e','#e2d4b9','#4d583f'],objects:['Cinnamon bark','A shaded table','A quiet corner']},
  {key:'company',title:'A table for two',flavour:'anise' as BrewFlavour,heading:'Something to talk over.',body:'Pour Star Anise into two small glasses and compare it with Classic. Start with the aroma; see what each of you notices.',colors:['#4b352a','#b9ac81','#c8b19a'],objects:['Star-shaped spice','Two small glasses','A longer conversation']}
] as const;
export const coffeeReading = {
  species:{label:'World Coffee Research · species & varieties',href:'https://varieties.worldcoffeeresearch.org/about-the-catalog/whats-included'},
  roasting:{label:'Harvard Nutrition Source · coffee',href:'https://nutritionsource.hsph.harvard.edu/food-features/coffee/'},
  process:{label:'SCA · processing & fermentation',href:'https://sca.coffee/sca-news/25-magazine/issue-10/english/the-fermentation-effect-25-magazine-issue-10-bw558'},
  cold:{label:'SCA · cold brew sensory research',href:'https://sca.coffee/sca-news/cold-vs-iced-using-sensory-analysis-to-test-the-claim-that-cold-brew-is-sweeter-and-less-acidic-73yf5'},
  caffeine:{label:'FDA · caffeine and individual sensitivity',href:'https://www.fda.gov/consumers/consumer-updates/spilling-beans-how-much-caffeine-too-much'}
};


// Processing and grading profiles, independent of roast and the current kitchen batch.
export const indianCoffeeProfiles = [
  {
    key: 'cherry', name: 'Arabica Cherry', color: '#efd594', ink: '#39471f',
    kind: 'Natural / dry processed', headline: 'The fruit takes its time.',
    body: '“Cherry” is India’s name for naturally processed coffee. The fruit dries around the seed before hulling; it doesn’t mean cherry flavouring.',
    process: ['Whole cherry', 'Dry', 'Hull'],
    notes: 'Sweetness · mild fruit', noteDetail: 'Example notes for Cherry B from India Coffee Co.; other grades and lots differ.',
    altitude: 'Estate dependent', altitudeDetail: 'Chikmagalur, one growing region: 700–1,200 m above sea level. That range is regional, not a grade requirement.',
    detail: 'Look for the estate and harvest on the bag. “Cherry” tells you the process, not the whole story.',
    sources: [
      {label: 'Josuma · Indian grades', href: 'https://josuma.com/plantation-a/'},
      {label: 'India Coffee Co. · cup profiles', href: 'https://indiacoffee.co/our-coffees/indian-arabica-coffees/'},
      {label: 'Coffee Board · elevations', href: 'https://coffeeboard.gov.in/coffee-regions-india.html'},
    ],
  },
  {
    key: 'mysore', name: 'Mysore Nuggets', color: '#39471f', ink: '#f2eee4',
    kind: 'Extra Bold / washed Arabica', headline: 'Big beans. A little spice.',
    body: 'A specialty grade selected from washed Arabica. Extra Bold refers to bean size; the coffee is sorted for uniformity and clean preparation.',
    process: ['Pulp & wash', 'Dry', 'Size & sort'],
    notes: 'Full aroma · a hint of spice', noteDetail: 'Medium to good body, with lively acidity.',
    altitude: '700–1,200 m', altitudeDetail: 'Chikmagalur’s regional elevation. Nuggets also comes from Coorg, Biligiris, Bababudangiris and Shevaroys; each estate differs.',
    detail: 'The size specification: at least 90% of beans above 7.5 mm. Bigger is a grade, not a roast level.',
    sources: [
      {label: 'Coffee Board · specialty coffees', href: 'https://coffeeboard.gov.in/Specialitycoffee.aspx'},
      {label: 'Josuma · size specification', href: 'https://josuma.com/wp-content/uploads/2013/09/Mysore-Nuggets-120402.pdf'},
      {label: 'Coffee Board · elevations', href: 'https://coffeeboard.gov.in/coffee-regions-india.html'},
    ],
  },
  {
    key: 'malabar', name: 'Monsoon Malabar', color: '#c5c9e8', ink: '#271b72',
    kind: 'Monsooned Malabar / Arabica AA', headline: 'Weather is an ingredient.',
    body: 'Dry-processed beans meet humid monsoon air in west-coast curing warehouses. Over 12–16 weeks, they swell and turn straw-yellow.',
    process: ['Natural beans', 'Monsoon air', 'Grade'],
    notes: 'Mellow · earthy, aged character', noteDetail: 'Heavy body and subdued acidity.',
    altitude: 'Hill-grown, coast-cured', altitudeDetail: 'Growing altitude depends on the source estate. Malabar identifies the coastal treatment, not one farm elevation.',
    detail: 'June to September is monsooning season. The pale green-bean colour comes from processing, before any roasting.',
    sources: [{label: 'Coffee Board · monsooning & cup notes', href: 'https://coffeeboard.gov.in/Specialitycoffee.aspx'}],
  },
] as const;
