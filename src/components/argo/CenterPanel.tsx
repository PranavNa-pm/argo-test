import { useState, useRef, useEffect } from 'react';
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
          <h2 className="text-lg font-bold text-foreground">Agent Configuration</h2>
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

        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg max-w-md">
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
            <h3 className="text-sm font-bold text-foreground">{editingAgentId ? 'Edit Agent' : 'Create New Agent'}</h3>
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
            <h2 className="text-lg font-bold text-foreground">Prompt Manager</h2>
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

        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg max-w-md">
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
            <h3 className="text-sm font-bold text-foreground">Create New Prompt</h3>
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
            <h2 className="text-lg font-bold text-foreground">Group Permissions</h2>
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
                  <td className="px-4 py-3 font-semibold text-foreground">{g.name}</td>
                  <td className="px-4 py-3">
                    <UsersMappedCell count={mapped.count} users={mapped.users} />
                  </td>
                  <td className="px-4 py-3 space-y-2.5">
                    <div>
                      <span className="text-xs font-bold text-foreground">Assigned Agents:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {g.agents.map(a => (
                          <span key={a} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">{a}</span>
                        ))}
                      </div>
                    </div>
                    {g.canShare && (
                      <div>
                        <span className="text-xs font-bold text-foreground">Project Sharing:</span>
                        <div className="mt-1">
                          <span className="px-2 py-0.5 rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">Can Share</span>
                        </div>
                      </div>
                    )}
                    {g.rights.length > 0 && (
                      <div>
                        <span className="text-xs font-bold text-foreground">Management Rights:</span>
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
  const [sortAsc, setSortAsc] = useState(false);
  const [contextFilter, setContextFilter] = useState<'all' | 'general-chat' | 'projects'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const handleView = (artifactId: string) => {
    setActiveArtifactId(artifactId);
    setRightPanelView('artifact');
  };

  const handleOpenInChat = (chatId: string) => {
    navigateToChat(chatId);
  };

  const artifactTypes = Array.from(new Set(allArtifacts.map(a => a.artifactType)));
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
    .filter(a => typeFilter === 'all' || a.artifactType === typeFilter)
    .sort((a, b) => {
      const mul = sortAsc ? 1 : -1;
      return mul * (a.timestamp.getTime() - b.timestamp.getTime());
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="w-full p-6 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Artifact Library</h2>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg max-w-md flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={artifactSearch}
            onChange={e => { setArtifactSearch(e.target.value); setPage(1); }}
            placeholder="Search by title..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Context Filter - Radix */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              {contextFilter === 'all' ? 'All Projects' : contextFilter === 'general-chat' ? 'General Chat' : 'Projects'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {[{ key: 'all', label: 'All Projects' }, { key: 'general-chat', label: 'General Chat' }, { key: 'projects', label: 'Projects' }].map(f => (
              <DropdownMenuItem key={f.key} onClick={() => { setContextFilter(f.key as any); setPage(1); }} className={cn(contextFilter === f.key && "bg-accent font-semibold")}>{f.label}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Type Filter - Radix */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              {typeFilter === 'all' ? 'All Types' : typeLabels[typeFilter] || typeFilter}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setTypeFilter('all'); setPage(1); }} className={cn(typeFilter === 'all' && "bg-accent font-semibold")}>All Types</DropdownMenuItem>
            {artifactTypes.map(t => (
              <DropdownMenuItem key={t} onClick={() => { setTypeFilter(t); setPage(1); }} className={cn(typeFilter === t && "bg-accent font-semibold")}>{typeLabels[t] || t}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={() => setSortAsc(!sortAsc)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          Date {sortAsc ? '↑' : '↓'}
        </button>
      </div>

      <span className="text-sm text-muted-foreground">{filtered.length} artifact{filtered.length !== 1 ? 's' : ''} found</span>

      {filtered.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No artifacts found.</p>
          <p className="text-xs text-muted-foreground mt-1">Generate artifacts by chatting with an agent.</p>
        </div>
      ) : (
        <>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-secondary border-b border-border">
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Artifact Title</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Project</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">Type</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-20">Version</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-28">Date Created</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(a => {
                  const space = spaces.find(s => s.id === a.spaceId);
                  const chat = chats.find(c => c.id === a.chatId);
                  const dateStr = a.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
                  const titleDisplay = `${typeLabels[a.artifactType] || a.artifactType}: ${a.name} – ${dateStr}`;
                  return (
                    <tr key={a.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => handleView(a.id)} className="text-left font-semibold text-foreground hover:text-primary transition-colors">
                          {titleDisplay}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{space?.isDefault ? 'General Chat' : space?.name || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-secondary-foreground">{typeLabels[a.artifactType] || a.artifactType}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">v{a.version}</td>
                      <td className="px-4 py-3 text-muted-foreground">{dateStr}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleView(a.id)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleOpenInChat(a.chatId)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Open in Chat"><MessageSquare className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Download"><Download className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} artifacts
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors">Previous</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={cn("w-7 h-7 rounded text-xs font-semibold transition-colors", p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>{p}</button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2.5 py-1 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Space Workspace ─────────────────────────────────────────

function SpaceWorkspaceView() {
  const {
    spaces, activeSpaceId, chats, artifacts,
    setActiveChatId, setCenterView, createChat, renameChat, renameSpace,
    setActiveArtifactId, setRightPanelView, openFilesPanel,
  } = useArgo();

  const space = spaces.find(s => s.id === activeSpaceId);
  const spaceChats = chats.filter(c => c.spaceId === activeSpaceId);
  const spaceArtifacts = artifacts.filter(a => a.spaceId === activeSpaceId);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [chatPage, setChatPage] = useState(1);
  const CHAT_PAGE_SIZE = 10;
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [shareSearch, setShareSearch] = useState('');
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

  if (!space) return null;

  const handleOpenChat = (chatId: string) => {
    setActiveChatId(chatId);
    setCenterView('chat');
  };

  return (
    <div className="w-full p-6 space-y-6 animate-fade-in">

      {/* Project Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            {editing ? (
              <input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') { renameSpace(activeSpaceId, editName.trim() || space.name); setEditing(false); }
                  if (e.key === 'Escape') setEditing(false);
                }}
                onBlur={() => { renameSpace(activeSpaceId, editName.trim() || space.name); setEditing(false); }}
                className="text-xl font-bold text-foreground bg-background border border-border rounded-md px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
                autoFocus
              />
            ) : (
              <h1 className="text-xl font-bold text-foreground">{space.name}</h1>
            )}
            <span className="text-sm text-muted-foreground">•</span>
            <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", isShared ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")}>{isShared ? 'Shared' : 'Private'}</span>
            {isOwner && !space.isDefault && (
              <button onClick={() => { setEditName(space.name); setEditing(!editing); }} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Edit project">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {isShared && space.sharedBy && (
            <p className="text-xs text-muted-foreground mt-1">Shared by {space.sharedBy}</p>
          )}
          {space.description && <p className="text-sm text-muted-foreground mt-1">{space.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {!space.isDefault && (
            <button
              onClick={() => openFilesPanel(activeSpaceId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              Files
            </button>
          )}
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
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-background border border-border rounded-md mb-2">
                      <Search className="w-3 h-3 text-muted-foreground shrink-0" />
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
        </div>
      </div>

      {/* Chats */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Chats ({spaceChats.length})</h3>
          <button
            onClick={() => createChat('New Chat', activeSpaceId)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <SquarePen className="w-3.5 h-3.5" />
            New Chat
          </button>
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
              {spaceChats.slice((chatPage - 1) * CHAT_PAGE_SIZE, chatPage * CHAT_PAGE_SIZE).map(c => (
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
            {spaceChats.length > CHAT_PAGE_SIZE && (() => {
              const totalChatPages = Math.ceil(spaceChats.length / CHAT_PAGE_SIZE);
              return (
                <div className="flex items-center justify-between pt-3">
                  <p className="text-xs text-muted-foreground">
                    Showing {(chatPage - 1) * CHAT_PAGE_SIZE + 1}–{Math.min(chatPage * CHAT_PAGE_SIZE, spaceChats.length)} of {spaceChats.length} chats
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setChatPage(p => Math.max(1, p - 1))} disabled={chatPage === 1} className="px-2.5 py-1 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors">Previous</button>
                    {Array.from({ length: totalChatPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setChatPage(p)} className={cn("w-7 h-7 rounded text-xs font-semibold transition-colors", p === chatPage ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>{p}</button>
                    ))}
                    <button onClick={() => setChatPage(p => Math.min(totalChatPages, p + 1))} disabled={chatPage === totalChatPages} className="px-2.5 py-1 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors">Next</button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
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
        <h1 className="text-xl font-bold text-foreground">Create Project</h1>
        <p className="text-sm text-muted-foreground mt-1">Join an existing project or create a new one.</p>
      </div>

      {/* ── Section 1: Join a Project ── */}
      <div className="p-5 rounded-lg border border-border bg-secondary/10 space-y-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Join a Project</h2>
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
          <h2 className="text-sm font-bold text-foreground">Create a New Project</h2>
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
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-background border border-border rounded-md mb-2">
                  <Search className="w-3 h-3 text-muted-foreground shrink-0" />
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

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Project Context Header */}
      {activeChat && activeSpace && !activeSpace.isDefault && (
        <div className="border-b border-border px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="text-xs text-muted-foreground mb-0.5">
              Project: {activeSpace.name} <span className="mx-1">•</span> <span className="text-muted-foreground">{activeSpace.visibility === 'shared' ? 'Shared' : 'Private'}</span>
            </div>
            <div className="text-sm font-semibold text-foreground">{activeChat.name}</div>
          </div>
        </div>
      )}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto argo-scrollbar">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* ═══ Welcome Empty State ═══ */}
          {(!activeChat || activeChat.messages.length === 0) && !isTyping && (
            <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
              <div className="text-center max-w-lg">
                <h2 className="text-2xl font-bold text-foreground mb-1">Hello, Alex.</h2>
                <p className="text-sm text-muted-foreground mb-8">What would you like to work on today?</p>
                <div className="grid grid-cols-2 gap-3">
                  {selectedAgent?.capabilities.map(c => {
                    const IconComp = capabilityIcons[c.name] || Bot;
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleCapabilityClick(c.name)}
                        className="p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 text-left transition-all group"
                      >
                        <IconComp className="w-5 h-5 text-primary mb-2 group-hover:scale-110 transition-transform" />
                        <div className="text-sm font-semibold text-foreground">{c.name}</div>
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</div>
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
                  <div className="text-xs font-bold text-foreground mb-1">{msg.role === 'user' ? 'You' : msg.agentName || 'Argo'}</div>
                  <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
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
                        <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                  <div className="text-xs font-bold text-foreground mb-1">{selectedAgent?.name}</div>
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
          <div className="max-w-3xl mx-auto flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{sendError}</span>
            <button onClick={() => setSendError(null)} className="ml-auto p-0.5 rounded hover:bg-destructive/20 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border px-4 py-3">
        <div className="max-w-3xl mx-auto">
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
    </div>
  );
}

// ─── Workspace Dashboard ─────────────────────────────────────

function WorkspaceDashboard() {
  const { spaces, openSpaceWorkspace, setCenterView } = useArgo();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'private' | 'shared' | 'owned'>('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const otherProjects = spaces.filter(s => !s.isDefault);

  const filtered = otherProjects
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    .filter(s => {
      if (filter === 'private') return s.visibility === 'private';
      if (filter === 'shared') return s.visibility === 'shared';
      if (filter === 'owned') return s.owner === 'You';
      return true;
    });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const filterLabels: Record<string, string> = {
    all: 'All Projects',
    owned: 'Owned by Me',
    shared: 'Shared with Me',
    private: 'Private Only',
  };

  const renderRow = (s: typeof spaces[0]) => (
    <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
      <td className="px-4 py-3 font-semibold text-foreground">
        {s.name}
        {s.isDefault && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">Default</span>}
      </td>
      <td className="px-4 py-3 text-muted-foreground truncate max-w-xs">{s.description || '—'}</td>
      <td className="px-4 py-3 text-muted-foreground">{s.owner}</td>
      <td className="px-4 py-3">
        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", s.visibility === 'shared' ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground")}>
          {s.visibility === 'shared' ? 'Shared' : 'Private'}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => openSpaceWorkspace(s.id)}
          className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          title="Open project"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="w-full p-6 space-y-5 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-foreground">Projects</h2>
        <p className="text-sm text-muted-foreground mt-1">All projects assigned to you.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-secondary/50 border border-border rounded-lg max-w-md flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search projects..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
        {/* Filter Dropdown - Radix */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              {filterLabels[filter]}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(['all', 'private', 'shared', 'owned'] as const).map(f => (
              <DropdownMenuItem key={f} onClick={() => { setFilter(f); setPage(1); }} className={cn(filter === f && "bg-accent font-semibold")}>{filterLabels[f]}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <button
          onClick={() => setCenterView('new-space')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Project
        </button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="bg-secondary border-b border-border">
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Project Name</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Description</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-32">Owner</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-28">Visibility</th>
              <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider w-20">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-16 text-muted-foreground">
                  <FolderOpen className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">No projects found.</p>
                  <p className="text-xs mt-1">Create your first project to get started.</p>
                </td>
              </tr>
            ) : (
              paginated.map(s => renderRow(s))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} projects
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn("w-7 h-7 rounded text-xs font-semibold transition-colors", p === page ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent")}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main CenterPanel ────────────────────────────────────────

export function CenterPanel() {
  const { centerView, adminTab } = useArgo();

  if (centerView === 'config') {
    return (
      <div className="flex-1 flex flex-col h-screen bg-background min-w-0 overflow-y-auto argo-scrollbar">
        <ConfigView tab={adminTab} />
      </div>
    );
  }

  if (centerView === 'artifacts-table') {
    return (
      <div className="flex-1 flex flex-col h-screen bg-background min-w-0 overflow-y-auto argo-scrollbar">
        <ArtifactsTable />
      </div>
    );
  }

  if (centerView === 'new-space') {
    return (
      <div className="flex-1 flex flex-col h-screen bg-background min-w-0 overflow-y-auto argo-scrollbar">
        <CreateSpaceView />
      </div>
    );
  }

  if (centerView === 'projects') {
    return (
      <div className="flex-1 flex flex-col h-screen bg-background min-w-0 overflow-y-auto argo-scrollbar">
        <WorkspaceDashboard />
      </div>
    );
  }

  if (centerView === 'space-workspace') {
    return (
      <div className="flex-1 flex flex-col h-screen bg-background min-w-0 overflow-y-auto argo-scrollbar">
        <SpaceWorkspaceView />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-background min-w-0">
      <ChatView />
    </div>
  );
}
