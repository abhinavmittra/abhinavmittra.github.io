export type ProjectKey = 'discovery' | 'incident' | 'integrations' | 'fieldnotes';

export interface Profile {
  firstName: string;
  lastName: string;
  role: string;
  company: string;
  city: string;
  country: string;
  since: string;
  yearsAtCisco: string;
  appCount: string;
  intro: string;
  introNote: string;
  email: string;
  github: string;
  linkedin: string;
  youtube: string;
}

export interface Project {
  title: string;
  short: string;
  status: string;
  tags: string[];
  description: string;
  contribution: string;
  steps?: string[];
  notes: string[];
  demo?: string;
}

export interface StationCopy {
  label: string;
  nav: string;
  eyebrow: string;
}

export const profile: Profile = {
  firstName: 'Abhinav',
  lastName: 'Mittra',
  role: 'Software Engineer 3',
  company: 'Cisco',
  city: 'Jaipur',
  country: 'India',
  since: '2020',
  yearsAtCisco: '6+',
  appCount: '4',
  intro: 'Enterprise applications, connected data, and agentic AI.',
  introNote: 'A workspace of the things I build.',
  email: 'me.abhinav.mittra@gmail.com',
  github: 'https://github.com/abhinavmittra',
  linkedin: 'https://www.linkedin.com/in/abhinav-mittra-706717155/',
  youtube: 'https://www.youtube.com/@backpackingabi'
};

export const stationCopy: Record<ProjectKey, StationCopy> = {
  discovery: { label: 'Finance Discovery', nav: 'Discovery workbench', eyebrow: '01 / IN PROGRESS' },
  incident: { label: 'Incident Agent', nav: 'Incident resolution', eyebrow: '02 / IN PROGRESS' },
  integrations: { label: 'Integrations', nav: 'Enterprise integrations', eyebrow: '03 / ENTERPRISE SYSTEMS' },
  fieldnotes: { label: 'Beyond the screen', nav: 'Field notes', eyebrow: '' }
};

export const projects: Record<ProjectKey, Project> = {
  discovery: {
    title: 'Finance Discovery Workbench',
    short: 'Finance discovery',
    status: 'In progress',
    tags: ['LangGraph', 'LangChain', 'Next.js', 'Human review'],
    description: 'A workbench that helps analysts and stakeholders validate business requirements and create analysis and solution documents.',
    contribution: 'I contribute to agents grounded in a finance knowledge hub and team product catalogs, with human review and stakeholder feedback. The solution documents can be handed to coding agents.',
    steps: ['Business requirement', 'Finance knowledge & product catalogs', 'Analysis document', 'Human review', 'Solution document'],
    notes: [
      'A shared knowledge foundation across finance tracks.',
      'Analysis and solution documents created in the same workflow.',
      'Human review and feedback built into the process.'
    ],
    demo: 'A fictional request asks for a report that reconciles two finance data sources.'
  },
  incident: {
    title: 'Incident Resolution Agent',
    short: 'Incident resolution',
    status: 'In progress',
    tags: ['Agentic AI', 'Incident handling', 'Agent feedback'],
    description: 'An agent to help automate and resolve the dynamic incidents arriving in our team queue.',
    contribution: 'I am developing the resolver and a feedback mechanism where a second agent reads feedback and helps refine the first agent’s incident handling.',
    steps: ['Incident enters the queue', 'Resolver investigates', 'Proposed resolution', 'Second agent reads feedback', 'Resolver receives improvement feedback'],
    notes: [
      'Designed around changing incident types.',
      'A distinct agent evaluates feedback.',
      'An iterative feedback loop supports better handling over time.'
    ],
    demo: 'A fictional incident reports an interrupted data synchronization. This animation illustrates the feedback loop, not a live system.'
  },
  integrations: {
    title: 'Enterprise Integrations',
    short: 'Connected systems',
    status: 'Enterprise engineering',
    tags: ['MuleSoft', 'REST APIs', 'Node.js', 'OpenShift', 'Snowflake', 'Chainguard'],
    description: 'Enterprise APIs and services that let teams consume, publish, and synchronize data across databases and warehouses.',
    contribution: 'I build and maintain integrations across teams and contribute as a full stack developer to four Angular applications backed by Node.js and deployed on OpenShift. I also work on container security using Chainguard images.',
    steps: ['Application publishes a change', 'Enterprise API', 'Integration service', 'Database & warehouse synchronization'],
    notes: [
      'Cross team APIs and data replication.',
      'Four Angular and Node.js applications.',
      'Secure container deployments with Chainguard images.'
    ],
    demo: 'A fictional data change travels between an application, API, integration service, and warehouse.'
  },
  fieldnotes: {
    title: 'Beyond the screen',
    short: 'Field notes',
    status: 'Always exploring',
    tags: ['Backpacking', 'Coffee', 'Building'],
    description: 'I’m Abhinav, a software engineer based in Jaipur. When I step away from the keyboard, I’m usually planning a trail or brewing coffee.',
    contribution: 'Backpacking and coffee are part of my life alongside engineering. This little corner of the desk brings those interests into the workspace.',
    notes: ['Backpacking and exploring on foot.', 'Brewing coffee and trying different beans.', 'Documenting journeys as Backpacking Abi.']
  }
};
