import { travel } from './travel';
import { coldBrew } from './cold-brew';

export type ProjectKey = 'discovery' | 'incident' | 'integrations' | 'fieldnotes' | 'coldbrew' | 'finance' | 'resolver' | 'enterprise' | 'runtime' | 'retrieval' | 'data' | 'security' | 'vector' | 'kernel' | 'training' | 'edge' | 'compiler' | 'realtime';
export type StationKey = 'discovery' | 'incident' | 'integrations' | 'fieldnotes';

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
  countriesVisited: string;
  intro: string;
  introNote: string;
  email: string;
  emailSubject: string;
  emailBody: string;
  github: string;
  linkedin: string;
  youtube: string;
  instagram: string;
}

export interface StorySection {
  heading: string;
  body: string;
}

export interface Project {
  title: string;
  short: string;
  status: string;
  tags: string[];
  description: string;
  contribution: string;
  story: StorySection[];
  steps?: string[];
  notes: string[];
  evaluationQuestions?: string[];
  demo?: string;
  demoMoments?: string[];
  links?: {label: string; href: string}[];
  highlights?: {value: string; label: string; href?: string}[];
  relatedProjects?: ProjectKey[];
}

export interface StationCopy {
  label: string;
  nav: string;
  eyebrow: string;
  compactLabel: string;
  invitation: string;
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
  countriesVisited: String(travel.count),
  intro: 'Enterprise systems by day. A wider desk after hours.',
  introNote: 'Agents, inference experiments, coffee, and the road.',
  email: 'me.abhinav.mittra@gmail.com',
  emailSubject: 'Hello from the Systems Desk',
  emailBody: 'Hi Abhinav,\r\n\r\nI came across your Systems Desk and wanted to get in touch about…\r\n\r\nBest,\r\n',
  github: 'https://github.com/abhinavmittra',
  linkedin: 'https://www.linkedin.com/in/abhinav-mittra-706717155/',
  youtube: 'https://www.youtube.com/@backpackerabi',
  instagram: 'https://www.instagram.com/backpackerabi/'
};

export const stationCopy: Record<StationKey, StationCopy> = {
  discovery: { label: 'Engineering at Cisco', nav: 'Cisco · the day job', eyebrow: '2020 to today', compactLabel: 'Cisco', invitation: 'Explore the engineering' },
  incident: { label: 'Agent systems lab', nav: 'Agent systems lab', eyebrow: 'Project studies', compactLabel: 'Agent lab', invitation: 'Explore agent studies' },
  integrations: { label: 'Inference lab', nav: 'Inference lab', eyebrow: 'Project studies', compactLabel: 'Inference', invitation: 'Look inside inference' },
  fieldnotes: { label: 'Beyond the screen', nav: 'Field notes', eyebrow: '', compactLabel: 'Field notes', invitation: 'Travel, maps & coffee' }
};

