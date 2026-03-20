import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileText, X, ChevronDown,
  Download, Maximize2, Minimize2, Upload, FolderOpen,
  Trash2
} from 'lucide-react';
import { useArgo } from '@/context/ArgoContext';
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

export function RightPanel() {
  const { activeArtifact, setActiveArtifactId, setRightPanelView } = useArgo();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewingVersion, setViewingVersion] = useState<number | null>(null);

  if (!activeArtifact) return null;

  const currentVersion = viewingVersion ?? activeArtifact.version;
  const versionData = activeArtifact.versions?.find(v => v.version === currentVersion);
  const displayContent = versionData?.content ?? activeArtifact.content;

  const handleClose = () => {
    setActiveArtifactId(null);
    setRightPanelView('empty');
    setIsFullscreen(false);
    setViewingVersion(null);
  };

  return (
    <div className={cn(
      "h-screen bg-background panel-border-left flex flex-col overflow-hidden animate-slide-in-right",
      isFullscreen
        ? "fixed inset-0 z-50 w-full"
        : "fixed inset-0 z-40 w-full md:relative md:inset-auto md:z-auto md:w-[480px] md:min-w-[400px]"
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">{activeArtifact.name}</h2>
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

        {/* Actions bar */}
        <div className="flex items-center gap-2 pt-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors" title="Download">
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors font-mono">
                v{currentVersion}
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
    <div className="fixed inset-0 z-40 w-full md:relative md:inset-auto md:z-auto md:w-[420px] md:min-w-[360px] h-screen bg-background panel-border-left flex flex-col overflow-hidden animate-slide-in-right">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <FolderOpen className="w-4 h-4 text-primary shrink-0" />
            <h2 className="text-sm font-semibold text-foreground truncate">Files — {space.name}</h2>
          </div>
          <button onClick={closeFilesPanel} className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>


        {/* Upload + count */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{filtered.length} file{filtered.length !== 1 ? 's' : ''}</span>
          {isOwner ? (
            <button className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" title="Upload file">
              <Upload className="w-3.5 h-3.5" />
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
          <div className="p-2 space-y-0.5">
            {filtered.map((f, i) => (
              <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer">
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
                </div>
                <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
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
