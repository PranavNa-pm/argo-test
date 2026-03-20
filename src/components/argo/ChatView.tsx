import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Plus, Globe, Paperclip, Bot, FileText,
  ThumbsUp, ThumbsDown, AlertCircle, X, Lock,
  FileSignature, Table2, ScrollText, Copy,
} from 'lucide-react';
import { useArgo } from '@/context/ArgoContext';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChatMessageSkeleton } from '@/components/argo/skeletons/ChatMessageSkeleton';
import type { Chat, Space } from '@/types/argo';

// ─── ChatHeader ───────────────────────────────────────────────
function ChatHeader({ chat, space }: { chat: Chat; space: Space }) {
  const { renameChat } = useArgo();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chat.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = () => {
    setDraft(chat.name);
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleSave = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== chat.name) renameChat(chat.id, trimmed);
    setEditing(false);
  };

  return (
    <div className="border-b border-border px-4 py-3">
      <div className="flex items-start gap-2">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            className="text-base font-semibold text-foreground bg-transparent border-b border-primary outline-none w-full max-w-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={handleStartEdit}
            className="text-base font-semibold text-foreground hover:text-foreground/80 transition-colors text-left"
            title="Click to rename"
          >
            {chat.name}
          </button>
        )}
      </div>
      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
        {space.isDefault ? (
          <span>General Chat</span>
        ) : (
          <>
            <span>{space.name}</span>
            {space.visibility === 'shared' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          </>
        )}
      </div>
    </div>
  );
}

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 25;
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.txt', '.xlsx', '.png'];

interface AttachedFile {
  name: string;
  size: string;
}

