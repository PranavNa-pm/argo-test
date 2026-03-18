import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { Agent, Tool, Artifact, Chat, Space, Message, ExecutionTrace, RightPanelView, AdminTab, CenterView } from '@/types/argo';

// ─── Mock Data ───────────────────────────────────────────────

export const TOOLS: Tool[] = [
  { id: 'knowledge-retrieval', name: 'Knowledge Retrieval', description: 'Searches internal knowledge base for relevant documents, templates, and historical context.' },
  { id: 'structured-gen', name: 'Structured Artifact Generator', description: 'Generates structured markdown documents from agent reasoning and retrieved context.' },
  { id: 'web-search', name: 'Web Search', description: 'Searches the web for current information about companies, markets, and industry trends.' },
];

export const AGENTS: Agent[] = [
  {
    id: 'general',
    name: 'General Agent',
    version: '1.0',
    description: 'Default system agent used for all chats.',
    model: 'gpt-4o',
    capabilities: [
      { id: 'general-assist', name: 'General Assistance', description: 'Handles general queries and tasks.', tools: ['knowledge-retrieval'] },
      { id: 'proposal-outline', name: 'Generate Proposal Outline', description: 'Creates structured proposal outlines.', tools: ['knowledge-retrieval', 'structured-gen'] },
      { id: 'draft-sow', name: 'Draft SOW', description: 'Drafts statements of work.', tools: ['knowledge-retrieval', 'structured-gen'] },
      { id: 'executive-summary', name: 'Create Executive Summary', description: 'Generates executive summaries.', tools: ['knowledge-retrieval', 'structured-gen'] },
      { id: 'company-table', name: 'Generate Company Comparison', description: 'Creates comparison tables.', tools: ['web-search', 'structured-gen'] },
    ],
    agentType: 'system' as any,
  } as any,
  {
    id: 'hr-agent',
    name: 'HR Agent',
    version: '1.0',
    description: 'Handles HR-related queries and internal policy questions.',
    model: 'gpt-4o',
    capabilities: [
      { id: 'hr-policy', name: 'Policy Lookup', description: 'Searches HR policies and guidelines.', tools: ['knowledge-retrieval'] },
      { id: 'hr-assist', name: 'HR Assistance', description: 'Answers HR-related questions.', tools: ['knowledge-retrieval'] },
    ],
    agentType: 'system' as any,
  } as any,
  {
    id: 'social-media-agent',
    name: 'Social Media Agent',
    version: '1.0',
    description: 'Helps with content creation and social media related tasks.',
    model: 'gpt-4o',
    capabilities: [
      { id: 'content-create', name: 'Content Creation', description: 'Creates social media content and copy.', tools: ['structured-gen'] },
      { id: 'social-strategy', name: 'Social Strategy', description: 'Provides social media strategy guidance.', tools: ['web-search', 'structured-gen'] },
    ],
    agentType: 'system' as any,
  } as any,
  {
    id: 'it-support-agent',
    name: 'IT Support Agent',
    version: '1.0',
    description: 'Handles IT support queries and internal tech assistance.',
    model: 'gpt-4o',
    capabilities: [
      { id: 'it-troubleshoot', name: 'Troubleshooting', description: 'Helps diagnose and resolve IT issues.', tools: ['knowledge-retrieval'] },
      { id: 'it-setup', name: 'Setup Assistance', description: 'Guides through software and hardware setup.', tools: ['knowledge-retrieval'] },
    ],
    agentType: 'system' as any,
  } as any,
];

// ─── Response Simulation ─────────────────────────────────────

function generateTrace(agentName: string, version: string, capability: string, tools: string[]): ExecutionTrace {
  return {
    agentName, agentVersion: version, capability, toolsUsed: tools,
    documentsRetrieved: capability.includes('Proposal')
      ? ['methodology-v3.md', 'pricing-guide-2024.md', 'client-template.md']
      : capability.includes('SOW') ? ['sow-template-v2.md', 'rate-card-2024.md']
      : capability.includes('Company') ? [] : ['engagement-template.md'],
    model: 'gpt-4o',
    tokenUsage: { input: Math.floor(Math.random() * 2000) + 800, output: Math.floor(Math.random() * 3000) + 1500 },
    latencyMs: Math.floor(Math.random() * 3000) + 2000,
    costEstimate: `$${(Math.random() * 0.08 + 0.02).toFixed(4)}`,
  };
}

function extractClientName(msg: string): string {
  const match = msg.match(/(?:for|client)\s+([A-Z][a-zA-Z\s&]+?)(?:\s+in|\s+on|\s*$|,|\.|!)/i);
  return match ? match[1].trim() : 'Client X';
}

function extractCompanies(msg: string): string[] {
  const known: Record<string, boolean> = { Shopify: true, BigCommerce: true, WooCommerce: true, Stripe: true, PayPal: true, Square: true, Amazon: true, Google: true, Microsoft: true, Apple: true, Salesforce: true, HubSpot: true, Snowflake: true, Datadog: true, Atlassian: true, Netflix: true, Meta: true };
  const found = Object.keys(known).filter(c => msg.toLowerCase().includes(c.toLowerCase()));
  return found.length >= 2 ? found : ['Shopify', 'BigCommerce', 'WooCommerce'];
}

function generateSmartChatTitle(message: string): string {
  const lc = message.toLowerCase();
  if (lc.includes('proposal')) return `Proposal – ${extractClientName(message)}`;
  if (lc.includes('sow') || lc.includes('statement of work')) return 'SOW – Analytics Platform';
  if (lc.includes('executive summary') || lc.includes('summary')) return 'Executive Summary';
  if (lc.includes('comparison') || lc.includes('compare') || lc.includes('table')) {
    const companies = extractCompanies(message);
    return `Compare – ${companies.slice(0, 2).join(' vs ')}`;
  }
  const words = message.split(/\s+/).slice(0, 5).join(' ');
  return words.length > 30 ? words.slice(0, 30) + '…' : words;
}

