import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText, Bot, Wrench, X, ChevronDown, ChevronRight,
  Layers, Database, Cpu, DollarSign, Timer, Activity,
  Download, Maximize2, Minimize2, MessageSquare, Upload,
  Eye, Trash2, Search, FolderOpen
} from 'lucide-react';
import { useArgo } from '@/context/ArgoContext';
import type { ExecutionTrace } from '@/types/argo';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ─── Mock Files Data (shared) ────────────────────────────────

export const MOCK_PROJECT_FILES: Record<string, { name: string; type: string; size: string; uploadedBy: string; role: string; date: string }[]> = {
  'space-1': [
    { name: 'Client_Brief_Q1.pdf', type: 'PDF', size: '1.2 MB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Feb 10, 2025' },
    { name: 'Pricing_Sheet_2025.xlsx', type: 'Excel', size: '340 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Feb 12, 2025' },
    { name: 'Technical_Architecture.docx', type: 'Word', size: '2.1 MB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Feb 15, 2025' },
    { name: 'Meeting_Notes_Kickoff.md', type: 'Markdown', size: '18 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Feb 18, 2025' },
    { name: 'Scope_Document_v2.pdf', type: 'PDF', size: '890 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Feb 20, 2025' },
    { name: 'Risk_Assessment.docx', type: 'Word', size: '450 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Feb 22, 2025' },
    { name: 'Timeline_Gantt.xlsx', type: 'Excel', size: '1.8 MB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Feb 25, 2025' },
    { name: 'Stakeholder_Map.pdf', type: 'PDF', size: '620 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Mar 01, 2025' },
    { name: 'Brand_Guidelines.pdf', type: 'PDF', size: '5.4 MB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Mar 03, 2025' },
    { name: 'API_Documentation.md', type: 'Markdown', size: '42 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Mar 05, 2025' },
  ],
  'space-2': [
    { name: 'Competitor_Analysis.pdf', type: 'PDF', size: '3.5 MB', uploadedBy: 'Sarah Chen', role: 'Owner', date: 'Jan 20, 2025' },
    { name: 'Budget_Forecast.xlsx', type: 'Excel', size: '520 KB', uploadedBy: 'Sarah Chen', role: 'Owner', date: 'Jan 25, 2025' },
    { name: 'Market_Research_Q1.pdf', type: 'PDF', size: '2.3 MB', uploadedBy: 'Sarah Chen', role: 'Owner', date: 'Jan 28, 2025' },
    { name: 'Client_Questionnaire.docx', type: 'Word', size: '180 KB', uploadedBy: 'Sarah Chen', role: 'Owner', date: 'Feb 02, 2025' },
    { name: 'Proposal_Template.docx', type: 'Word', size: '290 KB', uploadedBy: 'Sarah Chen', role: 'Owner', date: 'Feb 05, 2025' },
    { name: 'Revenue_Projections.xlsx', type: 'Excel', size: '410 KB', uploadedBy: 'Sarah Chen', role: 'Owner', date: 'Feb 10, 2025' },
  ],
  'space-3': [
    { name: 'Migration_Plan.pdf', type: 'PDF', size: '1.9 MB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Mar 02, 2025' },
    { name: 'Infrastructure_Diagram.png', type: 'Image', size: '780 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Mar 05, 2025' },
    { name: 'Compliance_Checklist.xlsx', type: 'Excel', size: '220 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Mar 08, 2025' },
    { name: 'SLA_Agreement_Draft.pdf', type: 'PDF', size: '560 KB', uploadedBy: 'Alex Thompson', role: 'Owner', date: 'Mar 10, 2025' },
  ],
};

