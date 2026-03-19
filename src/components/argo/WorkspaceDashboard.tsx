import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Globe, Lock, FolderOpen } from 'lucide-react';
import { useArgo } from '@/context/ArgoContext';
import { cn } from '@/lib/utils';
import { CreateProjectModal } from '@/components/argo/CreateProjectModal';
import { JoinProjectModal } from '@/components/argo/JoinProjectModal';
import { ListRowSkeleton } from '@/components/argo/skeletons/ListRowSkeleton';

export function WorkspaceDashboard() {
  const { spaces, openSpaceWorkspace, isLoading } = useArgo();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'private' | 'shared'>('all');
  const [projectDisplayCount, setProjectDisplayCount] = useState(20);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Join Project
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Project
            </button>
          </div>
        </div>

        {/* Search bar — full width */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setProjectDisplayCount(20); }}
            placeholder="Search projects..."
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Filters + Count */}
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
              className="text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors select-none flex items-center gap-1 w-28 justify-end uppercase tracking-wide"
            >
              Owner {sortField === 'owner' && <span className="text-foreground">{sortAsc ? '↑' : '↓'}</span>}
            </button>
            <button
              onClick={() => { setSortField('date'); setSortAsc(sortField === 'date' ? !sortAsc : true); }}
              className="text-[11px] font-medium text-foreground/60 hover:text-foreground transition-colors select-none flex items-center gap-1 w-12 justify-end uppercase tracking-wide"
            >
              Date {sortField === 'date' && <span className="text-foreground">{sortAsc ? '↑' : '↓'}</span>}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-1">
            {[...Array(4)].map((_, i) => <ListRowSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="w-8 h-8 text-muted-foreground/40 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {search || filter !== 'all' ? 'No projects match your filter' : 'No projects yet'}
            </p>
            {!search && filter === 'all' && (
              <p className="text-xs text-muted-foreground/60 mt-1">Create your first project to get started</p>
            )}
          </div>
        ) : (
          <div className="space-y-0.5">
            {paginated.map(s => (
              <button
                key={s.id}
                onClick={() => openSpaceWorkspace(s.id)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-black/5 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate block">{s.name}</span>
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{s.description || 'No description'}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center justify-end gap-1.5 w-28">
                    <span className="text-xs text-muted-foreground text-right">{s.owner}</span>
                    {s.visibility === 'shared'
                      ? <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                      : <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">{s.createdAt.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </div>
              </button>
            ))}
            {/* Infinite scroll sentinel */}
            {sorted.length > projectDisplayCount && <div ref={projectSentinelRef} className="h-4" />}
          </div>
        )}
      </div>
      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
      {showJoinModal && <JoinProjectModal onClose={() => setShowJoinModal(false)} />}
    </div>
  );
}
