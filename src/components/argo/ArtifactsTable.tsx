import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, MessageSquare, Download, Layers } from 'lucide-react';
import { useArgo } from '@/context/ArgoContext';
import { cn } from '@/lib/utils';
import { ListRowSkeleton } from '@/components/argo/skeletons/ListRowSkeleton';

export function ArtifactsTable() {
  const { allArtifacts, spaces, chats, setActiveArtifactId, setRightPanelView, navigateToChat, renameArtifact, isLoading } = useArgo();
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
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
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

        {isLoading ? (
          <div className="space-y-1">
            {[...Array(4)].map((_, i) => <ListRowSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Layers className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {artifactSearch || contextFilter !== 'all' ? 'No artifacts match your filter' : 'No artifacts yet'}
            </p>
            {!artifactSearch && contextFilter === 'all' && (
              <p className="text-xs text-muted-foreground/60 mt-1">Artifacts are generated from your chats</p>
            )}
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
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-black/5 transition-colors text-left group"
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
