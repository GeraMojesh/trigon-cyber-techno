/**
 * Single source of truth — all site & terminal content lives here.
 * No duplicate copy in HTML, popups, or API mocks.
 */
export const SITE = {
  company: 'Trigon Cyber-Tech',
  tagline: 'Cybersecurity & AI Intelligence Platform',
  version: 'Trigon CyberOS v2.1',
  domain: 'Cybersecurity & Artificial Intelligence',
  platform: 'Internet Computer Protocol (ICP)',
  partner: {
    name: 'Sri Vardhan Yeluri',
    organization: 'SRIPTO',
    url: 'https://www.sripto.tech/',
  },
  metrics: [
    { value: 99, suffix: '%', label: 'Threat Accuracy' },
    { value: 24, suffix: '/7', label: 'Monitoring' },
    { value: 500, suffix: 'ms', label: 'Threat Response' },
  ],
  pillars: [
    { icon: 'shield', title: 'Zero-Trust Security', text: 'Never trust, always verify across every layer.' },
    { icon: 'brain', title: 'AI-First Intelligence', text: 'ML models trained on billions of threat signals.' },
    { icon: 'chain', title: 'Decentralized Infrastructure', text: 'Powered by Internet Computer Protocol.' },
  ],
  about: [
    'Trigon Cyber-Tech is a pioneering cybersecurity and artificial intelligence company building the next generation of threat intelligence platforms.',
    'Operating at the intersection of AI and blockchain on the Internet Computer Protocol, we deliver enterprise-grade security with transparency and resilience.',
  ],
  services: [
    { title: 'AI Threat Detection', desc: 'Real-time ML models identifying threats across network traffic, endpoints, and behavioural patterns.', status: 'ACTIVE' },
    { title: 'Phishing Email Analyzer', desc: 'Deep NLP analysis of email content, headers, and sender reputation to stop phishing campaigns.', status: 'ACTIVE' },
    { title: 'Malicious Link Scanner', desc: 'Multi-layer URL analysis with reputation databases, sandboxing, and AI scoring in milliseconds.', status: 'ACTIVE' },
    { title: 'Steganography Detection', desc: 'Pixel and metadata analysis to uncover hidden payloads in images, audio, and documents.', status: 'BETA' },
    { title: 'Cyber Intelligence Engine', desc: 'Aggregated threat intelligence from global sensors, dark web monitoring, and OSINT feeds.', status: 'ACTIVE' },
    { title: 'Enterprise Dashboards', desc: 'Executive-ready dashboards with live telemetry, risk scoring, and compliance tracking.', status: 'ACTIVE' },
  ],
  projects: [
    { num: '01', title: 'CyberOS Terminal Platform', desc: 'Decentralized operations terminal on ICP with command-driven threat intelligence.', status: 'ACTIVE', progress: 85, tags: ['Motoko', 'ICP', 'WebGL'] },
    { num: '02', title: 'Trigon Threat Scanner', desc: 'Enterprise vulnerability detection powered by machine learning in real time.', status: 'ACTIVE', progress: 70, tags: ['Python', 'ML', 'REST API'] },
    { num: '03', title: 'AI Security Engine', desc: 'Core ML threat classification trained on massive malicious pattern datasets.', status: 'BETA', progress: 50, tags: ['TensorFlow', 'ONNX', 'Edge AI'] },
  ],
  team: [
    {
      id: 'founder',
      name: 'G Mojesh',
      role: 'Founder',
      bio: 'Visionary architect behind Trigon. Pioneering next-generation cybersecurity at the intersection of AI and decentralized infrastructure.',
      tags: ['Cybersecurity', 'AI Strategy', 'ICP'],
      image: null,
      initials: 'GM',
      accent: 'pink',
      terminalTitle: 'Founder of Trigon',
    },
    {
      id: 'ceo',
      name: 'J Vinay',
      role: 'Co-Founder & CEO',
      bio: 'Leading strategic vision and executive decisions. Positioning Trigon as a global cyber intelligence leader.',
      tags: ['Leadership', 'Strategy', 'Growth'],
      image: null,
      initials: 'JV',
      accent: 'orange',
      featured: true,
      terminalTitle: 'Co-Founder & CEO',
    },
    {
      id: 'coo',
      name: '',
      role: 'Chief Operating Officer',
      bio: 'Driving operational excellence, delivery velocity, and cross-functional execution across Trigon\'s product and security initiatives.',
      tags: ['Operations', 'Execution', 'Scale'],
      image: 'assets/coo.jpg',
      initials: 'CO',
      accent: 'blue',
      terminalTitle: 'Chief Operating Officer',
    },
    {
      id: 'partner',
      name: 'Sri Vardhan Yeluri',
      role: 'Strategic Partner',
      bio: 'Founder & CEO at SRIPTO. Deep-tech expertise and partnerships that accelerate Trigon\'s roadmap and market reach.',
      tags: ['Deep-Tech', 'SRIPTO', 'Partnerships'],
      image: null,
      initials: 'SV',
      accent: 'purple',
      terminalTitle: 'Strategic Partner',
      link: 'https://www.sripto.tech/',
    },
  ],
  tools: ['Phishing scanner', 'Link analyzer', 'Steganography detector'],
  news: [
    'AI Threat Engine v1.2 released',
    'New phishing detection module deployed',
    'Steganography research published',
  ],
  fields: ['Cybersecurity', 'Artificial Intelligence', 'Threat Intelligence', 'Security Analytics', 'Digital Risk Monitoring'],
};

export function getTeamMember(id) {
  return SITE.team.find((m) => m.id === id);
}

export function getDisplayName(member) {
  return member.name?.trim() || member.role;
}
