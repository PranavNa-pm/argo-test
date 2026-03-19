import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Plus, Globe, Brain, Paperclip, Bot, User, FileText,
  ChevronDown, Eye, Download, Pencil, Search, MessageSquare,
  Wrench, BookOpen, Cpu, Database, DollarSign, Timer,
  Copy, Trash2, Users, FolderOpen, MoreVertical, Lock, Unlock,
  ArrowLeft, SquarePen, ThumbsUp, ThumbsDown, ChevronRight,
  Share2, Upload, Globe as GlobeIcon, X, Link2, ExternalLink,
  FileSignature, Table2, ScrollText, AlertCircle
} from 'lucide-react';
import { useArgo, AGENTS, TOOLS } from '@/context/ArgoContext';
import argoLogo from '@/assets/argo-logo.svg';
import { cn } from '@/lib/utils';
import type { AdminTab } from '@/types/argo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Users Mapped Cell ───────────────────────────────────────

function UsersMappedCell({ count, users }: { count: number; users: string[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm font-semibold text-primary hover:underline cursor-pointer"
      >
        {count}
      </button>
      {expanded && (
        <div className="mt-1.5 space-y-0.5 animate-fade-in">
          {users.map(u => (
            <div key={u} className="text-xs text-muted-foreground">{u}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Chat 3-dot Menu (Radix) ─────────────────────────────────

function ChatMoreMenu({ chatId, chatName, renameChat }: { chatId: string; chatName: string; renameChat: (id: string, name: string) => void }) {
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(chatName);

  if (renaming) {
    return (
      <div className="flex items-center gap-1">
        <input
          value={renameValue}
          onChange={e => setRenameValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { renameChat(chatId, renameValue.trim() || chatName); setRenaming(false); }
            if (e.key === 'Escape') setRenaming(false);
          }}
          onBlur={() => { renameChat(chatId, renameValue.trim() || chatName); setRenaming(false); }}
          className="text-xs bg-background border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring w-32"
          autoFocus
          onClick={e => e.stopPropagation()}
        />
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground" onClick={e => e.stopPropagation()}>
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          setRenameValue(chatName);
          setRenaming(true);
        }}>
          <Pencil className="w-3.5 h-3.5 mr-2" />
          Rename Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Config Views ────────────────────────────────────────────

function ConfigView({ tab }: { tab: AdminTab }) {
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [agentSearch, setAgentSearch] = useState('');
  const defaultAgent = { name: '', description: '', prompt: '', model: 'gpt-4o', capabilities: [] as string[], agentType: 'system' as 'system' | 'shared', sharedWithRoles: [] as string[] };
  const [newAgent, setNewAgent] = useState(defaultAgent);
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [expandedPromptIdx, setExpandedPromptIdx] = useState<number | null>(null);
  const [promptSearch, setPromptSearch] = useState('');
  if (tab === 'agents') {
    const filteredAgents = agentSearch
      ? AGENTS.filter(a => a.name.toLowerCase().includes(agentSearch.toLowerCase()))
      : AGENTS;

    const roleCounts: Record<string, number> = {
      'general': 10,
      'hr-agent': 6,
      'social-media-agent': 4,
      'it-support-agent': 5,
    };

    const availableRoles = ['Admin', 'All Users'];

    return (
      <div className="w-full p-6 space-y-5 animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Agent Configuration</h2>
          {!showAddAgent && !editingAgentId && (
            <button
              onClick={() => { setNewAgent(defaultAgent); setShowAddAgent(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Agent
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={agentSearch}
            onChange={e => setAgentSearch(e.target.value)}
            placeholder="Search agents..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {(showAddAgent || editingAgentId) && (
          <div className="p-5 rounded-lg border border-border bg-secondary/20 space-y-4 max-w-2xl animate-scale-in">
            <h3 className="text-sm font-semibold text-foreground">{editingAgentId ? 'Edit Agent' : 'Create New Agent'}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Agent Name</label>
                <input value={newAgent.name} onChange={e => setNewAgent({ ...newAgent, name: e.target.value })} placeholder="e.g. Research Agent" className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Short Description</label>
                <input value={newAgent.description} onChange={e => setNewAgent({ ...newAgent, description: e.target.value })} placeholder="What does this agent do?" className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Prompt Template</label>
                  <select className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                    <option>Pre-Sales Prompt v1.2</option>
                    <option>Company Info Prompt v1.0</option>
                    <option>Custom Template</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Model Selection</label>
                  <select value={newAgent.model} onChange={e => setNewAgent({ ...newAgent, model: e.target.value })} className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-ring">
                    <option value="gpt-4o">GPT-4o</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                    <option value="claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Capabilities</label>
                <div className="space-y-1.5">
                  {['Web Search', 'Artifact (Create, Update, Retrieve)', 'Project Knowledge', 'Code Interpreter', 'File Attachments'].map(cap => (
                    <label key={cap} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input type="checkbox" className="rounded border-border" />
                      <span>{cap}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Agent Type</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="radio" name="agentType" checked={newAgent.agentType === 'system'} onChange={() => setNewAgent({ ...newAgent, agentType: 'system', sharedWithRoles: [] })} />
                    <span>System</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input type="radio" name="agentType" checked={newAgent.agentType === 'shared'} onChange={() => setNewAgent({ ...newAgent, agentType: 'shared' })} />
                    <span>Shared</span>
                  </label>
                </div>
              </div>
              {newAgent.agentType === 'shared' && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Share with Roles</label>
                  <div className="space-y-1.5">
                    {availableRoles.map(role => (
                      <label key={role} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={newAgent.sharedWithRoles.includes(role)}
                          onChange={e => {
                            if (e.target.checked) setNewAgent({ ...newAgent, sharedWithRoles: [...newAgent.sharedWithRoles, role] });
                            else setNewAgent({ ...newAgent, sharedWithRoles: newAgent.sharedWithRoles.filter(r => r !== role) });
                          }}
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">{editingAgentId ? 'Save Changes' : 'Create Agent'}</button>
              {editingAgentId && (
                <button className="px-3 py-1.5 rounded-md bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90">Delete Agent</button>
              )}
              <button onClick={() => { setShowAddAgent(false); setEditingAgentId(null); setNewAgent(defaultAgent); }} className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="p-4 rounded-lg border border-border space-y-3 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{agent.name}</span>
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center" title={`${roleCounts[agent.id] || 0} user roles mapped to this agent`}>
                    <span className="text-[10px] font-bold text-primary-foreground">{roleCounts[agent.id] || 0}</span>
                  </div>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", (agent as any).agentType === 'shared' ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground")}>{(agent as any).agentType === 'shared' ? 'Shared' : 'System'}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{agent.description}</p>
              <div className="text-xs text-muted-foreground">
                <span>Created: Jan 2025</span>
                <span className="mx-2">·</span>
                <span>Shared with: All</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {agent.capabilities.map(c => (
                  <span key={c.id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-[10px] text-accent-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {c.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground pt-1 border-t border-border/60">
                <span className="font-mono">Model: {agent.model}</span>
                <span>·</span>
                <span>Prompt: v{agent.version}</span>
                <span className="ml-auto flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingAgentId(agent.id);
                      setShowAddAgent(false);
                      setNewAgent({
                        name: agent.name,
                        description: agent.description,
                        prompt: '',
                        model: agent.model,
                        capabilities: agent.capabilities.map(c => c.name),
                        agentType: (agent as any).agentType === 'shared' ? 'shared' : 'system',
                        sharedWithRoles: [],
                      });
                    }}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }


  if (tab === 'prompts') {
    const prompts = [
      { name: 'General Agent Prompt', description: 'Default prompt for the General Agent', version: 'v1.0', updatedAt: 'Mar 1, 2025', template: 'You are a General Agent. Help users with proposals, SOWs, executive summaries, and company comparison tables. Always output structured markdown artifacts when generating documents.', linkedAgents: ['General Agent'] },
      { name: 'HR Agent Prompt', description: 'Prompt template for HR-related queries', version: 'v1.0', updatedAt: 'Feb 20, 2025', template: 'You are an HR Agent. Answer questions about company policies, benefits, leave management, and internal HR procedures. Always reference the official HR knowledge base.', linkedAgents: ['HR Agent'] },
      { name: 'IT Support Prompt', description: 'Prompt for IT troubleshooting and setup', version: 'v1.0', updatedAt: 'Feb 15, 2025', template: 'You are an IT Support Agent. Help users troubleshoot technical issues, set up software, and resolve common IT problems. Reference the IT knowledge base for standard procedures.', linkedAgents: ['IT Support Agent'] },
    ];

    const filteredPrompts = promptSearch
      ? prompts.filter(p => p.name.toLowerCase().includes(promptSearch.toLowerCase()) || p.description.toLowerCase().includes(promptSearch.toLowerCase()))
      : prompts;

    return (
      <div className="w-full p-6 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Prompt Manager</h2>
            <p className="text-sm text-muted-foreground mt-1">Create, edit, and manage your prompt templates with versioning.</p>
          </div>
          {!showNewPrompt && (
            <button
              onClick={() => setShowNewPrompt(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Prompt
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={promptSearch}
            onChange={e => setPromptSearch(e.target.value)}
            placeholder="Search prompts..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {showNewPrompt && (
          <div className="p-5 rounded-lg border border-border bg-secondary/20 space-y-4 max-w-2xl animate-scale-in">
            <h3 className="text-sm font-semibold text-foreground">Create New Prompt</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Prompt Name</label>
                <input placeholder="e.g. Research Prompt" className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Short Description</label>
                <input placeholder="What is this prompt for?" className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Prompt Template Text</label>
                <textarea rows={5} placeholder="Enter your prompt template..." className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Create Prompt</button>
              <button onClick={() => setShowNewPrompt(false)} className="px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          {filteredPrompts.map((p, i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <div
                onClick={() => setExpandedPromptIdx(expandedPromptIdx === i ? null : i)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-sm cursor-pointer"
              >
                {expandedPromptIdx === i ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                <BookOpen className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-foreground font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.description}</div>
                </div>
                <span className="text-xs font-mono text-muted-foreground">{p.version}</span>
                <span className="text-xs text-muted-foreground">{p.updatedAt}</span>
                <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                  <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Copy"><Copy className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              {expandedPromptIdx === i && (
                <div className="px-4 pb-4 pt-1 border-t border-border bg-secondary/10 space-y-3 animate-fade-in">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Prompt Template</span>
                    <div className="mt-1.5 p-3 rounded-md bg-background border border-border text-xs font-mono text-foreground leading-relaxed whitespace-pre-wrap">{p.template}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Linked Agents ({p.linkedAgents.length})</span>
                    <div className="flex gap-1.5">
                      {p.linkedAgents.map(a => (
                        <span key={a} className="px-2 py-0.5 rounded-full bg-accent text-[10px] text-accent-foreground">{a}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tab === 'groups') {
    const groups = [
      {
        name: 'Admin',
        agents: ['General Agent', 'HR Agent', 'Social Media Agent', 'IT Support Agent'],
        canShare: true,
        rights: ['Can create agents', 'Can edit agents', 'Can manage prompts', 'Can manage group permissions'],
      },
      {
        name: 'Standard Users',
        agents: ['General Agent', 'HR Agent', 'IT Support Agent'],
        canShare: true,
        rights: [],
      },
      {
        name: 'Marketing Team',
        agents: ['General Agent', 'Social Media Agent'],
        canShare: false,
        rights: [],
      },
    ];

    return (
      <div className="w-full p-6 space-y-4 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Group Permissions</h2>
            <p className="text-sm text-muted-foreground mt-1">Configure access rights for each group.</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Group
          </button>
        </div>

        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-secondary border-b border-border">
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-48">Group Name</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">Users Mapped</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Access Rights</th>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => {
                const usersMapped: Record<string, { count: number; users: string[] }> = {
                  'Admin': { count: 2, users: ['Alex Thompson', 'Michael Brown'] },
                  'Standard Users': { count: 8, users: ['John Smith', 'Sarah Lee', 'Tom Harris', 'Emma Davis', 'Chris Johnson', 'Lisa Park', 'David Kim', 'James Wilson'] },
                  'Marketing Team': { count: 3, users: ['Amy Chen', 'Mark Foster', 'Rachel Green'] },
                };
                const mapped = usersMapped[g.name] || { count: 0, users: [] };
                return (
                <tr key={i} className="border-b border-border last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-foreground">{g.name}</td>
                  <td className="px-4 py-3">
                    <UsersMappedCell count={mapped.count} users={mapped.users} />
                  </td>
                  <td className="px-4 py-3 space-y-2.5">
                    <div>
                      <span className="text-xs font-semibold text-foreground">Assigned Agents:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {g.agents.map(a => (
                          <span key={a} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">{a}</span>
                        ))}
                      </div>
                    </div>
                    {g.canShare && (
                      <div>
                        <span className="text-xs font-semibold text-foreground">Project Sharing:</span>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">Can Share</span>
                        </div>
                      </div>
                    )}
                    {g.rights.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-foreground">Management Rights:</span>
                        <ul className="mt-1 space-y-0.5">
                          {g.rights.map(r => (
                            <li key={r} className="text-xs text-muted-foreground">{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!g.canShare && g.rights.length === 0 && (
                      <div className="text-xs text-muted-foreground italic">No project sharing · No management rights</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Map Users"><Users className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}

// ─── Artifacts Table ─────────────────────────────────────────

function ArtifactsTable() {
  const { allArtifacts, spaces, chats, setActiveArtifactId, setRightPanelView, navigateToChat, renameArtifact } = useArgo();
  const [artifactSearch, setArtifactSearch] = useState('');
  const [sortField, setSortField] = useState<'name' | 'source' | 'type' | 'date'>('date');
  const [sortAsc, setSortAsc] = useState(false);
  const [contextFilter, setContextFilter] = useState<'all' | 'general-chat' | 'projects'>('all');
  const [displayCount, setDisplayCount] = useState(20);
  const scrollSentinelRef = useRef<HTMLDivElement>(null);

  const handleView = (artifactId: string) => {
    setActiveArtifactId(artifactId);
    setRightPanelView('artifact');
  };

  const handleOpenInChat = (chatId: string) => {
    navigateToChat(chatId);
  };

  const typeLabels: Record<string, string> = {
    'markdown': 'Markdown',
    'html': 'HTML',
    'pptx-outline': 'PPTX Outline',
  };

  const filtered = allArtifacts
    .filter(a => !artifactSearch || a.name.toLowerCase().includes(artifactSearch.toLowerCase()))
    .filter(a => {
      if (contextFilter === 'general-chat') {
        const space = spaces.find(s => s.id === a.spaceId);
        return space?.isDefault;
      }
      if (contextFilter === 'projects') {
        const space = spaces.find(s => s.id === a.spaceId);
        return !space?.isDefault;
      }
      return true;
    })
    .sort((a, b) => {
      const mul = sortAsc ? 1 : -1;
      if (sortField === 'name') return mul * a.name.localeCompare(b.name);
      if (sortField === 'type') return mul * a.artifactType.localeCompare(b.artifactType);
      if (sortField === 'source') {
        const sa = spaces.find(s => s.id === a.spaceId)?.name || '';
        const sb = spaces.find(s => s.id === b.spaceId)?.name || '';
        return mul * sa.localeCompare(sb);
      }
      return mul * (a.timestamp.getTime() - b.timestamp.getTime());
    });

  const paginated = filtered.slice(0, displayCount);

  // Infinite scroll
  useEffect(() => {
    if (!scrollSentinelRef.current || filtered.length <= displayCount) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setDisplayCount(prev => prev + 20);
    }, { threshold: 0.1 });
    observer.observe(scrollSentinelRef.current);
    return () => observer.disconnect();
  }, [filtered.length, displayCount]);

  const totalArtifacts = allArtifacts.length;
  const isFiltered = artifactSearch || contextFilter !== 'all';

  return (
    <div className="w-full p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">Artifacts</h2>
          <p className="text-sm text-muted-foreground mt-1">All artifacts across your projects.</p>
        </div>

        {/* Search bar — full width */}
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={artifactSearch}
            onChange={e => { setArtifactSearch(e.target.value); setDisplayCount(20); }}
            placeholder="Search artifacts..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Filters row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {([{ key: 'all', label: 'All' }, { key: 'general-chat', label: 'General Chat' }, { key: 'projects', label: 'Projects' }] as const).map(f => (
              <button key={f.key} onClick={() => { setContextFilter(f.key as any); setDisplayCount(20); }}
                className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors",
                  contextFilter === f.key ? "bg-accent text-foreground font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}>
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {isFiltered ? `Showing ${filtered.length} of ${totalArtifacts} artifacts` : `${totalArtifacts} artifacts`}
          </span>
        </div>

        {/* Sort headers — aligned to row layout */}
        <div className="flex items-center gap-4 px-4">
          <button
            onClick={() => { setSortField('name'); setSortAsc(sortField === 'name' ? !sortAsc : true); }}
            className="flex-1 text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors select-none flex items-center gap-1 text-left uppercase tracking-wide"
          >
            Name {sortField === 'name' && <span className="text-foreground">{sortAsc ? '↑' : '↓'}</span>}
          </button>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { setSortField('type'); setSortAsc(sortField === 'type' ? !sortAsc : true); }}
              className="text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors select-none flex items-center gap-1 w-24 uppercase tracking-wide"
            >
              Type {sortField === 'type' && <span className="text-foreground">{sortAsc ? '↑' : '↓'}</span>}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No artifacts found.</p>
            <p className="text-xs text-muted-foreground mt-1">Generate artifacts by chatting with an agent.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {paginated.map(a => {
              const space = spaces.find(s => s.id === a.spaceId);
              const chat = chats.find(c => c.id === a.chatId);
              const spaceName = space?.isDefault ? 'General Chat' : space?.name || '—';
              const chatName = chat?.name || '—';
              const dotColor = a.artifactType === 'markdown' ? 'bg-primary' : a.artifactType === 'html' ? 'bg-orange-400' : 'bg-purple-400';
              return (
                <button
                  key={a.id}
                  onClick={() => handleView(a.id)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{a.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{spaceName} <span className="text-muted-foreground/50">›</span> {chatName}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
                      <span className="text-xs text-muted-foreground">{typeLabels[a.artifactType] || a.artifactType}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span onClick={(e) => { e.stopPropagation(); handleOpenInChat(a.chatId); }} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Open in Chat"><MessageSquare className="w-3.5 h-3.5" /></span>
                      <span onClick={(e) => e.stopPropagation()} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Download"><Download className="w-3.5 h-3.5" /></span>
                    </div>
                  </div>
                </button>
              );
            })}
            {/* Infinite scroll sentinel */}
            {filtered.length > displayCount && <div ref={scrollSentinelRef} className="h-4" />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Space Workspace ─────────────────────────────────────────

function SpaceWorkspaceView() {
  const {
    spaces, activeSpaceId, chats, artifacts,
    setActiveChatId, setCenterView, createChat, renameChat, renameSpace, updateSpace,
    setActiveArtifactId, setRightPanelView, openFilesPanel,
  } = useArgo();

  const space = spaces.find(s => s.id === activeSpaceId);
  const spaceChats = chats.filter(c => c.spaceId === activeSpaceId);
  const spaceArtifacts = artifacts.filter(a => a.spaceId === activeSpaceId);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editContext, setEditContext] = useState('');
  const [chatDisplayCount, setChatDisplayCount] = useState(20);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const chatSentinelRef = useRef<HTMLDivElement>(null);
  const [shareSearch, setShareSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const isShared = space?.visibility === 'shared';
  const isOwner = space?.owner === 'You';

  const shareMembers = [
    { name: 'John Smith', role: 'Pre-Sales Team', selected: false },
    { name: 'Sarah Lee', role: 'Delivery Manager', selected: true },
    { name: 'James Wilson', role: 'Pre-Sales Admin', selected: true },
    { name: 'Alex Thompson', role: 'Admin', selected: false },
  ];

  const filteredMembers = shareSearch
    ? shareMembers.filter(m => m.name.toLowerCase().includes(shareSearch.toLowerCase()))
    : shareMembers;

  // Infinite scroll for chats
  useEffect(() => {
    if (!chatSentinelRef.current || spaceChats.length <= chatDisplayCount) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setChatDisplayCount(prev => prev + 20);
    }, { threshold: 0.1 });
    observer.observe(chatSentinelRef.current);
    return () => observer.disconnect();
  }, [spaceChats.length, chatDisplayCount]);

  if (!space) return null;

  const handleOpenChat = (chatId: string) => {
    setActiveChatId(chatId);
    setCenterView('chat');
  };

  return (
    <div className="w-full p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-6">

      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          {editing ? (
            <div className="space-y-3 w-full">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Project name"
                  className="w-full text-sm text-foreground bg-background border border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Description</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  placeholder="Brief description of this project…"
                  rows={2}
                  className="w-full text-sm text-foreground bg-background border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="text-[10px] text-muted-foreground mt-1">This description is visible to project members.</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Context <span className="text-muted-foreground/60">(optional)</span></label>
                <textarea
                  value={editContext}
                  onChange={e => setEditContext(e.target.value)}
                  placeholder="Add context about this project to help Argo understand its purpose…"
                  rows={4}
                  className="w-full text-sm text-foreground bg-background border border-border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="text-[10px] text-muted-foreground mt-1">This helps Argo understand the purpose of the project and tailor responses.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    updateSpace(activeSpaceId, {
                      name: editName.trim() || space.name,
                      description: editDescription.trim(),
                      projectContext: editContext.trim(),
                    });
                    setEditing(false);
                  }}
                  className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground tracking-tight">{space.name}</h1>
                <span className="text-sm text-muted-foreground">•</span>
                {isShared ? <Globe className="w-3.5 h-3.5 text-muted-foreground" /> : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                {isOwner && !space.isDefault && (
                  <button onClick={() => { setEditName(space.name); setEditDescription(space.description || ''); setEditContext(space.projectContext || ''); setEditing(true); }} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Edit project">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {isShared && space.sharedBy && (
                <p className="text-xs text-muted-foreground mt-1">Shared by {space.sharedBy}</p>
              )}
              {space.description && <p className="text-sm text-muted-foreground mt-1">{space.description}</p>}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOwner && !space.isDefault && (
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
              {showShareMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => { setShowShareMenu(false); setShareSearch(''); }} />
                  <div className="absolute right-0 top-full mt-1 w-80 bg-popover border border-border rounded-lg shadow-lg z-20 p-3 space-y-3 animate-scale-in">
                    <div>
                      <div className="text-xs font-semibold text-foreground mb-1.5">Share via Link</div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-2.5 py-1.5 bg-secondary/50 border border-border rounded-md text-xs text-muted-foreground font-mono truncate select-all">
                          https://argo.app/project/{space?.id || 'project-1'}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(`https://argo.app/project/${space?.id || 'project-1'}`);
                          }}
                          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                          title="Copy link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">Anyone with this link must log in to view the project.</p>
                    </div>
                    <div className="border-t border-border" />
                    <div className="text-xs font-semibold text-foreground mb-2">Share with members</div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg mb-2">
                      <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <input
                        value={shareSearch}
                        onChange={e => setShareSearch(e.target.value)}
                        placeholder="Search by name..."
                        className="flex-1 text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                      />
                    </div>
                    {filteredMembers.map(m => (
                      <label key={m.name} className="flex items-center gap-2 text-sm text-foreground cursor-pointer py-1">
                        <input type="checkbox" defaultChecked={m.selected} className="rounded border-border" />
                        <span className="flex-1">{m.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{m.role}</span>
                      </label>
                    ))}
                    <button className="w-full mt-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">Update Sharing</button>
                  </div>
                </>
              )}
            </div>
          )}
          {!space.isDefault && (
            <button
              onClick={() => openFilesPanel(activeSpaceId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Files
            </button>
          )}
          <button
            onClick={() => createChat('New Chat', activeSpaceId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Chats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground">{spaceChats.length} chats</span>
        </div>


        {spaceChats.length === 0 ? (
          <div className="text-center py-8 animate-fade-in">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No chats yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Create one to get started with this project.</p>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {spaceChats
                .filter(c => !chatSearch || c.name.toLowerCase().includes(chatSearch.toLowerCase()))
                .slice(0, chatDisplayCount).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group" onClick={() => handleOpenChat(c.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChatMoreMenu chatId={c.id} chatName={c.name} renameChat={renameChat} />
                  </div>
                </div>
              ))}
            </div>
            {/* Infinite scroll sentinel */}
            {spaceChats.length > chatDisplayCount && <div ref={chatSentinelRef} className="h-4" />}
          </>
        )}
      </div>
      </div>
    </div>
  );
}


// ─── Create Project View (Join + Create) ─────────────────────

function CreateSpaceView() {
  const { createSpace, setCenterView } = useArgo();

  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectContext, setProjectContext] = useState('');
  const [showContextExamples, setShowContextExamples] = useState(false);
  const [shareable, setShareable] = useState(false);
  const [shareSearch, setShareSearch] = useState('');

  const shareMembers = [
    { name: 'John Smith', role: 'Pre-Sales Team', selected: false },
    { name: 'Sarah Lee', role: 'Delivery Manager', selected: false },
    { name: 'James Wilson', role: 'Pre-Sales Admin', selected: false },
    { name: 'Alex Thompson', role: 'Admin', selected: false },
  ];

  const filteredMembers = shareSearch
    ? shareMembers.filter(m => m.name.toLowerCase().includes(shareSearch.toLowerCase()))
    : shareMembers;

  const handleJoin = () => {
    if (!joinCode.trim()) {
      setJoinError('Please enter a project link or access code.');
      return;
    }
    const isValid = joinCode.includes('argo.app/project/') || joinCode.length >= 8;
    if (!isValid) {
      setJoinError('Invalid project link or access code. Please check and try again.');
    } else {
      setJoinError('');
      setCenterView('projects');
    }
  };

  const handleCreate = () => {
    if (name.trim()) {
      createSpace(name.trim(), description.trim() || undefined, projectContext.trim() || undefined);
    }
  };

  const handleCancel = () => {
    setCenterView('projects');
  };

  return (
    <div className="w-full p-6 space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Create Project</h1>
        <p className="text-sm text-muted-foreground mt-1">Join an existing project or create a new one.</p>
      </div>

      {/* ── Section 1: Join a Project ── */}
      <div className="p-5 rounded-lg border border-border bg-secondary/10 space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Join a Project</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Paste a shared project link or access code to join.</p>
        </div>
        <div>
          <input
            value={joinCode}
            onChange={e => { setJoinCode(e.target.value); setJoinError(''); }}
            placeholder="Enter project access code or link"
            className={cn("w-full text-sm bg-background border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring", joinError ? "border-destructive" : "border-border")}
          />
          <p className="text-[10px] text-muted-foreground mt-1">Anyone using this link must log in to Argo to access the project.</p>
          {joinError && (
            <div className="flex items-center gap-1.5 mt-1.5 animate-fade-in">
              <AlertCircle className="w-3 h-3 text-destructive shrink-0" />
              <p className="text-xs text-destructive">{joinError}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleJoin}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Join
        </button>
      </div>

      {/* Visual separator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs text-muted-foreground font-medium">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* ── Section 2: Create a New Project ── */}
      <div className="p-5 rounded-lg border border-border bg-secondary/10 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Create a New Project</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Set up a new project with its own chats, files, and AI context.</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Client Name — Q1 Proposal"
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this project…"
              rows={3}
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground mt-1">This description is visible to project members.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Project Context <span className="text-muted-foreground/60">(optional)</span></label>
            <textarea
              value={projectContext}
              onChange={e => setProjectContext(e.target.value)}
              placeholder="Add context about this project…"
              rows={5}
              className="w-full text-sm bg-background border border-border rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground mt-1">This helps Argo understand the purpose of the project.</p>
            <button
              type="button"
              onClick={() => setShowContextExamples(!showContextExamples)}
              className="text-xs text-primary hover:underline mt-1.5 flex items-center gap-1 font-medium"
            >
              {showContextExamples ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              See examples
            </button>
            {showContextExamples && (
              <div className="mt-2 p-3 rounded-md bg-secondary/30 border border-border text-xs text-muted-foreground space-y-3 animate-fade-in">
                <div>
                  <p className="font-semibold text-foreground/80 mb-1">Client project</p>
                  <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed">{'Client:\nIndustry:\nGoal:\nNotes:'}</pre>
                </div>
                <div className="border-t border-border pt-2">
                  <p className="font-semibold text-foreground/80 mb-1">Task or automation workspace</p>
                  <pre className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed">{'Task:\nGoal:\nWorkflow:\nNotes:'}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Share Toggle */}
          <div className="border-t border-border pt-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={shareable}
                onClick={() => setShareable(!shareable)}
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                  shareable ? "bg-primary" : "bg-secondary"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                  shareable ? "translate-x-4" : "translate-x-0"
                )} />
              </button>
              <span className="text-sm font-medium text-foreground">Make this project shareable</span>
            </label>
          </div>

          {shareable && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-secondary/20 animate-fade-in">
              <div>
                <div className="text-xs font-semibold text-foreground mb-1.5">Share via Link</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-2.5 py-1.5 bg-secondary/50 border border-border rounded-md text-xs text-muted-foreground font-mono truncate">
                    https://argo.app/project/new-project
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText('https://argo.app/project/new-project')}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Copy link"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Anyone with this link must log in to view the project.</p>
              </div>

              <div className="border-t border-border" />

              <div>
                <div className="text-xs font-semibold text-foreground mb-2">Share with Members</div>
                <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg mb-2">
                  <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <input
                    value={shareSearch}
                    onChange={e => setShareSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="flex-1 text-xs bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  {filteredMembers.map(m => (
                    <label key={m.name} className="flex items-center gap-2 text-sm text-foreground cursor-pointer py-1">
                      <input type="checkbox" defaultChecked={m.selected} className="rounded border-border" />
                      <span className="flex-1">{m.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{m.role}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
              name.trim()
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
          >
            Create Project
          </button>
          <button onClick={handleCancel} className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Chat View ───────────────────────────────────────────────

function ChatView() {
  const {
    activeChat, selectedAgent, artifacts,
    sendMessage, isTyping, setActiveArtifactId, setRightPanelView,
    activeSpaceId, spaces,
  } = useArgo();

  const activeSpace = spaces.find(s => s.id === activeSpaceId);

  const [input, setInput] = useState('');
  const [showPlus, setShowPlus] = useState(false);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackComment, setFeedbackComment] = useState<Record<string, string>>({});
  const [showFeedbackInput, setShowFeedbackInput] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    setSendError(null);
    try {
      sendMessage(input.trim());
      setInput('');
      if (inputRef.current) inputRef.current.style.height = 'auto';
    } catch {
      setSendError('Failed to send message. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const handleThumbsUp = (msgId: string) => {
    setFeedbackState(prev => ({ ...prev, [msgId]: 'up' }));
    setShowFeedbackInput(null);
  };

  const handleThumbsDown = (msgId: string) => {
    setFeedbackState(prev => ({ ...prev, [msgId]: 'down' }));
    setShowFeedbackInput(msgId);
  };

  const handleCapabilityClick = (capName: string) => {
    const prompts: Record<string, string> = {
      'General Assistance': 'Help me with a task',
      'Generate Proposal Outline': 'Generate a proposal outline for Client X in retail analytics',
      'Draft SOW': 'Draft a statement of work for an analytics platform implementation',
      'Create Executive Summary': 'Create an executive summary for our latest engagement',
      'Generate Company Comparison': 'Compare Shopify, BigCommerce, and WooCommerce',
    };
    setInput(prompts[capName] || `Help me with: ${capName}`);
    inputRef.current?.focus();
  };

  // Capability icons
  const capabilityIcons: Record<string, typeof FileSignature> = {
    'General Assistance': Bot,
    'Generate Proposal Outline': FileSignature,
    'Draft SOW': ScrollText,
    'Create Executive Summary': FileText,
    'Generate Company Comparison': Table2,
  };

  const isEmpty = (!activeChat || activeChat.messages.length === 0) && !isTyping;

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Project Context Header */}
      {activeChat && activeSpace && !activeSpace.isDefault && (
        <div className="border-b border-border px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs text-muted-foreground mb-0.5 flex items-center gap-1.5">
              <span>Project: {activeSpace.name}</span>
              {activeSpace.visibility === 'shared' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </div>
            <div className="text-sm font-semibold text-foreground">{activeChat.name}</div>
          </div>
        </div>
      )}
      {/* Messages */}
      <div className={cn("flex-1 overflow-y-auto argo-scrollbar", isEmpty && "flex flex-col")}>
        <div className={cn("max-w-4xl mx-auto px-4 py-6", isEmpty && "flex-1 flex flex-col")}>
          {/* ═══ Welcome Empty State — centred input ═══ */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
              <div className="w-full max-w-xl">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">Hello, Pranav.</h2>
                  <p className="text-sm text-muted-foreground">What would you like to work on today?</p>
                </div>
                {/* Centred input */}
                <div className="mb-5">
                  <div className="flex items-end gap-2 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all shadow-sm">
                    <DropdownMenu open={showPlus} onOpenChange={setShowPlus}>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                          <Plus className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="top" align="start" className="w-44">
                        <DropdownMenuItem onClick={() => setShowPlus(false)}>
                          <Globe className="w-3.5 h-3.5 mr-2" />
                          Web Search
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowPlus(false)}>
                          <Brain className="w-3.5 h-3.5 mr-2" />
                          Reasoning
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowPlus(false)}>
                          <Paperclip className="w-3.5 h-3.5 mr-2" />
                          Attach File
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <textarea ref={inputRef} value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown} placeholder="Ask anything…" rows={1} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-[160px] py-0.5" />
                    <button onClick={handleSend} disabled={!input.trim() || isTyping} className={cn("p-1.5 rounded-lg transition-colors", input.trim() && !isTyping ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground")}>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {/* Suggestion cards — 4 in one row */}
                <div className="grid grid-cols-4 gap-3">
                  {selectedAgent?.capabilities.slice(0, 4).map(c => {
                    const IconComp = capabilityIcons[c.name] || Bot;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleCapabilityClick(c.name)}
                        className="p-3 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 text-left transition-all group"
                      >
                        <IconComp className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-xs font-semibold text-foreground leading-snug">{c.name}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeChat?.messages.map((msg, idx) => (
            <div key={msg.id} className="mb-6 animate-fade-in" style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}>
              <div className="flex gap-3">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5", msg.role === 'user' ? "bg-foreground" : "bg-secondary border border-border")}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-background" /> : <Bot className="w-3.5 h-3.5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground mb-1">{msg.role === 'user' ? 'You' : msg.agentName || 'Argo'}</div>
                  <div className="text-sm text-foreground leading-[1.7] whitespace-pre-wrap">
                    {msg.content.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
                      if (part.startsWith('*') && part.endsWith('*')) return <em key={i} className="text-muted-foreground">{part.slice(1, -1)}</em>;
                      return <span key={i}>{part}</span>;
                    })}
                  </div>
                  {msg.artifactId && (() => {
                    const artTypeLabels: Record<string, string> = { 'markdown': 'Markdown', 'html': 'HTML', 'pptx-outline': 'PPTX Outline' };
                    const linkedArtifact = artifacts.find(a => a.id === msg.artifactId);
                    const artName = linkedArtifact?.name || 'Artifact';
                    const artType = linkedArtifact ? (artTypeLabels[linkedArtifact.artifactType] || linkedArtifact.artifactType) : '';
                    return (
                      <button onClick={() => { setActiveArtifactId(msg.artifactId!); setRightPanelView('artifact'); }} className="flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-xs text-foreground hover:bg-primary/10 transition-colors group">
                        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate font-medium">{artName}</span>
                        {artType && <span className="text-muted-foreground shrink-0">({artType})</span>}
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </button>
                    );
                  })()}
                  {msg.role === 'assistant' && (
                    <div className="mt-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleThumbsUp(msg.id)}
                          className={cn(
                            "p-1 rounded hover:bg-accent transition-colors",
                            feedbackState[msg.id] === 'up' ? "text-success" : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Good response"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleThumbsDown(msg.id)}
                          className={cn(
                            "p-1 rounded hover:bg-accent transition-colors",
                            feedbackState[msg.id] === 'down' ? "text-destructive" : "text-muted-foreground hover:text-foreground"
                          )}
                          title="Poor response"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {showFeedbackInput === msg.id && feedbackState[msg.id] === 'down' && (
                        <div className="mt-2 flex gap-2 max-w-md animate-fade-in">
                          <input
                            value={feedbackComment[msg.id] || ''}
                            onChange={e => setFeedbackComment(prev => ({ ...prev, [msg.id]: e.target.value }))}
                            placeholder="What went wrong?"
                            className="flex-1 text-xs bg-background border border-border rounded-md px-2.5 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                          <button
                            onClick={() => setShowFeedbackInput(null)}
                            className="px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="mb-6 animate-fade-in">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-secondary border border-border">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-foreground mb-1">{selectedAgent?.name}</div>
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error state */}
      {sendError && (
        <div className="px-4 animate-fade-in">
          <div className="max-w-4xl mx-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{sendError}</span>
            <button onClick={() => setSendError(null)} className="ml-auto p-0.5 rounded hover:bg-destructive/20 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input — only shown when conversation has started */}
      {!isEmpty && (
        <div className="border-t border-border px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-secondary/50 border border-border rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all">
              <DropdownMenu open={showPlus} onOpenChange={setShowPlus}>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="start" className="w-44">
                  <DropdownMenuItem onClick={() => setShowPlus(false)}>
                    <Globe className="w-3.5 h-3.5 mr-2" />
                    Web Search
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPlus(false)}>
                    <Brain className="w-3.5 h-3.5 mr-2" />
                    Reasoning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowPlus(false)}>
                    <Paperclip className="w-3.5 h-3.5 mr-2" />
                    Attach File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <textarea ref={inputRef} value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown} placeholder="Ask anything…" rows={1} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-[160px] py-0.5" />
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className={cn("p-1.5 rounded-lg transition-colors", input.trim() && !isTyping ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground")}>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Workspace Dashboard ─────────────────────────────────────

function WorkspaceDashboard() {
  const { spaces, openSpaceWorkspace, setCenterView } = useArgo();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'private' | 'shared'>('all');
  const [projectDisplayCount, setProjectDisplayCount] = useState(20);
  const projectSentinelRef = useRef<HTMLDivElement>(null);

  const otherProjects = spaces.filter(s => !s.isDefault);

  const filtered = otherProjects
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => {
      if (filter === 'private') return s.visibility === 'private';
      if (filter === 'shared') return s.visibility === 'shared';
      return true;
    });

  const filterLabels: Record<string, string> = {
    all: 'All',
    shared: 'Shared',
    private: 'Private',
  };

  // Infinite scroll
  useEffect(() => {
    if (!projectSentinelRef.current || filtered.length <= projectDisplayCount) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setProjectDisplayCount(prev => prev + 20);
    }, { threshold: 0.1 });
    observer.observe(projectSentinelRef.current);
    return () => observer.disconnect();
  }, [filtered.length, projectDisplayCount]);

  const [sortField, setSortField] = useState<'name' | 'owner' | 'date'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const totalProjects = otherProjects.length;
  const isFiltered = search || filter !== 'all';

  const sorted = [...filtered].sort((a, b) => {
    const mul = sortAsc ? 1 : -1;
    if (sortField === 'name') return mul * a.name.localeCompare(b.name);
    if (sortField === 'owner') return mul * (a.owner || '').localeCompare(b.owner || '');
    return mul * (a.createdAt.getTime() - b.createdAt.getTime());
  });

  const paginated = sorted.slice(0, projectDisplayCount);

  return (
    <div className="w-full p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground tracking-tight">Projects</h2>
            <p className="text-sm text-muted-foreground mt-1">All projects assigned to you.</p>
          </div>
          <button
            onClick={() => setCenterView('new-space')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Project
          </button>
        </div>

        {/* Search bar — full width */}
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setProjectDisplayCount(20); }}
            placeholder="Search projects..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Filters + Create + Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {(['all', 'private', 'shared'] as const).map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setProjectDisplayCount(20); }}
                className={cn("px-3 py-1.5 rounded-lg text-sm transition-colors",
                  filter === f
                    ? "bg-accent text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {filterLabels[f]}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">
            {isFiltered ? `Showing ${filtered.length} of ${totalProjects} projects` : `${totalProjects} projects`}
          </span>
        </div>

        {/* Sortable headers — aligned to row layout */}
        <div className="flex items-center gap-4 px-4">
          <button
            onClick={() => { setSortField('name'); setSortAsc(sortField === 'name' ? !sortAsc : true); }}
            className="flex-1 text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors select-none flex items-center gap-1 text-left uppercase tracking-wide"
          >
            Name {sortField === 'name' && <span className="text-foreground">{sortAsc ? '↑' : '↓'}</span>}
          </button>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { setSortField('owner'); setSortAsc(sortField === 'owner' ? !sortAsc : true); }}
              className="text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors select-none flex items-center gap-1 w-16 justify-end uppercase tracking-wide"
            >
              Owner {sortField === 'owner' && <span className="text-foreground">{sortAsc ? '↑' : '↓'}</span>}
            </button>
            <button
              onClick={() => { setSortField('date'); setSortAsc(sortField === 'date' ? !sortAsc : true); }}
              className="text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors select-none flex items-center gap-1 w-16 justify-end uppercase tracking-wide"
            >
              Date {sortField === 'date' && <span className="text-foreground">{sortAsc ? '↑' : '↓'}</span>}
            </button>
          </div>
        </div>

        {paginated.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <FolderOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">No projects found.</p>
            <p className="text-xs text-muted-foreground mt-1">Create your first project to get started.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {paginated.map(s => (
              <button
                key={s.id}
                onClick={() => openSpaceWorkspace(s.id)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-accent/50 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate block">{s.name}</span>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{s.description || 'No description'}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center justify-end gap-1.5 w-20">
                    {s.visibility === 'shared'
                      ? <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                      : <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                    <span className="text-xs text-muted-foreground">{s.owner}</span>
                  </div>
                  <span className="text-xs text-muted-foreground w-16 text-right">{s.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </button>
            ))}
            {/* Infinite scroll sentinel */}
            {sorted.length > projectDisplayCount && <div ref={projectSentinelRef} className="h-4" />}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main CenterPanel ────────────────────────────────────────

function CollapsedTopBar() {
  return null;
}

export function CenterPanel() {
  const { centerView, adminTab, sidebarCollapsed } = useArgo();

  const wrap = (children: React.ReactNode) => (
    <div className="flex-1 flex flex-col h-screen bg-background min-w-0 overflow-y-auto argo-scrollbar">
      <CollapsedTopBar />
      {children}
    </div>
  );

  if (centerView === 'config') return wrap(<ConfigView tab={adminTab} />);
  if (centerView === 'artifacts-table') return wrap(<ArtifactsTable />);
  if (centerView === 'new-space') return wrap(<CreateSpaceView />);
  if (centerView === 'projects') return wrap(<WorkspaceDashboard />);
  if (centerView === 'space-workspace') return wrap(<SpaceWorkspaceView />);

  // ChatView has its own header — don't double-wrap
  return (
    <div className="flex-1 flex flex-col h-screen bg-background min-w-0">
      <CollapsedTopBar />
      <ChatView />
    </div>
  );
}
