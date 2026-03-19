import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Plus, Globe, Paperclip, Bot, User, FileText,
  ChevronRight, ThumbsUp, ThumbsDown, AlertCircle, X, Lock,
  FileSignature, Table2, ScrollText,
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

export function ChatView() {
  const {
    activeChat, selectedAgent, artifacts,
    sendMessage, isTyping, setActiveArtifactId, setRightPanelView,
    activeSpaceId, spaces,
    isLoading,
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
                    <div className="flex items-end gap-2 bg-card border border-border rounded-xl px-3 py-2.5 focus-within:ring-1 focus-within:ring-ring focus-within:border-primary/50 transition-all shadow-sm">
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