function TracePanel({ trace }: { trace: ExecutionTrace }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/30 transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Activity className="w-3 h-3" />
        Execution Trace
      </button>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            <TraceItem icon={Bot} label="Agent" value={`${trace.agentName} v${trace.agentVersion}`} />
            <TraceItem icon={Layers} label="Capability" value={trace.capability} />
            <TraceItem icon={Cpu} label="Model" value={trace.model} />
            <TraceItem icon={Timer} label="Latency" value={`${trace.latencyMs}ms`} />
            <TraceItem icon={Database} label="Tokens" value={`${trace.tokenUsage.input} in / ${trace.tokenUsage.output} out`} />
            <TraceItem icon={DollarSign} label="Cost" value={trace.costEstimate} />
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Tools Used</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {trace.toolsUsed.map(t => (
                <span key={t} className="px-2 py-0.5 rounded bg-secondary text-xs text-secondary-foreground font-mono">{t}</span>
              ))}
            </div>
          </div>

          {trace.documentsRetrieved.length > 0 && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Documents Retrieved</span>
              <div className="mt-1 space-y-0.5">
                {trace.documentsRetrieved.map(d => (
                  <div key={d} className="flex items-center gap-1.5 text-xs font-mono text-secondary-foreground">
                    <FileText className="w-3 h-3 text-muted-foreground" />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Execution Hierarchy</span>
            <div className="mt-2 pl-1 text-xs font-mono text-secondary-foreground space-y-1">
              <div className="flex items-center gap-1.5">
                <Bot className="w-3 h-3 text-foreground" />
                <span className="text-foreground font-bold">Agent</span>
                <span className="text-muted-foreground">→ {trace.agentName}</span>
              </div>
              <div className="flex items-center gap-1.5 pl-4">
                <Layers className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground font-bold">Capability</span>
                <span className="text-muted-foreground">→ {trace.capability}</span>
              </div>
              <div className="flex items-center gap-1.5 pl-8">
                <Wrench className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground font-bold">Tools</span>
                <span className="text-muted-foreground">→ {trace.toolsUsed.join(', ')}</span>
              </div>
              <div className="flex items-center gap-1.5 pl-12">
                <Database className="w-3 h-3 text-success" />
                <span className="text-foreground font-bold">Data</span>
                <span className="text-muted-foreground">→ {trace.documentsRetrieved.length > 0 ? trace.documentsRetrieved.join(', ') : 'structured output'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TraceItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3 h-3 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{label}</div>
        <div className="text-xs text-foreground font-mono">{value}</div>
      </div>
    </div>
  );
}

const typeLabels: Record<string, string> = {
  'markdown': 'Markdown',
  'html': 'HTML',
  'pptx-outline': 'PPTX Outline',
};

export function RightPanel() {
  const { activeArtifact, spaces, setActiveArtifactId, setRightPanelView, navigateToChat } = useArgo();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<number | null>(null);

  if (!activeArtifact) return null;

  const currentVersion = viewingVersion ?? activeArtifact.version;
  const versionData = activeArtifact.versions?.find(v => v.version === currentVersion);
  const displayContent = versionData?.content ?? activeArtifact.content;
  const displayTimestamp = versionData?.timestamp ?? activeArtifact.timestamp;
  const displayFileSize = versionData?.fileSize ?? activeArtifact.fileSize;

  const space = spaces.find(s => s.id === activeArtifact.spaceId);
  const contextLabel = space?.isDefault ? 'General Chat' : space?.name || '—';

  const handleClose = () => {
    setActiveArtifactId(null);
    setRightPanelView('empty');
    setIsFullscreen(false);
    setViewingVersion(null);
  };

  const handleOpenInChat = () => {
    navigateToChat(activeArtifact.chatId);
  };

  return (
    <div className={cn(
      "h-screen bg-background panel-border-left flex flex-col overflow-hidden animate-slide-in-right",
      isFullscreen ? "fixed inset-0 z-50 w-full" : "w-[480px] min-w-[400px]"
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-bold text-foreground truncate">{activeArtifact.name}</h2>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button onClick={handleClose} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metadata - improved 2-column layout */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div>
            <span className="text-muted-foreground text-[11px]">Type</span>
            <div className="text-foreground font-mono mt-0.5">{typeLabels[activeArtifact.artifactType] || activeArtifact.artifactType}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Project</span>
            <div className="text-foreground mt-0.5">{contextLabel}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">File Size</span>
            <div className="text-foreground font-mono mt-0.5">{displayFileSize}</div>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Last Updated</span>
            <div className="text-foreground font-mono mt-0.5">
              {displayTimestamp.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <div>
            <span className="text-muted-foreground text-[11px]">Version</span>
            <div className="mt-0.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-foreground font-mono hover:text-primary transition-colors">
                    v{currentVersion}
                    {currentVersion === activeArtifact.version && <span className="text-[9px] text-muted-foreground">(current)</span>}
                    {activeArtifact.versions && activeArtifact.versions.length > 1 && <ChevronDown className="w-2.5 h-2.5" />}
                  </button>
                </DropdownMenuTrigger>
                {activeArtifact.versions && activeArtifact.versions.length > 1 && (
                  <DropdownMenuContent align="start" className="w-48">
                    {[...activeArtifact.versions].reverse().map(v => (
                      <DropdownMenuItem
                        key={v.version}
                        onClick={() => setViewingVersion(v.version)}
                        className={cn(v.version === currentVersion && "bg-accent font-semibold")}
                      >
                        <span className="font-mono">v{v.version}</span>
                        {v.version === activeArtifact.version && <span className="ml-1 text-muted-foreground">(current)</span>}
                        <span className="text-muted-foreground ml-auto">{v.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                )}
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="flex items-center gap-2 pt-1">
          <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Download as DOCX">
            <Download className="w-3 h-3" />
            Download
          </button>
          <button onClick={handleOpenInChat} className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Open in Chat">
            <MessageSquare className="w-3 h-3" />
            Open in Chat
          </button>
          <span className="text-[10px] text-muted-foreground ml-auto">Read-only · Refine via chat</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto argo-scrollbar px-4 py-4">
        <div className="artifact-markdown animate-fade-in">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {displayContent}
          </ReactMarkdown>
        </div>
      </div>

      {/* Trace */}
      {activeArtifact.trace && (
        <TracePanel trace={activeArtifact.trace} />
      )}
    </div>
  );
}

// ─── Files Panel ─────────────────────────────────────────────

export function FilesPanel() {
  const { activeFilesSpaceId, spaces, closeFilesPanel } = useArgo();
  const space = spaces.find(s => s.id === activeFilesSpaceId);
  const isOwner = space?.owner === 'You';
  const files = MOCK_PROJECT_FILES[activeFilesSpaceId || ''] || [];

  const filtered = files;

  if (!activeFilesSpaceId || !space) return null;

  return (
    <div className="w-[420px] min-w-[360px] h-screen bg-background panel-border-left flex flex-col overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-bold text-foreground truncate">Files — {space.name}</h2>
          </div>
          <button onClick={closeFilesPanel} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>


        {/* Upload + count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
          {isOwner ? (
            <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              <Upload className="w-3 h-3" />
              Upload File
            </button>
          ) : (
            <span className="text-[10px] text-muted-foreground italic">View & download only</span>
          )}
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto argo-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
            <FileText className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No files uploaded yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Upload files to share with your project.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((f, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-accent/30 transition-colors group">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    <span className="font-mono">{f.type}</span>
                    <span className="mx-1.5">·</span>
                    {f.size}
                    <span className="mx-1.5">·</span>
                    {f.date}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Uploaded by {f.uploadedBy}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="View">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Download">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {isOwner && (
                    <button className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          {isOwner ? 'You can upload, view, download, and delete files.' : 'You can view and download files. Only the project owner can upload or delete.'}
        </p>
      </div>
    </div>
  );
}
