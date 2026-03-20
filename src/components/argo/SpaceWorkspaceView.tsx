import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Globe, Download, Trash2, Upload,
  Lock, MessageSquare, Link2, FileText,
  Pencil,
} from 'lucide-react';
import { useArgo } from '@/context/ArgoContext';
import { MOCK_PROJECT_FILES } from '@/components/argo/RightPanel';
import { cn } from '@/lib/utils';
import { ChatMoreMenu } from '@/components/argo/ChatMoreMenu';
import { CreateProjectModal } from '@/components/argo/CreateProjectModal';
import { ListRowSkeleton } from '@/components/argo/skeletons/ListRowSkeleton';

export function SpaceWorkspaceView() {
  const {
    spaces, activeSpaceId, chats, artifacts,
    setActiveChatId, setCenterView, createChat, renameChat, renameSpace, updateSpace,
    setActiveArtifactId, setRightPanelView, openFilesPanel,
    isLoading,
  } = useArgo();

  const space = spaces.find(s => s.id === activeSpaceId);
  const spaceChats = chats.filter(c => c.spaceId === activeSpaceId);
  const spaceArtifacts = artifacts.filter(a => a.spaceId === activeSpaceId);
  const [showEditModal, setShowEditModal] = useState(false);
  const [chatDisplayCount, setChatDisplayCount] = useState(20);
  const [activeTab, setActiveTab] = useState<'chats' | 'files' | 'members'>('chats');
  const chatSentinelRef = useRef<HTMLDivElement>(null);
  const [shareSearch] = useState('');
  const [chatSearch, setChatSearch] = useState('');
  const isShared = space?.visibility === 'shared';
  const isOwner = space?.owner === 'You';

  const shareMembers = [
    { name: 'You', role: 'Admin', isYou: true },
    { name: 'John Smith', role: 'Pre-Sales Team', isYou: false },
    { name: 'Sarah Lee', role: 'Delivery Manager Team', isYou: false },
    { name: 'James Wilson', role: 'Pre-Sales Admin', isYou: false },
    { name: 'Alex Thompson', role: 'Admin', isYou: false },
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
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">{space.name}</h1>
            <span className="text-sm text-muted-foreground">•</span>
            {isShared
              ? <Globe className="w-3.5 h-3.5 text-muted-foreground" />
              : <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
          </div>
          {space.owner && (
            <p className="text-xs text-muted-foreground mt-1">
              {isShared && space.owner !== 'You' ? `Shared by ${space.owner}` : `Owned by ${space.owner}`}
            </p>
          )}
          {space.description && <p className="text-sm text-muted-foreground mt-1">{space.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {isOwner && !space.isDefault && (
            <button
              onClick={() => setShowEditModal(true)}
              title="Edit project"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          <button
            onClick={() => createChat('New Chat', activeSpaceId)}
            title="Start a new chat in this project"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Tab bar */}
      {!space.isDefault && (
        <div className="flex items-center gap-0 border-b border-border -mt-2">
          {(['chats', 'files', 'members'] as const).filter(tab => tab !== 'members' || isShared).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
          {isShared && isOwner && (
            <button
              onClick={() => navigator.clipboard.writeText(`https://argo.app/project/${space.id}`)}
              className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Copy project link — anyone with this link must log in to view"
            >
              <Link2 className="w-3 h-3" />
              Copy link
            </button>
          )}
        </div>
      )}

      {/* Chats tab */}
      {(space.isDefault || activeTab === 'chats') && (
        <div>
          {spaceChats.length > 0 && !isLoading && (
            <p className="text-xs text-muted-foreground mb-3">{spaceChats.length} chat{spaceChats.length !== 1 ? 's' : ''}</p>
          )}
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(3)].map((_, i) => <ListRowSkeleton key={i} />)}
            </div>
          ) : spaceChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="w-7 h-7 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No chats yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start a new chat to begin working on this project</p>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                {spaceChats
                  .filter(c => !chatSearch || c.name.toLowerCase().includes(chatSearch.toLowerCase()))
                  .slice(0, chatDisplayCount).map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-black/5 transition-colors cursor-pointer group" onClick={() => handleOpenChat(c.id)}>
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
              {spaceChats.length > chatDisplayCount && <div ref={chatSentinelRef} className="h-4" />}
            </>
          )}
        </div>
      )}

      {/* Files tab */}
      {!space.isDefault && activeTab === 'files' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{(MOCK_PROJECT_FILES[activeSpaceId] || []).length} file{(MOCK_PROJECT_FILES[activeSpaceId] || []).length !== 1 ? 's' : ''}</span>
            {isOwner && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium" title="Upload file">
                <Upload className="w-3.5 h-3.5" />
                Upload
              </button>
            )}
          </div>
          {(MOCK_PROJECT_FILES[activeSpaceId] || []).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Upload className="w-7 h-7 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">No files uploaded</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Upload files to share context with your team</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {(MOCK_PROJECT_FILES[activeSpaceId] || []).map((f, i) => (
                <div key={i} onClick={() => openFilesPanel(activeSpaceId!)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group cursor-pointer">
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
                    <button onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Download"><Download className="w-3.5 h-3.5" /></button>
                    {isOwner && <button onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members tab */}
      {!space.isDefault && activeTab === 'members' && (
        <div className="flex flex-col gap-4">
          {/* Member list */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">{shareMembers.length} member{shareMembers.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="space-y-0.5">
              {shareMembers.map(m => (
                <div key={m.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-medium text-primary">{m.isYou ? 'PN' : m.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{m.name}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground shrink-0">{m.role}</span>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}
      {showEditModal && (
        <CreateProjectModal
          onClose={() => setShowEditModal(false)}
          editSpace={{ id: space.id, name: space.name, description: space.description || '', projectContext: space.projectContext }}
        />
      )}
      </div>
    </div>
  );
}