function simulateResponse(agentId: string, message: string): { reply: string; artifact?: { name: string; content: string; capability: string; tools: string[]; trace: ExecutionTrace } } {
  const lc = message.toLowerCase();
  if (lc.includes('proposal')) {
    const client = extractClientName(message);
    return { reply: `I've generated a proposal outline for ${client}. The artifact is now available — click "View Artifact" to see it.`, artifact: { name: `Proposal Outline — ${client}`, content: generateProposal(client), capability: 'Generate Proposal Outline', tools: ['Knowledge Retrieval', 'Structured Artifact Generator'], trace: generateTrace('General Agent', '1.0', 'Generate Proposal Outline', ['Knowledge Retrieval', 'Structured Artifact Generator']) } };
  }
  if (lc.includes('sow') || lc.includes('statement of work')) {
    return { reply: "I've drafted a Statement of Work. Click \"View Artifact\" to review.", artifact: { name: 'Statement of Work — Analytics Platform', content: generateSOW(), capability: 'Draft SOW', tools: ['Knowledge Retrieval', 'Structured Artifact Generator'], trace: generateTrace('General Agent', '1.0', 'Draft SOW', ['Knowledge Retrieval', 'Structured Artifact Generator']) } };
  }
  if (lc.includes('executive summary') || lc.includes('summary')) {
    return { reply: "I've created an executive summary.", artifact: { name: 'Executive Summary — Engagement Overview', content: generateExecutiveSummary(), capability: 'Create Executive Summary', tools: ['Knowledge Retrieval', 'Structured Artifact Generator'], trace: generateTrace('General Agent', '1.0', 'Create Executive Summary', ['Knowledge Retrieval', 'Structured Artifact Generator']) } };
  }
  if (lc.includes('comparison') || lc.includes('table') || lc.includes('compare') || extractCompanies(message).length >= 2) {
    const companies = extractCompanies(message);
    return { reply: `I've generated a comparison table for ${companies.join(', ')}.`, artifact: { name: `Company Comparison — ${companies.slice(0, 2).join(' vs ')}${companies.length > 2 ? ' et al.' : ''}`, content: generateComparisonTable(companies), capability: 'Generate Company Comparison', tools: ['Web Search', 'Structured Artifact Generator'], trace: generateTrace('General Agent', '1.0', 'Generate Company Comparison', ['Web Search', 'Structured Artifact Generator']) } };
  }
  return { reply: "Hello! I'm your General Agent. I can help you with:\n\n• **Generate Proposal Outline** — structured proposals with phases and investment\n• **Draft SOW** — statements of work with deliverables and terms\n• **Create Executive Summary** — concise leadership briefings\n• **Company Comparison Tables** — structured comparison data\n\nTry: *\"Generate a proposal outline for Client X in retail analytics\"*" };
}

function generateProposal(client: string): string {
  return `# Proposal Outline — ${client}

## 1. Executive Summary

This proposal outlines our recommended approach for ${client}'s digital transformation initiative. Based on our analysis of the client's current landscape and strategic objectives, we recommend a phased engagement model that delivers measurable outcomes within the first 90 days.

## 2. Client Context

- **Industry:** Retail & Analytics
- **Primary Challenge:** Fragmented data infrastructure limiting real-time decision making
- **Strategic Priority:** Unified analytics platform with predictive capabilities
- **Timeline Expectation:** 6–9 month engagement

## 3. Proposed Approach

### Phase 1: Discovery & Assessment (Weeks 1–4)
- Stakeholder interviews and requirements gathering
- Current state architecture review
- Data quality and governance assessment
- Gap analysis and opportunity mapping

### Phase 2: Solution Design (Weeks 5–8)
- Reference architecture development
- Technology selection and validation
- Integration design with existing systems
- Security and compliance framework

### Phase 3: Implementation (Weeks 9–20)
- Core platform deployment
- Data pipeline construction
- Dashboard and reporting layer
- User acceptance testing

### Phase 4: Enablement & Handover (Weeks 21–24)
- Training program delivery
- Operational runbook creation
- Support transition planning
- Success metrics validation

## 4. Team Composition

| Role | Allocation | Duration |
|------|-----------|----------|
| Engagement Lead | 50% | Full |
| Solution Architect | 100% | Phase 1–3 |
| Data Engineer (×2) | 100% | Phase 2–3 |
| Analytics Specialist | 75% | Phase 2–4 |
| Project Manager | 50% | Full |

## 5. Investment Summary

| Phase | Duration | Estimated Investment |
|-------|----------|---------------------|
| Discovery | 4 weeks | $85,000 |
| Design | 4 weeks | $110,000 |
| Implementation | 12 weeks | $340,000 |
| Enablement | 4 weeks | $65,000 |
| **Total** | **24 weeks** | **$600,000** |

## 6. Success Metrics

- 40% reduction in time-to-insight for business stakeholders
- Unified data platform serving 95% of analytics use cases
- Self-service adoption rate of 70% within 3 months of launch
- Data quality score improvement from current baseline to >90%

## 7. Next Steps

1. Schedule executive alignment session
2. Confirm engagement timeline and team availability
3. Execute NDA and MSA review
4. Initiate Phase 1 kickoff

---

*Generated by Pre-Sales Agent v1.2 · Capability: Generate Proposal Outline*`;
}