export const projects: Record<ProjectKey, Project> = {
  discovery: {
    title: 'Engineering at Cisco', short: 'Cisco', status: '2020 to today · Software Engineer 3',
    tags: ['Angular', 'Node.js', 'MuleSoft', 'OpenShift', 'LangGraph'],
    description: 'Six years of learning where software meets the next system. Application work, enterprise integrations, and two ongoing agent projects now share one corner of the desk.',
    contribution: 'I contribute to four Angular and Node.js applications, cross-team APIs, and data synchronization. My current AI work explores finance discovery with human review and an incident resolver with a separate feedback agent.',
    highlights: [{value:'4',label:'enterprise applications'},{value:'2',label:'ongoing agent projects'}],
    story: [
      {heading:'The handoff is the work',body:'I started with Spring MVC services and a monitoring dashboard in 2020. MuleSoft, booking and reseller APIs came next. Working across those boundaries taught me to look past a single screen: what gets handed over, what can fail, and who needs enough context to continue?'},
      {heading:'From services to agents',body:'The finance workbench carries a requirement through analysis, review, and a solution document. The incident project separates resolution from feedback. Both are ongoing. The same engineering question follows me into each: can the next step trust what the previous one left behind?'}
    ],
    notes: ['Four Angular applications with Node.js backends.', 'MuleSoft, REST APIs, Snowflake synchronization, and OpenShift.', 'Container security with Chainguard images.'],
    relatedProjects: ['finance','resolver','enterprise'],
    links: [{label:'Resume',href:'/resume.pdf'}]
  },
  incident: {
    title:'Agent systems, after hours', short:'Agent systems lab', status:'Independent project studies',
    tags:['Rust / Tokio','GraphRAG','Qdrant','Ray Data','Tree-sitter'],
    description:'The questions I take past the day job: how does an agent recover, what should retrieval return, and when is a security finding worth someone’s attention?',
    contribution:'My engineering notes explore five systems: a durable agent runtime, graph-and-vector retrieval, a synthetic-data pipeline, a vector storage engine, and a security verification agent. Each starts with a constraint and a technology choice to examine.',
    highlights:[{value:'5',label:'system design studies'},{value:'3',label:'nodes in the vector-store design'}],
    story:[
      {heading:'An agent should survive a bad afternoon',body:'The runtime study gives each agent a Tokio task and bounded channels, with Redis and PostgreSQL recording step state. The interesting decision is where to persist a tool call. A crash between an external effect and its acknowledgement is a different problem from a slow model response.'},
      {heading:'Retrieval has a shape',body:'The GraphRAG study combines Neo4j relationships with ColBERTv2 multi-vector retrieval in Qdrant. The vector-store study moves HNSW index building off the read path and uses RocksDB with Raft replication. Both ask what must stay consistent while the index changes.'},
      {heading:'Make the next review smaller',body:'The data pipeline pairs Ray Data with Polars, DuckDB, and MinHash to remove repeated generations before quality scoring. The security study narrows a pull request with Tree-sitter and Semgrep, then checks findings in Docker. I’m interested in the evidence a reviewer gets, not another queue of confident guesses.'}
    ],
    notes:['Durable execution, retrieval, data quality, vector indexing, and code verification.', 'Design studies with evaluation plans; performance results are not published here.'],
    relatedProjects:['runtime','retrieval','data','vector','security']
  },
  integrations: {
    title:'Below the inference API', short:'Inference lab', status:'Independent project studies',
    tags:['Triton','PyTorch','CUDA','Ray Train','ONNX Runtime','MLIR','WebRTC'],
    description:'There is a point where another API wrapper stops teaching you much. These notes follow the work into GPU memory, quantization, compiler passes, and real-time media.',
    contribution:'Five studies connect model behavior to the hardware underneath: fused attention, GRPO post-training, edge quantization, operator fusion, and a WebRTC media path. The trade-offs are memory, answer quality, and the time someone waits.',
    highlights:[{value:'4-bit',label:'quantization explored'},{value:'8',label:'completions per training prompt'}],
    story:[
      {heading:'Keep the data close',body:'The Triton study investigates fusing KV-cache quantization with attention so intermediate tensors make fewer trips to GPU memory. The MLIR study approaches the same waste from another direction: fuse adjacent operations before they become separate kernel launches.'},
      {heading:'A smaller model still has a budget',body:'The edge study examines activation-aware weight quantization with ONNX Runtime and Apple Silicon. The GRPO design instead looks at the training side: sample eight candidate completions per prompt, compare rewards within the group, and avoid a separate critic model.'},
      {heading:'Latency is a whole route',body:'The real-time study follows audio and video through WebRTC, FFmpeg, Opus, and GPU buffers. Model execution is only one stretch of that route. Buffering, frame selection, and synchronization have to be counted too.'}
    ],
    notes:['GPU memory, post-training, quantization, compiler passes, and real-time media.', 'Configurations describe the designs. Performance results are not published here.'],
    relatedProjects:['kernel','training','edge','compiler','realtime']
  },

  runtime: {
    title:"A runtime that can resume",
    short:"A runtime that can resume",
    status:"Independent engineering study",
    tags:["Rust", "Tokio", "Tonic / gRPC", "Redis", "PostgreSQL"],
    description:"A durable actor-style runtime for long-running agent workflows.",
    contribution:"Give each agent a Tokio task and bounded MPSC channels. Persist step inputs and outputs with a write-ahead record, then rehydrate from the last completed node after a failure.",
    story:[{heading:"Where recovery gets difficult",body:"A saved state is not enough if the tool already changed something outside the runtime. The design needs idempotency keys and a distinction between retrying work and repeating an effect."}],
    notes:["Bounded channels make overload visible.", "Redis and PostgreSQL separate fast state access from durable records.", "Recovery tests should interrupt a workflow before and after a tool effect."],
    relatedProjects:["incident"]
  },
  retrieval: {
    title:"When a vector match is not enough",
    short:"When a vector match is not enough",
    status:"Independent engineering study",
    tags:["Python", "Neo4j", "Qdrant", "ColBERTv2", "FastAPI"],
    description:"A graph-and-vector retrieval study for questions that cross document boundaries.",
    contribution:"Extract entities and relationships into Neo4j, retain token-level vectors in Qdrant, and prune the retrieved subgraph before building the model context.",
    story:[{heading:"A relationship is useful context",body:"A relevant paragraph may name a service without explaining the dependency that matters. Combining graph traversal and late interaction gives the retrieval path more than one way to find that connection."}],
    notes:["Async Python drivers parallelize independent lookups.", "Community summaries can be cached.", "Compare multi-hop answer quality with vector-only retrieval."],
    relatedProjects:["incident"]
  },
  data: {
    title:"Synthetic data, with a filter",
    short:"Synthetic data, with a filter",
    status:"Independent engineering study",
    tags:["Ray Data", "Polars", "DuckDB", "MinHash LSH", "FastText"],
    description:"A generation pipeline that treats repetition as a data problem.",
    contribution:"Stream generations through Ray actors, use MinHash similarity to detect near duplicates, then apply language, perplexity, and model-assisted quality checks.",
    story:[{heading:"More text is not always more data",body:"The source design uses a Jaccard threshold of 0.7 for deduplication. That threshold deserves inspection: removing a repeated sentence and removing a useful variation are not the same decision."}],
    notes:["Keep rejected samples for inspection.", "Measure acceptance rates at each filter.", "Compare dataset usefulness on a held-out task."],
    relatedProjects:["incident"]
  },
  vector: {
    title:"Keep reads moving",
    short:"Keep reads moving",
    status:"Independent engineering study",
    tags:["Rust", "RocksDB", "HNSW", "open-raft", "gRPC"],
    description:"A three-node vector storage design with a separate indexing path.",
    contribution:"Acknowledge durable writes through a WAL, build HNSW indexes on background workers, and swap published index snapshots without holding the read path behind a rebuild.",
    story:[{heading:"Consistency costs something",body:"Raft replication addresses agreement across nodes. It does not automatically define how fresh a newly built search index is. The design has to expose that distinction."}],
    notes:["Three-node replication topology.", "Versioned index snapshots and atomic publication.", "Test a node failure during writes and index rebuilding."],
    relatedProjects:["incident"]
  },
  security: {
    title:"A finding worth interrupting for",
    short:"A finding worth interrupting for",
    status:"Independent engineering study",
    tags:["Tree-sitter", "Semgrep", "Python", "Rust", "Docker", "GitHub Actions"],
    description:"A pull-request security verifier that looks for evidence before reporting.",
    contribution:"Use the changed syntax tree to narrow the search, apply static rules, then run generated edge cases in a sandbox before asking a developer to investigate.",
    story:[{heading:"The report needs a reproduction",body:"A convincing explanation is not proof of a vulnerability. A small failing test, its inputs, and the exact changed code give a reviewer something concrete to work with."}],
    notes:["AST analysis is scoped to changed code.", "Docker contains generated test execution.", "Compare confirmed findings with false positives."],
    relatedProjects:["incident"]
  },
  kernel: {
    title:"Attention, closer to memory",
    short:"Attention, closer to memory",
    status:"Independent engineering study",
    tags:["Triton", "CUDA", "PyTorch", "Nsight Systems"],
    description:"A fused attention and KV-cache quantization study.",
    contribution:"Profile memory stalls, then investigate block-wise INT4 quantization inside an attention kernel. The source specifies groups of 64 values and long-context evaluation.",
    story:[{heading:"Fewer round trips",body:"Fusion can reduce intermediate memory traffic, but a faster kernel still needs numerical checks. Compare output error and retrieval behavior alongside bandwidth and decode throughput."}],
    notes:["INT4 group size: 64 in the source design.", "Inspect SRAM tiling and HBM transfers.", "Evaluate quality across context lengths."],
    relatedProjects:["integrations"]
  },
  training: {
    title:"Learning from a group",
    short:"Learning from a group",
    status:"Independent engineering study",
    tags:["PyTorch", "Ray Train", "vLLM", "DeepSpeed", "SymPy"],
    description:"A critic-free GRPO post-training pipeline for verifiable reasoning tasks.",
    contribution:"Generate eight completions per prompt with vLLM, score mathematical equivalence and executable answers, and distribute policy updates with DeepSpeed ZeRO-3.",
    story:[{heading:"The reward is part of the system",body:"A model can become very good at the wrong test. Formatting rewards, sandboxed execution, and SymPy checks need separate inspection before a combined score becomes a training signal."}],
    notes:["Eight completions per prompt in the design.", "Docker bounds generated code execution.", "Track held-out task quality as well as reward."],
    relatedProjects:["integrations"]
  },
  edge: {
    title:"A model beside your other apps",
    short:"A model beside your other apps",
    status:"Independent engineering study",
    tags:["C++", "ONNX Runtime", "AWQ", "Apple Silicon", "CMake"],
    description:"An edge inference study under a shared memory budget.",
    contribution:"Use activation statistics to guide 4-bit weight quantization, then investigate memory-mapped weights and an Apple Silicon execution path.",
    story:[{heading:"Memory saved, quality checked",body:"Smaller files are useful only if the model still answers well. The study pairs weight compression with held-out quality checks and peak memory measurements while other applications remain open."}],
    notes:["Activation-aware weight quantization.", "Memory mapping for model weights.", "Compare quality, power, and sustained generation speed."],
    relatedProjects:["integrations"]
  },
  compiler: {
    title:"Before a kernel launches",
    short:"Before a kernel launches",
    status:"Independent engineering study",
    tags:["C++", "MLIR", "LLVM", "PyTorch FX", "CUDA"],
    description:"A compiler-pass study for adjacent tensor operations.",
    contribution:"Inspect a PyTorch FX graph, lower selected patterns into MLIR, and investigate fusing adjacent operations before generating GPU code.",
    story:[{heading:"An intermediate tensor has a cost",body:"Two individually fast operations can still waste time writing and reading a tensor between them. Fusion trades a more complicated kernel for fewer launches and fewer intermediate allocations."}],
    notes:["Match activation and bias patterns.", "Inspect linalg and GPU dialect lowering.", "Compare correctness before timing an optimized graph."],
    relatedProjects:["integrations"]
  },
  realtime: {
    title:"The whole conversation path",
    short:"The whole conversation path",
    status:"Independent engineering study",
    tags:["WebRTC", "FFmpeg", "C++", "Opus", "PyTorch"],
    description:"A low-latency audio and video streaming design.",
    contribution:"Receive real-time media over WebRTC, choose video frames based on motion, and feed 20 ms Opus audio frames through a synchronized processing path.",
    story:[{heading:"Count every buffer",body:"The source studies zero-copy GPU transfers and adaptive frame sampling. A useful latency measurement must start at capture and end at playback, including network jitter and queueing."}],
    notes:["20 ms audio frames in the design.", "Motion-aware video frame sampling.", "Measure capture-to-response latency under jitter."],
    relatedProjects:["integrations"]
  },
  finance: {
    title: 'Finance Discovery Workbench',
    short: 'Finance discovery',
    status: 'In progress',
    tags: ['LangGraph', 'LangChain', 'Next.js', 'Human review'],
    description: 'A business requirement is the starting point. This ongoing workbench brings finance context, analysis, and human review into the path toward a solution document.',
    contribution: 'I contribute to the agents that work with a shared finance knowledge hub and team product catalogs. The workflow creates analysis and solution documents, with stakeholder feedback and a person reviewing the analysis before the next step.',
    story: [
      {
        heading: 'The work before the code',
        body: 'A requirement can name a report without settling what should be in it. The finance workbench is about that earlier stage: giving analysts and stakeholders a place to examine the request, work with the available business context, and agree on the analysis. Code comes later.'
      },
      {
        heading: 'A handoff worth reading',
        body: 'The output is a solution document a coding agent can work from. I want that handoff to retain the decisions made along the way, including what a stakeholder reviewed. The question I keep coming back to: does the next person have enough context to continue?'
      }
    ],
    steps: ['Business requirement', 'Finance knowledge & product catalogs', 'Analysis document', 'Human review', 'Solution document'],
    notes: [
      'LangGraph and LangChain in the agent workflow, with Next.js in the workbench.',
      'A shared finance knowledge foundation and team product catalogs.',
      'Analysis and solution documents, with stakeholder feedback and human review.'
    ],
    evaluationQuestions: [
      'Can each document claim be traced to supporting finance context?',
      'Does an incomplete request reach the right human review point?',
      'After a prompt change, do the same example requests still produce usable analysis?'
    ],
    demo: 'Fictional scenario: Mira, an analyst at Harbor Supply, asks for a report to reconcile an order feed with a warehouse extract. The brief leaves the reporting window open. Walk through the request, the review, and the handoff.',
    demoMoments: [
      'Mira asks for a reconciliation report. The reporting window is still an open question.',
      'The example gathers a finance definition and a product catalog entry for the two sources.',
      'The draft analysis records the source mismatch and the missing reporting window.',
      'Mira reviews the analysis and confirms a monthly reporting window.',
      'The solution document carries the reviewed requirement forward for implementation.'
    ]
  },
  resolver: {
    title: 'Incident Resolution Agent',
    short: 'Incident resolution',
    status: 'In progress',
    tags: ['Agentic AI', 'Incident handling', 'Agent feedback'],
    description: 'An ongoing resolver for a changing incident queue, with a second agent that turns feedback into suggestions for the next pass.',
    contribution: 'I’m developing the resolver and the feedback mechanism around it. One agent works on the incident; a second reads feedback and helps refine the first agent’s handling. Proposing a resolution and deciding what to learn from the response are different jobs.',
    story: [
      {
        heading: 'One incident, then another',
        body: 'A queue is a moving target. An incident resolution workflow has to deal with the case in front of it while leaving room for feedback on how it was handled. This project explores that loop as a pair of agents, with feedback carried back to the resolver.'
      },
      {
        heading: 'Give feedback a job',
        body: 'A feedback loop raises another question: how do you know a proposed change helped? That is the reason for the evaluation ideas in the notebook. A useful next experiment would replay the same incident examples before and after a change, then examine the cases that got worse as carefully as the ones that improved.'
      }
    ],
    steps: ['Incident enters the queue', 'Resolver investigates', 'Proposed resolution', 'Second agent reads feedback', 'Resolver receives improvement feedback'],
    notes: [
      'A resolver being developed around changing incident types.',
      'A separate agent reads feedback on how the incident was handled.',
      'A feedback mechanism intended to help refine the resolver’s next pass.'
    ],
    evaluationQuestions: [
      'Does the proposed resolution address the incident described in the example?',
      'Can a reviewer connect the feedback to a specific action or missing check?',
      'Does a proposed refinement preserve behavior on earlier incident examples?'
    ],
    demo: 'Fictional scenario: Harbor Supply’s stock sync stops after a failed handoff. The resolver proposes a retry. Feedback points out that the source record is stale, so the second agent identifies a missing check for the resolver to consider next time.',
    demoMoments: [
      'A fictional ticket reports a stopped stock sync after a failed handoff.',
      'The resolver examines the example ticket and the supplied sync context.',
      'The example resolution proposes a retry of the interrupted handoff.',
      'A reviewer notes that the source record was stale. The second agent reads that feedback.',
      'The feedback suggests checking source freshness before another retry. No live service is changed.'
    ]
  },
  enterprise: {
    title: 'Enterprise Integrations',
    short: 'Connected systems',
    status: 'Enterprise engineering',
    tags: ['Angular', 'Node.js', 'MuleSoft', 'REST APIs', 'OpenShift', 'Snowflake', 'Chainguard'],
    description: 'The everyday plumbing: APIs, data synchronization, and four Angular applications backed by Node.js. This is the enterprise engineering side of my work.',
    contribution: 'I build and maintain integrations across teams and contribute as a full stack developer to four Angular applications. Their Node.js backends run on OpenShift. I also work on container security with Chainguard images.',
    story: [
      {
        heading: 'A change has somewhere to go',
        body: 'One application publishes a change. Another system needs it in a different shape. An integration service carries it across the boundary. That’s the kind of work behind this station, across team APIs, databases, and warehouses.'
      },
      {
        heading: 'Past the browser',
        body: 'My scope reaches past the browser. There is application work, the API and integration layer, and the container the service runs in. Working across those boundaries is a useful foundation for the agent projects: they, too, need to fit into a larger software workflow.'
      }
    ],
    steps: ['Application publishes a change', 'Enterprise API', 'Integration service', 'Database & warehouse synchronization'],
    notes: [
      'Four Angular applications with Node.js backends.',
      'Cross-team APIs, MuleSoft integrations, and data synchronization.',
      'OpenShift deployments and container security work with Chainguard images.'
    ],
    demo: 'Fictional scenario: Harbor Supply updates an item’s warehouse assignment. Follow that change out of the application, through an API and integration service, to the destination data store. These are example systems, not Cisco infrastructure.',
    demoMoments: [
      'A user changes an item’s warehouse assignment in the fictional application.',
      'The example API receives the published change.',
      'An integration service maps the example record for its destination.',
      'The destination receives the mapped assignment. The walkthrough ends without calling a real system.'
    ]
  },
  fieldnotes: {
    title: 'Beyond the screen',
    short: 'Field notes',
    status: 'Away from the keyboard',
    tags: ['Backpacking', 'Coffee', 'Backpacking Abi'],
    description: 'I’m Abhinav, a software engineer in Jaipur. I’ve visited 29 countries over the last four years. Backpacking, coffee, and the things I make away from work have a place on this desk too.',
    contribution: 'Travel gives me something different to pay attention to: a route, a neighbourhood, or a place to stop for coffee. I document journeys as Backpacking Abi. At home in Jaipur, that interest became A•WAKE, the cold brew I make and share.',
    links: [{label:'Explore my 29-country travel map',href:travel.href}],
    highlights: [{value:String(travel.count),label:'countries visited',href:travel.href},{value:'4',label:'years of travel'}],
    relatedProjects: ['coldbrew'],
    story: [
      {
        heading: 'A different kind of route',
        body: 'Over the last four years, I’ve visited 29 countries. The number is one part of it; the routes and the time spent walking are what I take back to the notebook. Backpacking Abi is where I document those journeys.'
      },
      {heading: 'Something to make at home', body: 'Backpacking changed what I look for in a cup. I brought that curiosity home to Jaipur: fresh beans, a V60 on the counter, and cold brew steeping for the next day. A•WAKE grew out of that routine.'}
    ],
    notes: ['29 countries visited over the last four years.', 'Travel notes and backpacking as Backpacking Abi.', 'Small batches of cold brew made at home in Jaipur.']
  },
  coldbrew: {
    title: coldBrew.name,
    short: 'A•WAKE cold brew',
    status: 'Personal project · Jaipur',
    tags: ['Backpacking', 'Fresh coffee', 'Cold brew', 'V60'],
    description: 'A•WAKE is the cold brew I make at home in Jaipur. It started with coffee stops while backpacking and became something I wanted to share: three flavours, ₹199 each, ordered over WhatsApp.',
    contribution: 'Across Southeast Asia, Africa, Eastern Europe and South America, I kept stopping for coffee. Different beans, different ways of brewing, and plenty of cups that changed my mind about what I liked. My taste has wandered a fair bit. It still finds its way back to cold brew and a V60.',
    story: [
      {heading: 'What I brought home', body: 'Fresh coffee made me pay more attention to where a cup begins: a plant, a harvest, a roast. There’s something grounding about it. Beans, water, a little patience. That connection to the earth is a big part of why I enjoy brewing as much as drinking it.'},
      {heading: 'A little of the trail, brewed at home', body: 'A•WAKE is my way of keeping that curiosity going in Jaipur. Some days I want Classic over ice. Other days I add fresh cinnamon or star anise and see where the cup goes. Real spices, no syrups. The backpack stays by the door; there’s usually a batch in the fridge.'}
    ],
    highlights: [{value:'3',label:'flavours'},{value:'₹199',label:'each flavour'}],
    notes: ['Small batches, brewed at home in Jaipur.', 'Classic, Fresh Cinnamon, and Star Anise.', 'Message me on WhatsApp to check the current batch.'],
    links: [{label:'Enter the brew studio',href:'/cold-brew/'}]
  }
};

