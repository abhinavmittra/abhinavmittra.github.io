import { projects, journey, engineeringNotebook, type ProjectKey } from './portfolio';
import { coldBrew, roastStages, beanSpecies, coffeeProcess, coffeeMoments, coffeeFacts, indianCoffeeProfiles } from './cold-brew';
import { roadmap } from './roadmap';
import { visitedCountries } from './travel';
import { createWorkspaceSearch, type SearchDocument } from '../lib/workspaceSearch';
import type { Panel } from '../components/experience/types';

export type WorkspaceCommand = 'tour' | 'brew' | 'reset' | 'flow' | 'explode' | 'orbit' | 'pause' | 'resume' | 'lamp' | 'travel' | 'clock' | 'arrival';
export type WorkspaceTarget =
  | { kind: 'panel'; panel: NonNullable<Panel>; heading?: string }
  | { kind: 'command'; command: WorkspaceCommand }
  | { kind: 'page'; href: string };
export type WorkspaceDocument = SearchDocument<WorkspaceTarget>;
const commands: { command: WorkspaceCommand; title: string; text: string; aliases: string[] }[] = [
  { command: 'tour', title: 'Tour the desk', text: 'Take a guided look at the engineering, agent systems, inference and field-note models.', aliases: ['tour', 'explore'] },
  { command: 'brew', title: 'A•WAKE coffee break', text: coldBrew.intro, aliases: ['brew', 'coffee', 'awake', 'coldbrew'] },
  { command: 'clock', title: 'Focus the live clock', text: 'Move closer to the clock and see your current browser-local time.', aliases: ['clock', 'time'] },
  { command: 'travel', title: 'Explore the travel atlas', text: 'Open the globe and all 29 visited countries.', aliases: ['travel', 'globe', 'countries'] },
  { command: 'lamp', title: 'Switch the desk light', text: 'Turn the reading lamp on or off.', aliases: ['lamp', 'light'] },
  { command: 'explode', title: 'Separate the scene layers', text: 'Toggle the exploded view of the desk models.', aliases: ['explode', 'layers'] },
  { command: 'flow', title: 'Toggle data flow', text: 'Show or hide the animated signals between stations.', aliases: ['flow'] },
  { command: 'orbit', title: 'Toggle auto orbit', text: 'Turn automatic camera rotation on or off.', aliases: ['orbit'] },
  { command: 'pause', title: 'Pause decorative motion', text: 'Stop scene animations. The clock keeps local time.', aliases: ['pause'] },
  { command: 'resume', title: 'Resume decorative motion', text: 'Resume scene animation with your current appearance settings.', aliases: ['resume'] },
  { command: 'arrival', title: 'Replay the desk arrival', text: 'Replay the entrance animation when reduced motion is off.', aliases: ['arrival', 'replay'] },
  { command: 'reset', title: 'Return to the overview', text: 'Leave the tour or coffee view and frame the whole desk.', aliases: ['reset', 'home', 'overview', 'work'] },
];
export const commandDocuments: WorkspaceDocument[] = commands.map(item => ({
  id: `command:${item.command}`, title: item.title, location: 'Desk command', text: item.text,
  aliases: item.aliases, keywords: item.aliases, target: { kind: 'command', command: item.command },
}));
const panelAliases: Partial<Record<NonNullable<Panel>, string[]>> = {
  discovery: ['cisco', 'discovery'], incident: ['agents', 'incident'], integrations: ['inference', 'integrations'],
  fieldnotes: ['field', 'fieldnotes'], story: ['story', 'journey', 'about'], notebook: ['evals', 'notebook', 'ai'],
  roadmap: ['roadmap', 'next', 'feedback'], contact: ['contact', 'email', 'resume', 'linkedin', 'github'], settings: ['settings', 'customize', 'appearance', 'theme'],
};
const documents: WorkspaceDocument[] = [...commandDocuments];
function panelDocument(panel: NonNullable<Panel>, title: string, text: string, keywords: string[] = [], heading?: string, location?: string) {
  documents.push({ id: `${panel}:${heading || 'intro'}`, group: `panel:${panel}`, title: heading && panel in projects ? heading : title,
    location: location || (panel in projects ? projects[panel as ProjectKey].title : title), text, keywords: panel in projects ? [...keywords, projects[panel as ProjectKey].title] : keywords,
    aliases: heading ? [] : panelAliases[panel], target: { kind: 'panel', panel, heading } });
}
for (const [key, project] of Object.entries(projects) as [ProjectKey, typeof projects[ProjectKey]][]) {
  panelDocument(key, project.title, `${project.status}. ${project.description}`, project.tags);
  panelDocument(key, `${project.title} · My part`, project.contribution, project.tags, 'My part');
  for (const section of project.story) panelDocument(key, `${project.title} · ${section.heading}`, section.body, project.tags, section.heading);
  panelDocument(key, `${project.title} · In the notes`, project.notes.join(' '), project.tags, 'In the notes');
  if (project.steps?.length) panelDocument(key, `${project.title} · How the example works`, [project.demo, ...project.steps, ...(project.demoMoments || [])].filter(Boolean).join(' '), project.tags, 'How the example works');
}
panelDocument('story', 'My story', `${journey.intro} ${journey.thread}`, ['about', 'career', 'backpacking']);
for (const section of journey.chapters) panelDocument('story', section.heading, section.body, [], section.heading, 'My story');
for (const role of journey.roles) panelDocument('story', role.title, `${role.period}. ${role.body}`, [], role.title, 'My story · The route so far');
panelDocument('notebook', engineeringNotebook.title, `${engineeringNotebook.status}. ${engineeringNotebook.intro}`, ['evaluation', 'evals', 'AI notebook', 'learning']);
for (const section of [...engineeringNotebook.entries, engineeringNotebook.reading]) panelDocument('notebook', section.heading, `${section.body} ${'linkLabel' in section ? section.linkLabel : ''}`, ['evaluation', 'learning'], section.heading, 'AI notebook · Planned work');
panelDocument('roadmap', 'Next up', 'Planned projects, community tools and a feedback form. Share an idea or report a bug.', ['todo', 'feedback', 'future']);
for (const item of roadmap) panelDocument('roadmap', item.title, `${item.status}. ${item.summary} ${item.build} ${item.done}`, [item.stack], item.title, 'Next up · Planned work');
panelDocument('contact', 'Say hello', 'Email Abhinav, find GitHub and LinkedIn, or read the resume.', ['contact', 'email', 'resume', 'linkedin', 'github']);
panelDocument('settings', 'Appearance & motion', 'Choose Daylight, Studio or Dusk. Adjust accent colours, lighting, camera angle, speed and reduced motion.', ['customize', 'settings', 'theme', 'palette']);
function page(id: string, title: string, text: string, href: string, keywords: string[] = []) {
  documents.push({ id, title, text, location: id.startsWith('country:') ? 'Travel atlas · Visited country' : 'A•WAKE · Coffee guide', keywords, target: { kind: 'page', href } });
}
for (const item of coldBrew.flavours) page(`flavour:${item.key}`, item.label, `${item.description} ${item.taste}. ₹${coldBrew.price} · ${coldBrew.volume}.`, `/cold-brew/?flavour=${item.key}#flavour-title`, ['coffee', 'order', 'flavour', 'price', 'cost', 'bottle', item.name]);
for (const item of roastStages) page(`roast:${item.key}`, `${item.name} roast`, `${item.headline}. ${item.body}`, `/cold-brew/?roast=${item.key}#coffee-roasts`, ['bean', 'roasting']);
for (const item of beanSpecies) page(`species:${item.key}`, item.name, `${item.botanical}. ${item.body} ${item.detail}`, `/cold-brew/?species=${item.key}#coffee-species`, ['coffee', 'species']);
for (const item of indianCoffeeProfiles) page(`origin:${item.key}`, item.name, `${item.kind}. ${item.body} ${item.notes}. ${item.noteDetail} ${item.altitude}. ${item.altitudeDetail} ${item.detail}`, `/cold-brew/?origin=${item.key}#bean-explorer`, ['coffee', 'beans', 'process', 'altitude']);
for (const item of coffeeMoments) page(`moment:${item.key}`, item.title, `${item.heading} ${item.body}`, `/cold-brew/?moment=${item.key}#coffee-moments`, ['coffee', 'occasion']);
for (const item of coffeeFacts) page(`fact:${item.key}`, item.title, item.body, `/cold-brew/?fact=${item.key}#facts-title`, ['coffee', 'caffeine', 'health']);
for (const item of coffeeProcess) page(`process:${item.name}`, item.name, item.body, '/cold-brew/#process-title', ['coffee', 'processing']);
for (const item of visitedCountries) page(`country:${item.code}`, item.name, `${item.name} is one of the 29 countries I’ve visited. ${item.region}.`, `/travel/?country=${item.code}#travel-globe`, ['travel', item.region, ...(item.code === 'USA' ? ['United States', 'America'] : [])]);
export const searchWorkspace = createWorkspaceSearch(documents);
export const terminalSuggestions = ['Rust agents', 'Cinnamon', 'Countries', 'help'];
export const terminalActions = documents.filter(item => item.aliases?.length);