function generateSOW(): string {
  return `# Statement of Work

## Analytics Platform Implementation

### 1. Scope of Work

This Statement of Work defines the deliverables, timeline, and responsibilities for the Analytics Platform implementation engagement.

### 2. Deliverables

| # | Deliverable | Description | Acceptance Criteria |
|---|------------|-------------|-------------------|
| 1 | Requirements Document | Comprehensive requirements specification | Stakeholder sign-off |
| 2 | Architecture Design | Technical architecture and integration design | Architecture review board approval |
| 3 | Data Pipeline | Automated data ingestion and transformation | All sources connected, <5min latency |
| 4 | Analytics Dashboard | Executive and operational dashboards | UAT completion with >90% satisfaction |
| 5 | Training Materials | User guides and training decks | Training delivery confirmation |

### 3. Assumptions

- Client will provide timely access to source systems
- Existing cloud infrastructure (AWS/Azure) is available
- Key stakeholders available for weekly reviews
- Data governance policies are pre-approved

### 4. Timeline

Total duration: 24 weeks from project kickoff.

### 5. Commercial Terms

- **Billing:** Monthly in arrears
- **Payment Terms:** Net 30
- **Change Requests:** Managed through formal CR process
- **Travel:** Billed at cost, pre-approved

---

*Generated by Pre-Sales Agent v1.2 · Capability: Draft SOW*`;
}

function generateExecutiveSummary(): string {
  return `# Executive Summary

## Engagement Overview

### Strategic Context

Our client is pursuing a comprehensive modernisation of their analytics capabilities. The current landscape is characterised by fragmented data sources, manual reporting processes, and limited predictive capabilities.

### Recommended Approach

1. **Discover** — Map the current state and define success metrics
2. **Design** — Architect the target platform with stakeholder input
3. **Deliver** — Build and deploy in iterative sprints
4. **Enable** — Transfer knowledge and establish operational ownership

### Key Differentiators

- **Accelerated time-to-value:** First dashboards live within 8 weeks
- **Proven methodology:** Based on 30+ successful analytics implementations
- **Flexible architecture:** Cloud-native design supporting multi-cloud strategy
- **Knowledge transfer focus:** Client team fully enabled by engagement end

### Investment & ROI

- **Total Investment:** $600,000 over 24 weeks
- **Expected ROI:** 3.2x within 18 months
- **Payback Period:** 8–10 months post-implementation

### Risk Mitigation

| Risk | Mitigation |
|------|----------|
| Data quality issues | Early data profiling in Phase 1 |
| Stakeholder alignment | Bi-weekly steering committee |
| Scope creep | Formal change request process |
| Adoption resistance | Embedded change management |

---

*Generated by Pre-Sales Agent v1.2 · Capability: Create Executive Summary*`;
}

function generateComparisonTable(companies: string[]): string {
  const data: Record<string, { industry: string; hq: string; revenue: string; employees: string; products: string; news: string }> = {
    Shopify: { industry: 'E-Commerce Platform', hq: 'Ottawa, Canada', revenue: '$7.1B (2024)', employees: '~11,600', products: 'Shopify Plus, POS, Payments, Markets', news: 'Launched AI-powered commerce assistant; expanded B2B capabilities' },
    BigCommerce: { industry: 'E-Commerce Platform', hq: 'Austin, TX, USA', revenue: '$330M (2024)', employees: '~1,500', products: 'Enterprise, Essentials, B2B Edition', news: 'Acquired by Bain Capital; focusing on enterprise segment' },
    WooCommerce: { industry: 'E-Commerce Plugin', hq: 'San Francisco, CA', revenue: 'Part of Automattic', employees: '~1,900 (Automattic)', products: 'WooCommerce Core, Payments, Shipping', news: 'Released block-based checkout; enhanced mobile experience' },
    Stripe: { industry: 'Payment Infrastructure', hq: 'San Francisco, CA', revenue: '$14B+ (2024)', employees: '~8,000', products: 'Payments, Billing, Connect, Atlas', news: 'Launched Stripe Tax globally; revenue recognition tools' },
    PayPal: { industry: 'Digital Payments', hq: 'San Jose, CA', revenue: '$29.8B (2024)', employees: '~26,500', products: 'PayPal, Venmo, Braintree, Zettle', news: 'Launched stablecoin PYUSD; new checkout experiences' },
    Salesforce: { industry: 'CRM / Cloud', hq: 'San Francisco, CA', revenue: '$34.9B (2024)', employees: '~73,000', products: 'Sales Cloud, Service Cloud, Einstein AI', news: 'Agentforce AI platform launch; Data Cloud expansion' },
    HubSpot: { industry: 'Marketing / CRM', hq: 'Cambridge, MA', revenue: '$2.2B (2024)', employees: '~7,600', products: 'Marketing Hub, Sales Hub, CMS Hub', news: 'Launched Breeze AI; expanded commerce tools' },
    Snowflake: { industry: 'Data Cloud', hq: 'Bozeman, MT', revenue: '$2.8B (2024)', employees: '~5,900', products: 'Data Cloud, Snowpark, Cortex AI', news: 'Launched Cortex AI; new CEO Sridhar Ramaswamy' },
    Datadog: { industry: 'Observability', hq: 'New York, NY', revenue: '$2.1B (2024)', employees: '~5,200', products: 'APM, Logs, Infrastructure, Security', news: 'Expanded AI observability; launched Bits AI assistant' },
    Atlassian: { industry: 'Collaboration Software', hq: 'Sydney, Australia', revenue: '$4.4B (2024)', employees: '~12,000', products: 'Jira, Confluence, Bitbucket, Trello', news: 'Rovo AI launch; end of Server product line' },
  };
  const defaultData = { industry: 'Technology', hq: 'United States', revenue: 'Private', employees: 'N/A', products: 'Various', news: 'No recent updates available' };
  let table = `# Company Comparison Table\n\n`;
  table += `| Company | Industry | HQ | Revenue | Employees | Key Products | Recent News |\n`;
  table += `|---------|----------|----|---------|-----------|--------------|-----------|\n`;
  for (const company of companies) {
    const d = data[company] || defaultData;
    table += `| [${company}](https://www.${company.toLowerCase().replace(/\s+/g, '')}.com) | ${d.industry} | ${d.hq} | ${d.revenue} | ${d.employees} | ${d.products} | ${d.news} |\n`;
  }
  table += `\n---\n\n*Generated by Company Information Table Agent v1.0 · Capability: Generate Company Comparison*`;
  return table;
}