export const journey = {
  title: 'A life with a few open tabs',
  intro: 'I joined Cisco in 2020 with Spring MVC services and a monitoring dashboard. The scope grew into MuleSoft integrations, enterprise APIs, and full stack application work. Today I’m a Software Engineer 3, contributing to four Angular and Node.js applications while developing agents for finance discovery and incident resolution.',
  thread: 'The résumé has the job titles. This desk makes room for the other threads: independent engineering studies, cold brew made at home, and four years of routes through 29 countries.',
  chapters: [
    {heading:'After the day job',body:'My independent project notes follow questions beyond enterprise application work. A Rust agent runtime and GraphRAG retrieval sit beside Triton kernels, edge quantization, and a real-time media design. Writing down the trade-offs is the useful part: what state survives a failure, what gets kept in memory, and what the benchmark should actually measure.'},
    {heading:'29 countries, four years',body:'Over the last four years, I’ve visited 29 countries. Backpacking and documenting journeys as Backpacking Abi are a steady part of life away from engineering. The notebook, mountains, and coffee on the desk belong to that story.'},
    {heading:'A project with coffee in it',body:'Coffee stops across Southeast Asia, Africa, Eastern Europe and South America changed my taste and sent me home with more curiosity about beans. Cold brew and V60 remain my favourites. A•WAKE brings that habit into my kitchen in Jaipur: small batches, fresh spices, and a cup to share.'}
  ],
  roles: [
    {
      period: 'Current · Cisco Systems', title: 'Software Engineer 3',
      body: 'Four Angular applications, Node.js backends, enterprise APIs, and data synchronization. I work across those application and integration boundaries, with OpenShift deployments and Chainguard container images also in scope. Alongside that work, I’m developing the finance discovery and incident resolution agents on this desk.'
    },
    {
      period: 'Jun 2021 to Nov 2023 · Cisco Systems', title: 'Software Engineer 2',
      body: 'I worked on MuleSoft integrations and APIs for booking and reseller management. I also built a REST API for a BERT incident classification model. That work put model integration alongside the service and API engineering I was already doing.'
    },
    {
      period: 'Aug 2020 to Jun 2021 · Cisco Systems', title: 'Software Engineer',
      body: 'Spring MVC services and a centralized monitoring dashboard for integration services. This was the beginning of my work at Cisco, with attention on the services and the visibility needed to understand them.'
    },
    {
      period: '2016 to 2020 · MAHE', title: 'Computer Science',
      body: 'Bachelor of Technology in Computer Science, with a minor specialization in Big Data. CGPA 8.78.'
    }
  ]
};

