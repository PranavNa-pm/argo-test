import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus, MessageSquare, Search, SquarePen,
  Settings, Bot, BookOpen, Users,
  PanelLeftClose, PanelLeft, ChevronDown, MoreHorizontal,
  FolderOpen, Folders, Layers, LogOut, Globe, Lock, MessagesSquare
} from 'lucide-react';
import { useArgo } from '@/context/ArgoContext';
import { cn } from '@/lib/utils';
import argoBrainIcon from '@/assets/argo-brain-icon.png';
import argoLogo from '@/assets/argo-logo.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


const MOCK_USER = { firstName: 'Pranav', lastName: 'Nagrani', email: 'pranav@cybage.com' };

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}${'*'.repeat(4)}@${domain}`;
}

function UserProfileSection({ onOpenConfig }: { onOpenConfig: (tab: 'agents' | 'prompts' | 'groups') => void }) {
  const initials = `${MOCK_USER.firstName[0]}${MOCK_USER.lastName[0]}`;

  return (
    <div className="px-2 py-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-accent/60 transition-colors focus:outline-none">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary-foreground">{initials}</span>
            </div>
            <span className="text-sm font-medium text-foreground truncate">{MOCK_USER.firstName} {MOCK_USER.lastName}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          <div className="px-3 py-2.5">
            <div className="text-sm font-semibold text-foreground">{MOCK_USER.firstName} {MOCK_USER.lastName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{maskEmail(MOCK_USER.email)}</div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="opacity-50">
            <Settings className="w-3.5 h-3.5 mr-2" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Bot className="w-3.5 h-3.5 mr-2" />
              Configurations
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">WIP</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => onOpenConfig('agents')}>
                <Bot className="w-3.5 h-3.5 mr-2" />
                Agent Configuration
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenConfig('prompts')}>
                <BookOpen className="w-3.5 h-3.5 mr-2" />
                Prompt Management
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOpenConfig('groups')}>
                <Users className="w-3.5 h-3.5 mr-2" />
                Group Permissions
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut className="w-3.5 h-3.5 mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col h-full px-3 pt-3 gap-2 animate-fade-in">
      <Skeleton className="h-9 w-full rounded-lg" />
      <Skeleton className="h-8 w-full rounded-md" />
      <div className="space-y-1 pt-1">
        <Skeleton className="h-7 w-full rounded-md" />
        <Skeleton className="h-7 w-full rounded-md" />
      </div>
      <div className="pt-3 space-y-1">
        <Skeleton className="h-3 w-24 rounded mb-2" />
        <Skeleton className="h-6 w-full rounded-md" />
        <Skeleton className="h-6 w-4/5 rounded-md" />
        <Skeleton className="h-6 w-3/4 rounded-md" />
      </div>
    </div>
  );
}

export function LeftPanel() {
  const {
    spaces, activeSpaceId, chats, activeChatId, setActiveChatId,
    setCenterView, setAdminTab,
    createChat, openSpaceWorkspace, renameChat,
    setActiveArtifactId, setRightPanelView, centerView,
    sidebarCollapsed, setSidebarCollapsed,
  } = useArgo();

  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocusedIdx, setSearchFocusedIdx] = useState(-1);
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [generalChatDisplayCount, setGeneralChatDisplayCount] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const generalChatSpace = spaces.find(s => s.isDefault);
  const projectSpaces = spaces.filter(s => !s.isDefault);

  const generalChatChats = generalChatSpace ? chats.filter(c => c.spaceId === generalChatSpace.id) : [];

  const recentProjects = [...projectSpaces]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const searchResults = searchQuery ? (() => {
    const q = searchQuery.toLowerCase();
    const matchedProjects = projectSpaces.filter(s => s.name.toLowerCase().includes(q));
    const matchedChats = chats.filter(c => c.name.toLowerCase().includes(q));
    return { projects: matchedProjects, chats: matchedChats };
  })() : null;

  const flatResults = searchResults
    ? [
        ...searchResults.projects.map(p => ({ type: 'project' as const, id: p.id })),
        ...searchResults.chats.map(c => ({ type: 'chat' as const, id: c.id })),
      ]
    : [];

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!flatResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchFocusedIdx(i => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchFocusedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && searchFocusedIdx >= 0) {
      e.preventDefault();
      const focused = flatResults[searchFocusedIdx];
      if (focused.type === 'project') {
        openSpaceWorkspace(focused.id);
      } else {
        setActiveChatId(focused.id);
        setCenterView('chat');
        setActiveArtifactId(null);
        setRightPanelView('empty');
      }
      setSearchQuery('');
      setSearchFocusedIdx(-1);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setSearchFocusedIdx(-1);
    }
  };

  const handleNewChat = () => {
    createChat('New Chat', generalChatSpace?.id || 'space-my');
  };

  const handleOpenConfig = (tab: 'agents' | 'prompts' | 'groups') => {
    setCenterView('config');
    setAdminTab(tab);
    setActiveArtifactId(null);
    setRightPanelView('empty');
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-sidebar panel-border-right w-full">
        <SidebarSkeleton />
      </div>
    );
  }

  // ─── Collapsed sidebar: clean, empty — just expand + user ───
  if (sidebarCollapsed) {
    return (
      <div className="h-screen flex flex-col items-center bg-sidebar panel-border-right py-3 gap-1 w-full">
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors mb-1"
          title="Expand sidebar"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <div className="flex-1" />
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center cursor-pointer" title={`${MOCK_USER.firstName} ${MOCK_USER.lastName}`}>
          <span className="text-[10px] font-bold text-primary-foreground">{MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}</span>
        </div>
      </div>
    );
  }

  const visibleGeneralChats = generalChatChats.filter(c => c.messages.length > 0);

  return (
    <div className="h-screen flex flex-col bg-sidebar overflow-hidden panel-border-right">
      {/* Header with logo */}
      <div className="px-4 py-3.5 border-b border-sidebar-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={argoLogo} alt="ARGO" className="h-3 w-auto" />
        </div>
        <button onClick={() => setSidebarCollapsed(true)} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Collapse sidebar">
          <PanelLeft className="w-4 h-4" />
        </button>
      </div>

      {/* ═══ Zone 1: New Chat + Search ═══ */}
      <div className="px-3 pt-3 pb-2 space-y-1.5">
        {/* New Chat — text link style, not button */}
        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-accent/60 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="font-medium">New Chat</span>
        </button>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg">
          <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setSearchFocusedIdx(-1); }}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search"
            className="flex-1 text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Zone divider */}
      <div className="mx-3 border-t border-border" />

      {/* ═══ Zone 2: Navigation ═══ */}
      <div className="flex-1 overflow-y-auto argo-scrollbar">
        <div className="px-2 pt-2.5 pb-1 space-y-0.5">

          {/* Search results */}
          {searchQuery && searchResults ? (
            <div className="px-1 space-y-0.5">
              {searchResults.projects.length === 0 && searchResults.chats.length === 0 ? (
                <div className="text-xs text-muted-foreground py-3 px-3 text-center">No results found.</div>
              ) : (
                <>
                  {searchResults.projects.map(project => (
                    <button
                      key={project.id}
                      onClick={() => { openSpaceWorkspace(project.id); setSearchQuery(''); setSearchFocusedIdx(-1); }}
                      className={cn(
                        "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                        flatResults.findIndex(r => r.id === project.id) === searchFocusedIdx
                          ? "bg-accent text-foreground ring-1 ring-ring"
                          : activeSpaceId === project.id && centerView === 'space-workspace'
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <span className="truncate flex-1">{project.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">Project</span>
                    </button>
                  ))}
                  {searchResults.chats.map(c => {
                    const project = spaces.find(s => s.id === c.spaceId);
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveChatId(c.id);
                          setCenterView('chat');
                          setActiveArtifactId(null);
                          setRightPanelView('empty');
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                          flatResults.findIndex(r => r.id === c.id) === searchFocusedIdx
                            ? "bg-accent text-foreground ring-1 ring-ring"
                            : activeChatId === c.id && centerView === 'chat'
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                        )}
                      >
                        <span className="truncate flex-1">{c.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{project?.name}</span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          ) : (
            <>
              {/* Projects (plural — multi-folder icon) */}
              <button
                onClick={() => {
                  setCenterView('projects');
                  setActiveArtifactId(null);
                  setRightPanelView('empty');
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  centerView === 'projects'
                    ? "bg-accent text-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-accent/60"
                )}
              >
                <Folders className="w-3.5 h-3.5" />
                <span>Projects</span>
              </button>

              {/* Artifacts */}
              <button
                onClick={() => {
                  setCenterView('artifacts-table');
                  setActiveArtifactId(null);
                  setRightPanelView('empty');
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                  centerView === 'artifacts-table'
                    ? "bg-accent text-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-accent/60"
                )}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Artifacts</span>
              </button>

              {/* Zone divider */}
              <div className="mx-1 my-2 border-t border-border" />

              {/* ── Recent Projects ── */}
              <div className="mb-1">
                <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground tracking-wide">
                  Recent projects
                </div>
                <div className="space-y-0.5">
                  {recentProjects.length === 0 ? (
                    <div className="text-xs text-muted-foreground py-3 px-3 text-center">No projects yet.</div>
                  ) : (
                    recentProjects.map(project => {
                      const projectChats = chats.filter(c => c.spaceId === project.id && c.messages.length > 0);
                      const isActiveProject = activeSpaceId === project.id && !spaces.find(s => s.id === activeSpaceId)?.isDefault;
                      return (
                        <div key={project.id}>
                          <div className="flex items-center group">
                            <button
                              onClick={() => openSpaceWorkspace(project.id)}
                              className={cn(
                                "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left min-w-0",
                                isActiveProject
                                  ? "bg-accent text-foreground font-semibold"
                                  : "text-sidebar-foreground hover:bg-accent/60"
                              )}
                            >
                              <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate font-medium min-w-0">{project.name}</span>
                            </button>
                            {project.visibility === 'shared'
                              ? <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                              : <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                createChat('New Chat', project.id);
                              }}
                              className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0"
                              title="New chat in this project"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Accordion: show chats when this project is active */}
                          {isActiveProject && projectChats.length > 0 && (
                            <div className="ml-7 space-y-0.5 mt-0.5">
                              {projectChats.slice(0, 5).map(c => (
                                <div key={c.id} className="relative group/chat flex items-center">
                                  {renamingChatId === c.id ? (
                                    <div className="w-full px-1 py-0.5">
                                      <input
                                        value={renameValue}
                                        onChange={e => setRenameValue(e.target.value)}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') { renameChat(c.id, renameValue.trim() || c.name); setRenamingChatId(null); }
                                          if (e.key === 'Escape') setRenamingChatId(null);
                                        }}
                                        onBlur={() => { renameChat(c.id, renameValue.trim() || c.name); setRenamingChatId(null); }}
                                        className="w-full text-xs bg-background border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                        autoFocus
                                      />
                                    </div>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setActiveChatId(c.id);
                                          setCenterView('chat');
                                          setActiveArtifactId(null);
                                          setRightPanelView('empty');
                                        }}
                                        className={cn(
                                          "flex-1 flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors text-left",
                                          activeChatId === c.id && centerView === 'chat'
                                            ? "bg-accent text-foreground"
                                            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                                        )}
                                      >
                                        <span className="truncate">{c.name}</span>
                                      </button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button
                                            onClick={(e) => e.stopPropagation()}
                                            className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover/chat:opacity-100 transition-all"
                                          >
                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32">
                                          <DropdownMenuItem onClick={() => {
                                            setRenameValue(c.name);
                                            setRenamingChatId(c.id);
                                          }}>
                                            Rename
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </>
                                  )}
                                </div>
                              ))}
                              {projectChats.length > 5 && (
                                <button
                                  onClick={() => openSpaceWorkspace(project.id)}
                                  className="w-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors text-left"
                                >
                                  View more ({projectChats.length - 5})
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Zone divider */}
              {generalChatSpace && <div className="mx-1 my-2 border-t border-border" />}

              {/* ── General Chat Section (MessagesSquare icon) ── */}
              {generalChatSpace && (
                <div className="mb-1">
                  <div className="flex items-center group">
                    <button
                      onClick={() => openSpaceWorkspace(generalChatSpace.id)}
                      className={cn(
                        "flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                        activeSpaceId === generalChatSpace.id && centerView === 'space-workspace'
                          ? "bg-accent text-foreground font-semibold"
                          : "text-sidebar-foreground hover:bg-accent/60"
                      )}
                    >
                      <MessagesSquare className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate flex-1 font-medium">General Chat</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        createChat('New Chat', generalChatSpace.id);
                      }}
                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="New chat"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="ml-7 space-y-0.5 mt-0.5">
                    {visibleGeneralChats.length === 0 && (
                      <div className="text-xs text-muted-foreground py-1.5 px-2">No chats</div>
                    )}
                    {visibleGeneralChats.slice(0, generalChatDisplayCount).map(c => (
                      <div key={c.id} className="relative group/chat flex items-center">
                        {renamingChatId === c.id ? (
                          <div className="w-full px-1 py-0.5">
                            <input
                              value={renameValue}
                              onChange={e => setRenameValue(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') { renameChat(c.id, renameValue.trim() || c.name); setRenamingChatId(null); }
                                if (e.key === 'Escape') setRenamingChatId(null);
                              }}
                              onBlur={() => { renameChat(c.id, renameValue.trim() || c.name); setRenamingChatId(null); }}
                              className="w-full text-xs bg-background border border-border rounded-md px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setActiveChatId(c.id);
                                setCenterView('chat');
                                setActiveArtifactId(null);
                                setRightPanelView('empty');
                              }}
                              className={cn(
                                "flex-1 flex items-center gap-2 px-2 py-1 rounded-md text-xs transition-colors",
                                activeChatId === c.id && centerView === 'chat'
                                  ? "bg-accent text-foreground"
                                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                              )}
                            >
                              <span className="truncate">{c.name}</span>
                            </button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground opacity-0 group-hover/chat:opacity-100 transition-all"
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={() => {
                                  setRenameValue(c.name);
                                  setRenamingChatId(c.id);
                                }}>
                                  Rename
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    ))}
                    {visibleGeneralChats.length > generalChatDisplayCount && (
                      <button
                        onClick={() => openSpaceWorkspace(generalChatSpace!.id)}
                        className="w-full px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        View more ({visibleGeneralChats.length - generalChatDisplayCount})
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Zone divider */}
      <div className="mx-3 border-t border-border" />

      {/* ═══ User Profile ═══ */}
      <UserProfileSection onOpenConfig={handleOpenConfig} />
    </div>
  );
}
