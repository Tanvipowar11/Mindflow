import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, MessageSquare, Search, MoreHorizontal, Pencil, X, Check } from 'lucide-react';

interface Conversation { id: string; title: string; updatedAt: string; }

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

const relativeTime = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const date = new Date(Number(dateStr) || dateStr);
  if (isNaN(date.getTime())) return 'Just now';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const Sidebar: React.FC<SidebarProps> = ({
  conversations, activeId, onSelect, onNew, onDelete, onRename,
}) => {
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const renameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId) renameRef.current?.focus();
  }, [renamingId]);

  const startRename = (conv: Conversation) => {
    setRenamingId(conv.id);
    setRenameText(conv.title);
    setOpenMenuId(null);
  };

  const submitRename = (id: string) => {
    if (renameText.trim()) onRename(id, renameText.trim());
    setRenamingId(null);
  };

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 h-full dark:bg-[#111827] bg-gray-900 border-r border-white/5 flex flex-col flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white text-sm font-bold shadow-lg">
            M
          </div>
          <h1 className="text-sm font-semibold text-white">MindFlow</h1>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">AI</span>
        </div>
        <button
          onClick={onNew}
          className="w-full bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white py-2.5 rounded-xl transition-all font-medium flex items-center justify-center gap-2 text-sm shadow-lg"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2.5">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search chats…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/5 text-white text-sm placeholder:text-gray-600 outline-none focus:ring-1 focus:ring-purple-500/40"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {filtered.length === 0 && (
          <p className="text-xs text-gray-600 text-center mt-10">
            {search ? 'No chats found' : 'No conversations yet'}
          </p>
        )}

        {filtered.map((conv) => (
          <div
            key={conv.id}
            onClick={() => { if (renamingId !== conv.id) { onSelect(conv.id); setOpenMenuId(null); } }}
            className={`group relative flex items-center px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all ${
              activeId === conv.id
                ? 'bg-purple-600/20 border border-purple-500/30 text-white'
                : 'border border-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200'
            }`}
          >
            <MessageSquare size={13} className="shrink-0 mr-2 opacity-70" />

            <div className="flex-1 min-w-0">
              {renamingId === conv.id ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    ref={renameRef}
                    value={renameText}
                    onChange={(e) => setRenameText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitRename(conv.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    className="flex-1 bg-white/10 text-white text-xs rounded px-1.5 py-0.5 outline-none focus:ring-1 focus:ring-purple-500 min-w-0"
                  />
                  <button onClick={() => submitRename(conv.id)} className="text-purple-400 hover:text-purple-300"><Check size={12} /></button>
                  <button onClick={() => setRenamingId(null)} className="text-gray-500 hover:text-white"><X size={12} /></button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                  <p className="text-[11px] text-gray-600 mt-0.5">{relativeTime(conv.updatedAt)}</p>
                </>
              )}
            </div>

            {/* 3-dot menu */}
            {renamingId !== conv.id && (
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setOpenMenuId(openMenuId === conv.id ? null : conv.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                >
                  <MoreHorizontal size={13} />
                </button>

                {openMenuId === conv.id && (
                  <div className="absolute right-0 top-7 z-50 w-36 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                    <button
                      onClick={() => startRename(conv)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-300 hover:bg-white/5 transition-colors"
                    >
                      <Pencil size={12} /> Rename
                    </button>
                    <div className="border-t border-white/10" />
                    <button
                      onClick={() => { onDelete(conv.id); setOpenMenuId(null); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};