export const engineeringNotebook = {
  title: 'AI tools worth sharing',
  status: 'Learning notes · planned community projects',
  intro: 'I want to make it easier for small teams to tell whether an AI assistant is helping. My next project is a public test kit for documentation assistants: ask a question, inspect the sources, and catch a bad answer before it reaches a user. This is planned work, not a shipped product.',
  entries: [
    {
      heading: 'Start with a maintainer’s real problem',
      body: 'A docs assistant can sound certain while linking to the wrong page. The first version will use a small, openly licensed documentation set and questions with known answers. It will include questions the docs cannot answer, because asking for help is better than making up an API.',
      link: 'https://www.promptfoo.dev/docs/getting-started/', linkLabel: 'Build a first evaluation with promptfoo'
    },
    {
      heading: 'Make the result easy to inspect',
      body: 'Each test should show the question, answer, cited passage and reason it passed or failed. Check source links and expected facts with code first. Use model-based scoring as a second opinion, with disagreements left visible for human review.',
      link: 'https://docs.ragas.io/en/stable/concepts/metrics/available_metrics/faithfulness/', linkLabel: 'Read how Ragas checks faithfulness'
    },
    {
      heading: 'Turn a failure into a repeatable test',
      body: 'Keep the document version, prompt and tool results alongside each run. Compare the same examples after a change. The goal is a small report a maintainer can read in a pull request, with local fixtures that contributors can run without an API key.',
      link: 'https://docs.langchain.com/langsmith/evaluation', linkLabel: 'Learn the dataset-and-experiment workflow'
    }
  ],
  reading: {
    heading: 'Build it in the open',
    body: 'The Next up list breaks this idea into a test kit, a synthetic incident sandbox and an accessible 3D starter. I’ll publish working examples before adding more frameworks. Have a support question that repeatedly trips up an assistant? Send me a fictional or public example through the feedback form.'
  }
};