// ─── Context ─────────────────────────────────────────────────

const MY_SPACE_ID = 'space-my';

interface ArgoContextType {
  spaces: Space[];
  activeSpaceId: string;
  chats: Chat[];
  activeChatId: string | null;
  artifacts: Artifact[];
  activeArtifactId: string | null;
  activeFilesSpaceId: string | null;
  selectedAgentId: string;
  isAdmin: boolean;
  isTyping: boolean;
  rightPanelView: RightPanelView;
  adminTab: AdminTab;
  centerView: CenterView;
  sidebarCollapsed: boolean;

  activeChat: Chat | undefined;
  activeArtifact: Artifact | undefined;
  selectedAgent: Agent | undefined;
  spaceArtifacts: Artifact[];
  allArtifacts: Artifact[];

  setActiveSpaceId: (id: string) => void;
  setActiveChatId: (id: string | null) => void;
  setActiveArtifactId: (id: string | null) => void;
  setSelectedAgentId: (id: string) => void;
  setIsAdmin: (v: boolean) => void;
  setRightPanelView: (v: RightPanelView) => void;
  setAdminTab: (t: AdminTab) => void;
  setCenterView: (v: CenterView) => void;
  setSidebarCollapsed: (v: boolean) => void;
  sendMessage: (content: string) => void;
  createSpace: (name: string, description?: string, projectContext?: string) => void;
  createChat: (name: string, spaceId: string) => void;
  renameChat: (chatId: string, newName: string) => void;
  renameSpace: (spaceId: string, newName: string) => void;
  renameArtifact: (artifactId: string, newName: string) => void;
  openSpaceWorkspace: (spaceId: string) => void;
  openFilesPanel: (spaceId: string) => void;
  closeFilesPanel: () => void;
  exitSpace: () => void;
  navigateToChat: (chatId: string) => void;
}

const ArgoContext = createContext<ArgoContextType | null>(null);

export function useArgo() {
  const ctx = useContext(ArgoContext);
  if (!ctx) throw new Error('useArgo must be inside ArgoProvider');
  return ctx;
}

