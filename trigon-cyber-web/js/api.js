import { SYSTEM_CONFIG } from './config.js';

const BACKEND_CANISTER_ID = 'REPLACE_WITH_YOUR_CANISTER_ID';
const IS_ICP =
  !window.location.hostname.includes('localhost') &&
  !window.location.hostname.includes('127.0.0.1') &&
  !window.location.protocol.includes('file');

let backendActor = null;

async function getActor() {
  if (backendActor) return backendActor;
  const { Actor, HttpAgent } = await import('https://unpkg.com/@dfinity/agent@1.4.0/lib/esm/index.js');
  const isLocal = !IS_ICP;
  const host = isLocal ? 'http://localhost:8080' : 'https://ic0.app';
  const agent = new HttpAgent({ host });
  if (isLocal) await agent.fetchRootKey().catch(() => {});
  const idlFactory = ({ IDL }) => {
    const Project = IDL.Record({ name: IDL.Text, description: IDL.Text, status: IDL.Text });
    const SystemState = IDL.Record({
      networkStatus: IDL.Text,
      infrastructure: IDL.Text,
      securityMode: IDL.Text,
      version: IDL.Text,
    });
    const CompanyInfo = IDL.Record({
      company: IDL.Text,
      domain: IDL.Text,
      founder: IDL.Text,
      coFounder: IDL.Text,
    });
    const PartnerInfo = IDL.Record({
      organization: IDL.Text,
      representative: IDL.Text,
      website: IDL.Text,
    });
    return IDL.Service({
      getCompanyInfo: IDL.Func([], [CompanyInfo], ['query']),
      getPartner: IDL.Func([], [PartnerInfo], ['query']),
      getProjects: IDL.Func([], [IDL.Vec(Project)], ['query']),
      getFeatures: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      getServices: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      getTools: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      getNews: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      getFields: IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      getSystemState: IDL.Func([], [SystemState], ['query']),
      storeMessage: IDL.Func([IDL.Text, IDL.Text, IDL.Text], [IDL.Text], []),
    });
  };
  backendActor = Actor.createActor(idlFactory, { agent, canisterId: BACKEND_CANISTER_ID });
  return backendActor;
}

const MOCK = {
  companyInfo: {
    company: 'Trigon Cyber-Tech',
    domain: SYSTEM_CONFIG.domain,
    founder: 'G Mojesh',
    coFounder: 'J Vinay',
  },
  partner: {
    organization: 'SRIPTO',
    representative: 'Sri Vardhan Yeluri',
    website: 'sripto.tech',
  },
  projects: [
    {
      name: 'CyberOS Terminal Platform',
      description: 'Decentralized operations terminal deployed on ICP.',
      status: 'Active',
    },
    {
      name: 'Trigon Threat Scanner',
      description: 'Enterprise-grade vulnerability detection engine powered by machine learning.',
      status: 'Active',
    },
    {
      name: 'AI Security Engine',
      description: 'Core machine learning threat classification system.',
      status: 'Beta',
    },
  ],
  features: [
    'AI Threat Detection',
    'Phishing Email Analyzer',
    'Malicious Link Scanner',
    'Steganography Detection',
    'Cyber Intelligence Engine',
    'Enterprise Security Dashboards',
  ],
  tools: ['Phishing scanner', 'Link analyzer', 'Steganography detector'],
  news: [
    'AI Threat Engine v1.2 Released',
    'New phishing detection module deployed',
    'Steganography research published',
  ],
  fields: [
    'Cybersecurity',
    'Artificial Intelligence',
    'Threat Intelligence',
    'Security Analytics',
    'Digital Risk Monitoring',
  ],
  systemState: {
    networkStatus: 'Online',
    infrastructure: 'Internet Computer Protocol',
    securityMode: 'Active',
    version: SYSTEM_CONFIG.version,
  },
};

async function callCanister(method, mockValue, ...args) {
  if (!IS_ICP || BACKEND_CANISTER_ID === 'REPLACE_WITH_YOUR_CANISTER_ID') {
    return typeof mockValue === 'function' ? mockValue() : mockValue;
  }
  try {
    const actor = await getActor();
    return await actor[method](...args);
  } catch (err) {
    console.warn(`[Trigon] Canister '${method}' failed, using mock:`, err);
    return typeof mockValue === 'function' ? mockValue() : mockValue;
  }
}

export async function getCompanyInfo() {
  return callCanister('getCompanyInfo', MOCK.companyInfo);
}
export async function getPartner() {
  return callCanister('getPartner', MOCK.partner);
}
export async function getProjects() {
  return callCanister('getProjects', MOCK.projects);
}
export async function getFeatures() {
  return callCanister('getFeatures', MOCK.features);
}
export async function getServices() {
  return callCanister('getServices', MOCK.features);
}
export async function getTools() {
  return callCanister('getTools', MOCK.tools);
}
export async function getNews() {
  return callCanister('getNews', MOCK.news);
}
export async function getFields() {
  return callCanister('getFields', MOCK.fields);
}
export async function getSystemState() {
  return callCanister('getSystemState', MOCK.systemState);
}
export async function storeMessage(name, email, content) {
  return callCanister('storeMessage', 'Message recorded (local mode).', name, email, content);
}