export const interfaceCopy = {
  tourStart: 'Tour the desk',
  tourActive: 'Walking through the work',
  coffeeAction: 'Order some coffee',
  sceneInstructions: 'Drag the desk to rotate it, or use the left and right arrow keys when the scene is focused. Use the plus and minus keys or zoom buttons to zoom. Press Home to reset the view. Use Tab to reach the project stations and Enter to open one. Select the A•WAKE card beside the lamp to toggle its light.',
  journeyNav: 'My story',
  notebookNav: 'AI notebook',
  commandPlaceholder: "Try 'brew', 'story' or 'clock'",
  loading: 'Putting the desk together…',
  sceneOverview: 'Workspace / overview',
  customTitle: 'Find your angle.',
  customIntro: 'Change the light, pull the layers apart, or slow things down. Your camera, your pace.',
  workflowLabel: 'Follow an example',
  workflowNote: 'Fictional scenario · scripted walkthrough',
  evaluationLabel: 'What I would test next',
  evaluationNote: 'Proposed evaluation questions. These checks have not been measured here.',
  notebookAction: 'Read the AI notebook',
  contactTitle: 'Start with a conversation.',
  contactIntro: 'A note about engineering, AI systems, or a good trail is a fine place to start.',
  contactAction: 'Say hello ↗',
  clockLabel: 'Your time',
  lampOffQuote: 'Late night? Brew yourself.',
  lampOnQuote: 'Now that’s a bright roast.',
  commandHelp: 'Commands: tour · cisco · agents · inference · discovery · incident · integrations · about · story · evals · brew · travel · clock · contact · customize · layers · orbit · flow · pause · resume · arrival · reset',
  commandUnknown: 'Try brew for the coffee studio, clock for your local time, or story for the background.'
};
