import React, { useEffect, useState, useRef } from 'react';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Pencil, Trash2, RefreshCw, Share2 } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { UPDATE_MESSAGE, DELETE_MESSAGES_AFTER, REGENERATE_MESSAGE, GET_MESSAGES } from '../../graphql/queries';

interface MessageProps {
  message: { id: string; content: string; role: 'user' | 'assistant'; createdAt?: string };
  conversationId: string;
  reactions: Record<string, string>;
  onReact: (id: string, type: string) => void;
  onDelete?: () => void;
  onRetry?: () => void;
}

export const MessageItem: React.FC<MessageProps> = ({
  message, conversationId, reactions, onReact, onDelete, onRetry,
}) => {
  const isUser = message.role === 'user';
  const [displayedText, setDisplayedText] = useState(isUser ? message.content : '');
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [updateMessage] = useMutation(UPDATE_MESSAGE);
  const [deleteMessagesAfter] = useMutation(DELETE_MESSAGES_AFTER);
  const [regenerateMessage] = useMutation(REGENERATE_MESSAGE, {
    refetchQueries: [{ query: GET_MESSAGES, variables: { conversationId } }],
    awaitRefetchQueries: true,
  });

  // Typing animation for AI messages
  useEffect(() => {
    if (isUser) { setDisplayedText(message.content); return; }
    let i = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      i++;
      setDisplayedText(message.content.slice(0, i));
      if (i >= message.content.length) clearInterval(interval);
    }, 8);
    return () => clearInterval(interval);
  }, [message.content, isUser]);

  // Auto-resize edit textarea
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    showToast('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ text: message.content });
      } else {
        await navigator.clipboard.writeText(message.content);
        showToast('Copied to clipboard');
      }
    } catch {}
  };

  // ChatGPT-style edit:
  // 1. Update message text  2. Delete everything after  3. Regenerate AI response
  const handleEditSave = async () => {
    if (!editText.trim() || editText.trim() === message.content) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateMessage({ variables: { id: message.id, content: editText.trim() } });
      await deleteMessagesAfter({ variables: { messageId: message.id } });
      await regenerateMessage({ variables: { messageId: message.id } });
      setIsEditing(false);
    } catch (err) {
      showToast('Edit failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); }
    if (e.key === 'Escape') { setEditText(message.content); setIsEditing(false); }
  };

  let formattedTime = '';
  if (message.createdAt) {
    const date = new Date(Number(message.createdAt) || message.createdAt);
    if (!isNaN(date.getTime())) formattedTime = format(date, 'HH:mm');
  }

  if (!message.content?.trim()) return null;

  return (
    <div className={`group mb-6 flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-lg">
          AI
        </div>
      )}

      <div className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl ${
        isUser
          ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white shadow-lg'
          : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-white/10'
      }`}>

        {/* Message content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={saving}
                rows={1}
                className="w-full bg-transparent border-b border-purple-400 outline-none resize-none text-white py-1 disabled:opacity-60"
                style={{ overflow: 'hidden' }}
              />
              <div className="flex gap-3 justify-end items-center">
                {saving && <span className="text-xs text-white/60 animate-pulse">Saving…</span>}
                <button
                  onClick={() => { setEditText(message.content); setIsEditing(false); }}
                  disabled={saving}
                  className="text-xs text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={saving || !editText.trim()}
                  className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
                >
                  Save & Regenerate
                </button>
              </div>
            </div>
          ) : (
            <ReactMarkdown
              components={{
                code(props) {
                  const { children, className } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-black/20 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                  );
                },
              }}
            >
              {displayedText}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        {formattedTime && !isEditing && (
          <p className={`text-[10px] mt-1.5 ${isUser ? 'text-white/50' : 'text-gray-400'}`}>{formattedTime}</p>
        )}

        {/* Reactions (AI messages only) */}
        {!isEditing && !isUser && (
          <div className="flex gap-1 mt-2">
            {[['like','👍'],['Fire','🔥'],['100','💯'],['love','💗']].map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => onReact(message.id, type)}
                className={`text-sm px-1.5 py-0.5 rounded-lg transition-all ${
                  reactions?.[message.id] === type ? 'bg-purple-600/40 scale-110' : 'hover:bg-black/10 opacity-60 hover:opacity-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Hover actions */}
        {!isEditing && (
          <div className="hidden group-hover:flex gap-1 mt-2 flex-wrap">
            <button onClick={handleCopy} title="Copy"
              className={`p-1.5 rounded-lg transition-all ${isUser ? 'text-white/70 hover:bg-white/20' : 'text-gray-400 hover:bg-black/10'}`}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            <button onClick={handleShare} title="Share"
              className={`p-1.5 rounded-lg transition-all ${isUser ? 'text-white/70 hover:bg-white/20' : 'text-gray-400 hover:bg-black/10'}`}>
              <Share2 size={13} />
            </button>
            {isUser && (
              <button onClick={() => setIsEditing(true)} title="Edit"
                className="p-1.5 rounded-lg text-white/70 hover:bg-white/20 transition-all">
                <Pencil size={13} />
              </button>
            )}
            {!isUser && (
              <button onClick={onRetry} title="Try again"
                className="p-1.5 rounded-lg text-gray-400 hover:bg-black/10 hover:text-purple-500 transition-all flex items-center gap-1 text-xs">
                <RefreshCw size={13} /> Retry
              </button>
            )}
            <button onClick={onDelete} title="Delete"
              className={`p-1.5 rounded-lg transition-all ${isUser ? 'text-white/70 hover:bg-red-500/30' : 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10'}`}>
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
          U
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-4 py-2 rounded-xl shadow-lg z-50 text-sm">
          {toast}
        </div>
      )}
    </div>
  );
};