export function ChatView() {
  const {
    activeChat, selectedAgent, artifacts,
    sendMessage, isTyping, setActiveArtifactId, setRightPanelView,
    activeSpaceId, spaces,
    isLoading,
  } = useArgo();

  const activeSpace = spaces.find(s => s.id === (activeChat?.spaceId ?? activeSpaceId));

  const [input, setInput] = useState('');
  const [showPlus, setShowPlus] = useState(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down' | null>>({});
  const [feedbackComment, setFeedbackComment] = useState<Record<string, string>>({});
  const [showFeedbackInput, setShowFeedbackInput] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  // Auto-clear file error after 4 seconds
  useEffect(() => {
    if (!fileError) return;
    const t = setTimeout(() => setFileError(null), 4000);
    return () => clearTimeout(t);
  }, [fileError]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files || []);
    const results: AttachedFile[] = [];
    let error: string | null = null;

    for (const file of incoming) {
      const ext = '.' + (file.name.split('.').pop() || '').toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        error = `"${file.name}" — unsupported type. Allowed: PDF, DOCX, PPTX, TXT, XLSX, PNG`;
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        error = `"${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB per-file limit`;
        continue;
      }
      if (attachedFiles.length + results.length >= MAX_FILES) {
        error = `Max ${MAX_FILES} files per chat`;
        break;
      }
      const sizeStr = file.size >= 1024 * 1024
        ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;
      results.push({ name: file.name, size: sizeStr });
    }

    if (results.length) setAttachedFiles(prev => [...prev, ...results]);
    if (error) setFileError(error);
    e.target.value = '';
  };

  const removeFile = (idx: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
    setFileError(null);
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

  // Capability icons (kept for future use)
  const capabilityIcons: Record<string, typeof FileSignature> = {
    'General Assistance': Bot,
    'Generate Proposal Outline': FileSignature,
    'Draft SOW': ScrollText,
    'Create Executive Summary': FileText,
    'Generate Company Comparison': Table2,
  };

  const hasActiveTools = webSearchEnabled || attachedFiles.length > 0;
  const atFileLimit = attachedFiles.length >= MAX_FILES;
  const isEmpty = (!activeChat || activeChat.messages.length === 0) && !isTyping;

  // Active pills shown above the textarea
  const ActivePills = () => (hasActiveTools || fileError) ? (
    <div className="flex items-start gap-1.5 px-3 pt-2 pb-0 flex-wrap">
      {webSearchEnabled && (
        <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 border border-primary/30 text-primary rounded-full px-2 py-0.5">
          <Globe className="w-3 h-3 shrink-0" />
          Web search
          <button onClick={() => setWebSearchEnabled(false)} className="ml-0.5 hover:text-primary/60 transition-colors" aria-label="Remove web search">
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
      {attachedFiles.map((f, i) => (
        <span key={i} className="inline-flex items-center gap-1 text-[11px] bg-secondary border border-border text-foreground rounded-full px-2 py-0.5 max-w-[220px]">
          <Paperclip className="w-3 h-3 shrink-0" />
          <span className="truncate">{f.name}</span>
          <span className="text-muted-foreground shrink-0 ml-0.5">{f.size}</span>
          <button onClick={() => removeFile(i)} className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0" aria-label={`Remove ${f.name}`}>
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      {fileError && (
        <span className="inline-flex items-center gap-1 text-[11px] text-destructive animate-fade-in">
          <AlertCircle className="w-3 h-3 shrink-0" />
          {fileError}
        </span>
      )}
    </div>
  ) : null;

  // Dropdown menu content (no tick marks, no blue highlighting)
  const PlusDropdown = () => (
    <DropdownMenuContent side="top" align="start" className="w-52">
      <DropdownMenuItem onClick={() => { setWebSearchEnabled(v => !v); setShowPlus(false); }}>
        <Globe className="w-3.5 h-3.5 mr-2" />
        Web Search
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => { if (!atFileLimit) fileInputRef.current?.click(); setShowPlus(false); }}
        disabled={atFileLimit}
      >
        <Paperclip className="w-3.5 h-3.5 mr-2" />
        <span className="flex-1">Attach File</span>
        {attachedFiles.length > 0 && (
          <span className="text-[10px] text-muted-foreground ml-2 tabular-nums">
            {attachedFiles.length}/{MAX_FILES}
          </span>
        )}
      </DropdownMenuItem>
      <div className="px-2 py-1.5 border-t border-border mt-0.5 space-y-0.5">
        <p className="text-[10px] text-muted-foreground">PDF, DOCX, PPTX, TXT, XLSX, PNG</p>
        <p className="text-[10px] text-muted-foreground">Max {MAX_FILES} files · {MAX_FILE_SIZE_MB} MB each</p>
      </div>
    </DropdownMenuContent>
  );

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple
        accept={ALLOWED_EXTENSIONS.join(',')}
      />

      {/* Chat Header */}
      {activeChat && activeSpace && (
        <ChatHeader chat={activeChat} space={activeSpace} />
      )}

      {/* Messages */}
      <div className={cn("flex-1 overflow-y-auto argo-scrollbar", isEmpty && "flex flex-col")}>
        <div className={cn("max-w-4xl mx-auto px-4 py-6", isEmpty && "flex-1 flex flex-col")}>
          {/* ═══ Welcome Empty State — centred input ═══ */}
          {isEmpty && (
            isLoading ? (
              <ChatMessageSkeleton />
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 animate-fade-in">
                <div className="w-full max-w-xl">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-1">Hello, Pranav.</h2>
                    <p className="text-sm text-muted-foreground">What would you like to work on today?</p>
                  </div>
                  {/* Centred input */}
                  <div className="mb-5">
                    <div className="bg-card border border-border rounded-xl focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all shadow-sm">
                      <ActivePills />
                      <div className="flex items-end gap-2 px-3 py-2.5">
                        <DropdownMenu open={showPlus} onOpenChange={setShowPlus}>
                          <DropdownMenuTrigger asChild>
                            <button className={cn(
                              "p-1 rounded hover:bg-accent transition-colors",
                              hasActiveTools ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}>
                              <Plus className="w-4 h-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <PlusDropdown />
                        </DropdownMenu>
                        <textarea
                          ref={inputRef}
                          value={input}
                          onChange={handleTextareaChange}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask anything…"
                          rows={1}
                          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-[160px] py-0.5"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!input.trim() || isTyping}
                          className={cn("p-1.5 rounded-lg transition-colors", input.trim() && !isTyping ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground")}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Suggestion cards — 4 in one row */}
                  <div className="grid grid-cols-4 gap-3">
                    {selectedAgent?.capabilities.slice(0, 4).map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleCapabilityClick(c.name)}
                        className="px-3 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-accent/50 text-center transition-all flex items-center justify-center min-h-[52px]"
                      >
                        <div className="text-xs font-medium text-foreground leading-snug">{c.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}

          {activeChat?.messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={cn("mb-5 animate-fade-in flex group", msg.role === 'user' ? "justify-end" : "justify-start")}
              style={{ animationDelay: `${Math.min(idx * 50, 300)}ms` }}
            >
              {msg.role === 'user' ? (
                <div className="flex flex-col items-end gap-1 max-w-[75%]">
                  <div className="bg-muted border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground leading-[1.7] whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigator.clipboard.writeText(msg.content)} title="Copy" className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="max-w-[85%]">
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
                      <button onClick={() => { setActiveArtifactId(msg.artifactId!); setRightPanelView('artifact'); }} className="inline-flex items-center mt-3 px-3 py-1.5 rounded-lg border border-border bg-muted text-xs font-medium text-foreground hover:bg-accent transition-colors">
                        {artName}
                      </button>
                    );
                  })()}
                  <div className={cn(
                    "mt-2 flex items-center gap-0.5 transition-opacity",
                    feedbackState[msg.id] ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <button onClick={() => navigator.clipboard.writeText(msg.content)} title="Copy" className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleThumbsUp(msg.id)}
                      className={cn("p-1 rounded hover:bg-accent transition-colors", feedbackState[msg.id] === 'up' ? "text-green-500" : "text-muted-foreground hover:text-foreground")}
                      title="Good response"
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleThumbsDown(msg.id)}
                      className={cn("p-1 rounded hover:bg-accent transition-colors", feedbackState[msg.id] === 'down' ? "text-destructive" : "text-muted-foreground hover:text-foreground")}
                      title="Poor response"
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </button>
                  </div>
                  {showFeedbackInput === msg.id && feedbackState[msg.id] === 'down' && (
                    <div className="mt-2 max-w-sm animate-fade-in bg-muted border border-border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-foreground">What went wrong?</p>
                        <button
                          onClick={() => setShowFeedbackInput(null)}
                          className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <textarea
                        value={feedbackComment[msg.id] || ''}
                        onChange={e => setFeedbackComment(prev => ({ ...prev, [msg.id]: e.target.value }))}
                        placeholder="Help us improve — describe what didn't work…"
                        rows={2}
                        className="w-full text-xs bg-background border border-border rounded-md px-2.5 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowFeedbackInput(null)}
                          className="px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => setShowFeedbackInput(null)}
                          className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="mb-5 animate-fade-in flex justify-start">
              <div className="flex items-center gap-1.5 px-1 py-2">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
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
            <div className="bg-card border border-border rounded-xl focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all">
              <ActivePills />
              <div className="flex items-end gap-2 px-3 py-2.5">
                <DropdownMenu open={showPlus} onOpenChange={setShowPlus}>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "p-1 rounded hover:bg-accent transition-colors",
                      hasActiveTools ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <PlusDropdown />
                </DropdownMenu>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything…"
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none min-h-[24px] max-h-[160px] py-0.5"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className={cn("p-1.5 rounded-lg transition-colors", input.trim() && !isTyping ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground")}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