export function ArgoProvider({ children }: { children: ReactNode }) {
  const [spaces, setSpaces] = useState<Space[]>([
    { id: MY_SPACE_ID, name: 'General Chat', description: 'Your default space for general conversations.', visibility: 'private', isDefault: true, owner: 'You', createdAt: new Date('2025-01-01') },
    { id: 'space-1', name: 'Client Name 1', description: 'Pre-sales materials and proposals for active client engagements.', visibility: 'private', owner: 'You', createdAt: new Date('2025-01-15') },
    { id: 'space-2', name: 'Client Name 2 Proposal', description: 'Competitive analysis and market research for Q1 planning.', visibility: 'shared', owner: 'Sarah Chen', sharedBy: 'Sarah Chen', createdAt: new Date('2025-02-01') },
    { id: 'space-3', name: 'Client Name 3', description: 'Enterprise migration project for Client Name 3.', visibility: 'shared', owner: 'You', createdAt: new Date('2025-03-01') },
  ]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>(MY_SPACE_ID);
  const [chats, setChats] = useState<Chat[]>([
    // General Chat (12 chats)
    { id: 'general', name: 'PRD', spaceId: MY_SPACE_ID, messages: [{ id: 'g1-msg', role: 'user' as const, content: 'Help me draft a PRD.', timestamp: new Date('2025-03-10') }], createdAt: new Date('2025-03-10') },
    { id: 'general-2', name: 'VRD', spaceId: MY_SPACE_ID, messages: [{ id: 'g2-msg', role: 'user' as const, content: 'Create a VRD document.', timestamp: new Date('2025-03-09') }], createdAt: new Date('2025-03-09') },
    { id: 'general-3', name: 'How to Use Lovable', spaceId: MY_SPACE_ID, messages: [{ id: 'g3-msg', role: 'user' as const, content: 'How do I use Lovable?', timestamp: new Date('2025-03-08') }], createdAt: new Date('2025-03-08') },
    { id: 'general-4', name: 'What Does Argo Mean', spaceId: MY_SPACE_ID, messages: [{ id: 'g4-msg', role: 'user' as const, content: 'What does Argo mean?', timestamp: new Date('2025-03-07') }], createdAt: new Date('2025-03-07') },
    { id: 'general-5', name: 'Random Architecture Thoughts', spaceId: MY_SPACE_ID, messages: [{ id: 'g5-msg', role: 'user' as const, content: 'Some architecture ideas.', timestamp: new Date('2025-03-06') }], createdAt: new Date('2025-03-06') },
    { id: 'general-6', name: 'Sales Pitch Draft Ideas', spaceId: MY_SPACE_ID, messages: [{ id: 'g6-msg', role: 'user' as const, content: 'Draft some sales pitch ideas.', timestamp: new Date('2025-03-05') }], createdAt: new Date('2025-03-05') },
    { id: 'general-7', name: 'Budget Planning Notes', spaceId: MY_SPACE_ID, messages: [{ id: 'g7-msg', role: 'user' as const, content: 'Help me plan the Q2 budget.', timestamp: new Date('2025-03-04') }], createdAt: new Date('2025-03-04') },
    { id: 'general-8', name: 'API Integration Ideas', spaceId: MY_SPACE_ID, messages: [{ id: 'g8-msg', role: 'user' as const, content: 'What APIs should we integrate?', timestamp: new Date('2025-03-03') }], createdAt: new Date('2025-03-03') },
    { id: 'general-9', name: 'Team Standup Notes', spaceId: MY_SPACE_ID, messages: [{ id: 'g9-msg', role: 'user' as const, content: 'Summarize today\'s standup.', timestamp: new Date('2025-03-02') }], createdAt: new Date('2025-03-02') },
    { id: 'general-10', name: 'Q2 Goals', spaceId: MY_SPACE_ID, messages: [{ id: 'g10-msg', role: 'user' as const, content: 'Help define our Q2 OKRs.', timestamp: new Date('2025-03-01') }], createdAt: new Date('2025-03-01') },
    { id: 'general-11', name: 'Design Review Feedback', spaceId: MY_SPACE_ID, messages: [{ id: 'g11-msg', role: 'user' as const, content: 'Summarize the design review feedback.', timestamp: new Date('2025-02-28') }], createdAt: new Date('2025-02-28') },
    { id: 'general-12', name: 'Onboarding Checklist', spaceId: MY_SPACE_ID, messages: [{ id: 'g12-msg', role: 'user' as const, content: 'Create a new hire onboarding checklist.', timestamp: new Date('2025-02-27') }], createdAt: new Date('2025-02-27') },
    // Client Name 1 (4 chats)
    { id: 'chat-1', name: 'Retail Analytics RFP', spaceId: 'space-1', messages: [
      { id: 'rfp-msg-1', role: 'user' as const, content: 'Generate an RFP response for RetailCo covering their retail analytics platform requirements.', timestamp: new Date('2025-02-19') },
      { id: 'rfp-msg-2', role: 'assistant' as const, content: 'I\'ve generated an RFP response for RetailCo. The artifact is now available — click "View Artifact" to see it.', agentId: 'pre-sales', agentName: 'Pre-Sales Agent', timestamp: new Date('2025-02-19'), artifactId: 'demo-rfp', trace: { agentName: 'Pre-Sales Agent', agentVersion: '1.2', capability: 'Generate Proposal Outline', toolsUsed: ['Knowledge Retrieval', 'Structured Artifact Generator'], documentsRetrieved: ['rfp-template-v2.md', 'retailco-brief.md'], model: 'gpt-4o', tokenUsage: { input: 2100, output: 4200 }, latencyMs: 4500, costEstimate: '$0.078' } },
    ], createdAt: new Date('2025-02-01') },
    { id: 'chat-1b', name: 'Discovery Call Notes', spaceId: 'space-1', messages: [{ id: 'c1b-msg', role: 'user' as const, content: 'Summarize the discovery call with Client Name 1.', timestamp: new Date('2025-01-20') }], createdAt: new Date('2025-01-20') },
    { id: 'chat-1c', name: 'Pricing Discussion', spaceId: 'space-1', messages: [{ id: 'c1c-msg', role: 'user' as const, content: 'Help me structure the pricing tiers for this engagement.', timestamp: new Date('2025-02-05') }], createdAt: new Date('2025-02-05') },
    { id: 'chat-1d', name: 'Technical Deep Dive', spaceId: 'space-1', messages: [{ id: 'c1d-msg', role: 'user' as const, content: 'Review the technical architecture for the analytics platform.', timestamp: new Date('2025-02-12') }], createdAt: new Date('2025-02-12') },
    // Client Name 2 Proposal (3 chats)
    { id: 'chat-2', name: 'Competitor Landscape', spaceId: 'space-2', messages: [{ id: 'c2-msg', role: 'user' as const, content: 'Map the competitor landscape for this sector.', timestamp: new Date('2025-02-10') }], createdAt: new Date('2025-02-10') },
    { id: 'chat-2b', name: 'Stakeholder Mapping', spaceId: 'space-2', messages: [{ id: 'c2b-msg', role: 'user' as const, content: 'Identify the key stakeholders and decision makers.', timestamp: new Date('2025-02-08') }], createdAt: new Date('2025-02-08') },
    { id: 'chat-2c', name: 'Follow-up Action Items', spaceId: 'space-2', messages: [{ id: 'c2c-msg', role: 'user' as const, content: 'List the action items from our last meeting.', timestamp: new Date('2025-02-14') }], createdAt: new Date('2025-02-14') },
    // Client Name 3 (3 chats)
    { id: 'chat-3a', name: 'Migration Strategy', spaceId: 'space-3', messages: [{ id: 'c3a-msg', role: 'user' as const, content: 'Draft the migration strategy for Client Name 3.', timestamp: new Date('2025-03-05') }], createdAt: new Date('2025-03-05') },
    { id: 'chat-3b', name: 'Risk Assessment', spaceId: 'space-3', messages: [{ id: 'c3b-msg', role: 'user' as const, content: 'Identify risks for the enterprise migration.', timestamp: new Date('2025-03-08') }], createdAt: new Date('2025-03-08') },
    { id: 'chat-3c', name: 'Kickoff Agenda', spaceId: 'space-3', messages: [{ id: 'c3c-msg', role: 'user' as const, content: 'Prepare the kickoff meeting agenda.', timestamp: new Date('2025-03-10') }], createdAt: new Date('2025-03-10') },
  ]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([
    { id: 'demo-1', name: 'Proposal Outline – Client Name 1', content: '# Proposal Outline\n\nSample proposal content.', spaceId: 'space-1', chatId: 'chat-1', agentId: 'pre-sales', agentName: 'Pre-Sales Agent', capability: 'Generate Proposal Outline', artifactType: 'markdown', toolsUsed: ['Knowledge Retrieval', 'Structured Artifact Generator'], timestamp: new Date('2025-02-18'), version: 1, fileSize: '4.2 KB', versions: [{ version: 1, content: '# Proposal Outline\n\nSample proposal content.', timestamp: new Date('2025-02-18'), fileSize: '4.2 KB' }], trace: { agentName: 'Pre-Sales Agent', agentVersion: '1.2', capability: 'Generate Proposal Outline', toolsUsed: ['Knowledge Retrieval'], documentsRetrieved: [], model: 'gpt-4o', tokenUsage: { input: 1200, output: 2400 }, latencyMs: 3200, costEstimate: '$0.045' } },
    { id: 'demo-2', name: 'Executive Summary – Client Name 2 Proposal', content: '# Executive Summary\n\nSample executive summary.', spaceId: 'space-2', chatId: 'chat-2', agentId: 'pre-sales', agentName: 'Pre-Sales Agent', capability: 'Create Executive Summary', artifactType: 'markdown', toolsUsed: ['Knowledge Retrieval', 'Structured Artifact Generator'], timestamp: new Date('2025-02-15'), version: 1, fileSize: '3.1 KB', versions: [{ version: 1, content: '# Executive Summary\n\nSample executive summary.', timestamp: new Date('2025-02-15'), fileSize: '3.1 KB' }], trace: { agentName: 'Pre-Sales Agent', agentVersion: '1.2', capability: 'Create Executive Summary', toolsUsed: ['Knowledge Retrieval'], documentsRetrieved: [], model: 'gpt-4o', tokenUsage: { input: 900, output: 1800 }, latencyMs: 2800, costEstimate: '$0.032' } },
    { id: 'demo-3', name: 'Company Comparison Table – Retail Platforms', content: '# Company Comparison\n\nSample comparison table.', spaceId: MY_SPACE_ID, chatId: 'general', agentId: 'company-info', agentName: 'Company Information Table Agent', capability: 'Generate Company Comparison', artifactType: 'html', toolsUsed: ['Web Search', 'Structured Artifact Generator'], timestamp: new Date('2025-02-12'), version: 1, fileSize: '2.8 KB', versions: [{ version: 1, content: '# Company Comparison\n\nSample comparison table.', timestamp: new Date('2025-02-12'), fileSize: '2.8 KB' }], trace: { agentName: 'Company Information Table Agent', agentVersion: '1.0', capability: 'Generate Company Comparison', toolsUsed: ['Web Search'], documentsRetrieved: [], model: 'gpt-4o', tokenUsage: { input: 1100, output: 2000 }, latencyMs: 4100, costEstimate: '$0.038' } },
    { id: 'demo-4', name: 'Draft SOW – Client Name 1', content: generateSOW(), spaceId: 'space-1', chatId: 'chat-1', agentId: 'pre-sales', agentName: 'Pre-Sales Agent', capability: 'Draft SOW', artifactType: 'markdown', toolsUsed: ['Knowledge Retrieval', 'Structured Artifact Generator'], timestamp: new Date('2025-02-10'), version: 2, fileSize: '6.5 KB', versions: [{ version: 1, content: '# Statement of Work\n\nInitial draft.', timestamp: new Date('2025-02-05'), fileSize: '3.2 KB' }, { version: 2, content: generateSOW(), timestamp: new Date('2025-02-10'), fileSize: '6.5 KB' }], trace: { agentName: 'Pre-Sales Agent', agentVersion: '1.2', capability: 'Draft SOW', toolsUsed: ['Knowledge Retrieval'], documentsRetrieved: [], model: 'gpt-4o', tokenUsage: { input: 1400, output: 2800 }, latencyMs: 3500, costEstimate: '$0.052' } },
    { id: 'demo-5', name: 'Market Landscape Table – FinTech', content: '# Market Landscape\n\nSample market landscape.', spaceId: 'space-2', chatId: 'chat-2', agentId: 'company-info', agentName: 'Company Information Table Agent', capability: 'Generate Company Comparison', artifactType: 'html', toolsUsed: ['Web Search', 'Structured Artifact Generator'], timestamp: new Date('2025-02-08'), version: 1, fileSize: '3.5 KB', versions: [{ version: 1, content: '# Market Landscape\n\nSample market landscape.', timestamp: new Date('2025-02-08'), fileSize: '3.5 KB' }], trace: { agentName: 'Company Information Table Agent', agentVersion: '1.0', capability: 'Generate Company Comparison', toolsUsed: ['Web Search'], documentsRetrieved: [], model: 'gpt-4o', tokenUsage: { input: 1000, output: 1900 }, latencyMs: 3800, costEstimate: '$0.035' } },
    { id: 'demo-rfp', name: 'Retail Analytics RFP Response', content: generateProposal('RetailCo'), spaceId: 'space-1', chatId: 'chat-1', agentId: 'pre-sales', agentName: 'Pre-Sales Agent', capability: 'Generate Proposal Outline', artifactType: 'markdown', toolsUsed: ['Knowledge Retrieval', 'Structured Artifact Generator'], timestamp: new Date('2025-02-20'), version: 2, fileSize: '8.4 KB', versions: [{ version: 1, content: '# RFP Response — RetailCo\n\nInitial draft response.', timestamp: new Date('2025-02-19'), fileSize: '4.1 KB' }, { version: 2, content: generateProposal('RetailCo'), timestamp: new Date('2025-02-20'), fileSize: '8.4 KB' }], trace: { agentName: 'Pre-Sales Agent', agentVersion: '1.2', capability: 'Generate Proposal Outline', toolsUsed: ['Knowledge Retrieval', 'Structured Artifact Generator'], documentsRetrieved: ['rfp-template-v2.md', 'retailco-brief.md'], model: 'gpt-4o', tokenUsage: { input: 2100, output: 4200 }, latencyMs: 4500, costEstimate: '$0.078' } },
    { id: 'demo-6', name: 'Discovery Call Summary', content: '# Discovery Call Summary\n\nKey takeaways from the initial call with Client Name 1.', spaceId: 'space-1', chatId: 'chat-1b', agentId: 'general', agentName: 'General Agent', capability: 'General Assistance', artifactType: 'markdown', toolsUsed: ['Knowledge Retrieval'], timestamp: new Date('2025-01-21'), version: 1, fileSize: '2.1 KB', versions: [{ version: 1, content: '# Discovery Call Summary\n\nKey takeaways.', timestamp: new Date('2025-01-21'), fileSize: '2.1 KB' }], trace: generateTrace('General Agent', '1.0', 'General Assistance', ['Knowledge Retrieval']) },
    { id: 'demo-7', name: 'Pricing Model – Client Name 1', content: '# Pricing Model\n\nTiered pricing structure for the engagement.', spaceId: 'space-1', chatId: 'chat-1c', agentId: 'general', agentName: 'General Agent', capability: 'General Assistance', artifactType: 'markdown', toolsUsed: ['Structured Artifact Generator'], timestamp: new Date('2025-02-06'), version: 1, fileSize: '3.0 KB', versions: [{ version: 1, content: '# Pricing Model\n\nTiered pricing.', timestamp: new Date('2025-02-06'), fileSize: '3.0 KB' }], trace: generateTrace('General Agent', '1.0', 'General Assistance', ['Structured Artifact Generator']) },
    { id: 'demo-8', name: 'Stakeholder Map – Client Name 2', content: '# Stakeholder Map\n\nKey decision makers and influencers.', spaceId: 'space-2', chatId: 'chat-2b', agentId: 'general', agentName: 'General Agent', capability: 'General Assistance', artifactType: 'html', toolsUsed: ['Web Search', 'Structured Artifact Generator'], timestamp: new Date('2025-02-09'), version: 1, fileSize: '1.8 KB', versions: [{ version: 1, content: '# Stakeholder Map\n\nDecision makers.', timestamp: new Date('2025-02-09'), fileSize: '1.8 KB' }], trace: generateTrace('General Agent', '1.0', 'General Assistance', ['Web Search']) },
    { id: 'demo-9', name: 'Migration Playbook – Client Name 3', content: '# Migration Playbook\n\nStep-by-step migration plan.', spaceId: 'space-3', chatId: 'chat-3a', agentId: 'general', agentName: 'General Agent', capability: 'General Assistance', artifactType: 'markdown', toolsUsed: ['Knowledge Retrieval', 'Structured Artifact Generator'], timestamp: new Date('2025-03-06'), version: 1, fileSize: '5.2 KB', versions: [{ version: 1, content: '# Migration Playbook\n\nStep-by-step plan.', timestamp: new Date('2025-03-06'), fileSize: '5.2 KB' }], trace: generateTrace('General Agent', '1.0', 'General Assistance', ['Knowledge Retrieval', 'Structured Artifact Generator']) },
    { id: 'demo-10', name: 'Risk Register – Enterprise Migration', content: '# Risk Register\n\nIdentified risks and mitigation strategies.', spaceId: 'space-3', chatId: 'chat-3b', agentId: 'general', agentName: 'General Agent', capability: 'General Assistance', artifactType: 'pptx-outline', toolsUsed: ['Knowledge Retrieval'], timestamp: new Date('2025-03-09'), version: 1, fileSize: '2.4 KB', versions: [{ version: 1, content: '# Risk Register\n\nRisks and mitigations.', timestamp: new Date('2025-03-09'), fileSize: '2.4 KB' }], trace: generateTrace('General Agent', '1.0', 'General Assistance', ['Knowledge Retrieval']) },
    { id: 'demo-11', name: 'Q2 OKR Framework', content: '# Q2 OKR Framework\n\nObjectives and key results for Q2.', spaceId: MY_SPACE_ID, chatId: 'general-10', agentId: 'general', agentName: 'General Agent', capability: 'General Assistance', artifactType: 'markdown', toolsUsed: ['Structured Artifact Generator'], timestamp: new Date('2025-03-01'), version: 1, fileSize: '1.9 KB', versions: [{ version: 1, content: '# Q2 OKR Framework\n\nOKRs.', timestamp: new Date('2025-03-01'), fileSize: '1.9 KB' }], trace: generateTrace('General Agent', '1.0', 'General Assistance', ['Structured Artifact Generator']) },
  ]);
  const [activeArtifactId, setActiveArtifactId] = useState<string | null>(null);
  const [activeFilesSpaceId, setActiveFilesSpaceId] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState('general');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('empty');
  const [adminTab, setAdminTab] = useState<AdminTab>('agents');
  const [centerView, setCenterView] = useState<CenterView>('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const artifactCounter = useRef(0);

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeArtifact = artifacts.find(a => a.id === activeArtifactId);
  const selectedAgent = AGENTS.find(a => a.id === selectedAgentId);
  const spaceArtifacts = activeSpaceId
    ? artifacts.filter(a => a.spaceId === activeSpaceId)
    : [];
  const allArtifacts = artifacts;

  const sendMessage = useCallback((content: string) => {
    const userMsg: Message = { id: `msg-${Date.now()}`, role: 'user', content, timestamp: new Date() };
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, userMsg] } : c));
    setIsTyping(true);
    const chat = chats.find(c => c.id === activeChatId);
    if (chat && (chat.name === 'New Chat' || chat.messages.length === 0)) {
      const smartTitle = generateSmartChatTitle(content);
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, name: smartTitle, messages: [...c.messages] } : c));
    }

    const activeSpace = spaces.find(s => s.id === activeSpaceId);
    const systemContext = activeSpace?.projectContext ? `Project Context:\n${activeSpace.projectContext}` : undefined;
    console.log('[Argo] System context for chat:', systemContext || '(none)');

    setTimeout(() => {
      const result = simulateResponse('general', content);
      let newArtifactId: string | undefined;
      if (result.artifact) {
        artifactCounter.current += 1;
        newArtifactId = `artifact-${artifactCounter.current}`;
        const contentStr = result.artifact.content;
        const fileSize = `${(new TextEncoder().encode(contentStr).length / 1024).toFixed(1)} KB`;
        const newArtifact: Artifact = {
          id: newArtifactId, name: result.artifact.name, content: contentStr,
          spaceId: activeSpaceId, chatId: activeChatId, agentId: 'general', agentName: 'General Agent',
          capability: result.artifact.capability, artifactType: 'markdown', toolsUsed: result.artifact.tools,
          timestamp: new Date(), version: 1, fileSize,
          versions: [{ version: 1, content: contentStr, timestamp: new Date(), fileSize }],
          trace: result.artifact.trace,
        };
        setArtifacts(prev => [...prev, newArtifact]);
        setActiveArtifactId(newArtifactId);
        setRightPanelView('artifact');
      }
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-resp`, role: 'assistant', content: result.reply,
        agentId: 'general', agentName: 'General Agent', timestamp: new Date(),
        artifactId: newArtifactId, trace: result.artifact?.trace,
      };
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, assistantMsg] } : c));
      setIsTyping(false);
    }, 1500);
  }, [activeChatId, selectedAgentId, activeSpaceId, selectedAgent, chats, spaces]);

  const createSpace = useCallback((name: string, description?: string, projectContext?: string) => {
    const id = `space-${Date.now()}`;
    setSpaces(prev => [...prev, { id, name, description: description || '', projectContext: projectContext || undefined, visibility: 'private', owner: 'You', createdAt: new Date() }]);
    setActiveSpaceId(id);
    const chatId = `chat-${Date.now()}`;
    setChats(prev => [...prev, { id: chatId, name: 'New Chat', spaceId: id, messages: [], createdAt: new Date() }]);
    setActiveChatId(chatId);
    setCenterView('chat');
  }, []);

  const createChat = useCallback((name: string, spaceId: string) => {
    const id = `chat-${Date.now()}`;
    setChats(prev => [...prev, { id, name, spaceId, messages: [], createdAt: new Date() }]);
    setActiveChatId(id);
    setActiveSpaceId(spaceId);
    setCenterView('chat');
    setActiveArtifactId(null);
    setRightPanelView('empty');
  }, []);

  const openSpaceWorkspace = useCallback((spaceId: string) => {
    setActiveSpaceId(spaceId);
    setCenterView('space-workspace');
    setActiveArtifactId(null);
    setRightPanelView('empty');
  }, []);

  const openFilesPanel = useCallback((spaceId: string) => {
    setActiveFilesSpaceId(spaceId);
    setActiveArtifactId(null);
    setRightPanelView('files');
  }, []);

  const closeFilesPanel = useCallback(() => {
    setActiveFilesSpaceId(null);
    setRightPanelView('empty');
  }, []);

  const exitSpace = useCallback(() => {
    setActiveSpaceId(MY_SPACE_ID);
    setActiveChatId('general');
    setCenterView('chat');
    setActiveArtifactId(null);
    setRightPanelView('empty');
  }, []);

  const renameChat = useCallback((chatId: string, newName: string) => {
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, name: newName } : c));
  }, []);

  const renameSpace = useCallback((spaceId: string, newName: string) => {
    setSpaces(prev => prev.map(s => s.id === spaceId ? { ...s, name: newName } : s));
  }, []);

  const renameArtifact = useCallback((artifactId: string, newName: string) => {
    setArtifacts(prev => prev.map(a => a.id === artifactId ? { ...a, name: newName } : a));
  }, []);

  const navigateToChat = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setActiveChatId(chatId);
      setActiveSpaceId(chat.spaceId);
      setCenterView('chat');
    }
  }, [chats]);

  return (
    <ArgoContext.Provider value={{
      spaces, activeSpaceId, chats, activeChatId, artifacts, activeArtifactId, activeFilesSpaceId,
      selectedAgentId, isAdmin, isTyping, rightPanelView, adminTab, centerView, sidebarCollapsed,
      activeChat, activeArtifact, selectedAgent, spaceArtifacts, allArtifacts,
      setActiveSpaceId, setActiveChatId, setActiveArtifactId, setSelectedAgentId,
      setIsAdmin, setRightPanelView, setAdminTab, setCenterView, setSidebarCollapsed,
      sendMessage, createSpace, createChat, renameChat, renameSpace, renameArtifact, openSpaceWorkspace, openFilesPanel, closeFilesPanel, exitSpace, navigateToChat,
    }}>
      {children}
    </ArgoContext.Provider>
  );
}
