import React, { useState, useEffect, useRef } from 'react';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { useMutation } from '@apollo/client';
import { DELETE_MESSAGE, DELETE_MESSAGES_AFTER, REGENERATE_MESSAGE, GET_MESSAGES } from '../../graphql/queries';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt?: string;
}

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  conversationId: string | null;
  onPromptClick: (prompt: string) => void;
}

const STARTERS = [
  'Build a React login page with Tailwind',
  'Explain GraphQL subscriptions',
  'Write a MongoDB Mongoose schema',
  'Debug my JavaScript async code',
  'Design a REST API architecture',
  'Create a Node.js Express server',
  'Optimize my React app performance',
  'Explain TypeScript generics with examples',
];

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, conversationId, onPromptClick }) => {
  const [reactions, setReactions] = useState<Record<string, string>>({});
  const bottomRef = useRef<HTMLDivElement>(null);

  const refetchConfig = conversationId
    ? [{ query: GET_MESSAGES, variables: { conversationId } }]
    : [];

  const [deleteMessage] = useMutation(DELETE_MESSAGE, {
    refetchQueries: refetchConfig,
    awaitRefetchQueries: true,
  });
  const [deleteMessagesAfter] = useMutation(DELETE_MESSAGES_AFTER);
  const [regenerateMessage] = useMutation(REGENERATE_MESSAGE, {
    refetchQueries: refetchConfig,
    awaitRefetchQueries: true,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Try Again: find preceding user message, delete old AI response, regenerate
  // No new user message is created — this is the key fix
  const handleRetry = async (aiMessageId: string) => {
    const index = messages.findIndex((m) => m.id === aiMessageId);
    if (index < 0) return;
    const prevUser = [...messages].slice(0, index).reverse().find((m) => m.role === 'user');
    if (!prevUser) return;
    try {
      await deleteMessagesAfter({ variables: { messageId: prevUser.id } });
      await regenerateMessage({ variables: { messageId: prevUser.id } });
    } catch (err) {
      console.error('Retry failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMessage({ variables: { id } });
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 bg-gray-50 dark:bg-[#0f172a]">
      {messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white font-bold text-2xl shadow-xl mb-6">
            M
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 text-center">
            What can I help with?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 text-center text-sm">
            Ask anything — coding, design, writing, business, or debugging.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            {STARTERS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => onPromptClick(prompt)}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl p-4 text-left transition-all duration-200 group"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-purple-700 dark:group-hover:text-purple-300">
                  {prompt}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              conversationId={conversationId || ''}
              reactions={reactions}
              onReact={(id, type) => setReactions((p) => ({ ...p, [id]: p[id] === type ? '' : type }))}
              onDelete={() => handleDelete(message.id)}
              onRetry={message.role === 'assistant' ? () => handleRetry(message.id) : undefined}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};
