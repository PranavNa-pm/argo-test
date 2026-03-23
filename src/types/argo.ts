export interface Tool {
  id: string;
  name: string;
  description: string;
}

export interface Capability {
  id: string;
  name: string;
  description: string;
  tools: string[];
}

export interface Agent {
  id: string;
  name: string;
  version: string;
  description: string;
  model: string;
  capabilities: Capability[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  agentId?: string;
  agentName?: string;
  timestamp: Date;
  artifactId?: string;
  trace?: ExecutionTrace;
}

export interface ExecutionTrace {
  agentName: string;
  agentVersion: string;
  capability: string;
  toolsUsed: string[];
  documentsRetrieved: string[];
  model: string;
  tokenUsage: { input: number; output: number };
  latencyMs: number;
  costEstimate: string;
}

export interface ArtifactVersion {
  version: number;
  content: string;
  timestamp: Date;
  fileSize: string;
}

export interface Artifact {
  id: string;
  name: string;
  content: string;
  spaceId: string;
  chatId: string;
  agentId: string;
  agentName: string;
  capability: string;
  artifactType: 'markdown' | 'html' | 'pptx-outline';
  toolsUsed: string[];
  timestamp: Date;
  version: number;
  versions: ArtifactVersion[];
  fileSize: string;
  trace: ExecutionTrace;
}

export interface Chat {
  id: string;
  name: string;
  spaceId: string;
  messages: Message[];
  createdAt: Date;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  projectContext?: string;
  visibility: 'private' | 'shared';
  isDefault?: boolean;
  owner: string;
  sharedBy?: string;
  createdAt: Date;
  shareCode?: string; // permanent unique token — never changes even if name/description changes
}

export type CenterView = 'chat' | 'config' | 'artifacts-table' | 'space-workspace' | 'new-space' | 'projects';
export type RightPanelView = 'empty' | 'artifact' | 'files';
export type AdminTab = 'agents' | 'prompts' | 'groups';
