import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Layout/Sidebar';
import { Header } from '../components/Layout/Header';
import { ChatWindow } from '../components/ChatInterface/ChatWindow';
import { ChatInput } from '../components/ChatInterface/ChatInput';
import { useSubscription } from '@apollo/client';
import {
  GET_CONVERSATIONS, GET_MESSAGES, SEND_MESSAGE, GET_ME,
  CREATE_CONVERSATION, DELETE_CONVERSATION, UPDATE_CONVERSATION, MESSAGE_SUBSCRIPTION,
} from '../graphql/queries';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data: meData } = useQuery(GET_ME, { errorPolicy: 'ignore' });
  const { data: convData, refetch: refetchConvs } = useQuery(GET_CONVERSATIONS, {
    fetchPolicy: 'cache-and-network',
  });

  // Auto-select first conversation
  useEffect(() => {
    if (!activeConversationId && convData?.conversations?.length > 0) {
      setActiveConversationId(convData.conversations[0].id);
    }
  }, [convData, activeConversationId]);

  const { data: msgData, loading: msgsLoading } = useQuery(GET_MESSAGES, {
    variables: { conversationId: activeConversationId },
    skip: !activeConversationId,
    fetchPolicy: 'cache-and-network',
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE, {
    refetchQueries: [
      { query: GET_MESSAGES, variables: { conversationId: activeConversationId } },
      { query: GET_CONVERSATIONS },
    ],
    awaitRefetchQueries: true,
  });

  const [createConversation] = useMutation(CREATE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }],
  });

  const [deleteConversation] = useMutation(DELETE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }],
  });

  const [updateConversation] = useMutation(UPDATE_CONVERSATION, {
    refetchQueries: [{ query: GET_CONVERSATIONS }],
  });

  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { conversationId: activeConversationId },
    skip: !activeConversationId,
  });

  const handleSendMessage = async (content: string) => {
    let convId = activeConversationId;
    try {
      if (!convId) {
        const result = await createConversation({ variables: { title: 'New Chat' } });
        convId = result.data.createConversation.id;
        setActiveConversationId(convId);
      }
      await sendMessage({ variables: { conversationId: convId, content } });
      refetchConvs();
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  const handleNew = async () => {
    try {
      const result = await createConversation({ variables: { title: 'New Chat' } });
      setActiveConversationId(result.data.createConversation.id);
      setMobileSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConversation({ variables: { id } });
      if (activeConversationId === id) {
        const remaining = convData?.conversations?.filter((c: any) => c.id !== id);
        setActiveConversationId(remaining?.[0]?.id || null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (id: string, title: string) => {
    try {
      await updateConversation({ variables: { id, title } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const messages = msgData?.messages || [];
  const conversations = convData?.conversations || [];

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-[#0f172a] overflow-hidden">
      <Header
        onLogout={handleLogout}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        userName={meData?.me?.name}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileSidebarOpen(false)} />
        )}

        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onNew={handleNew}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </div>

        {/* Mobile sidebar */}
        <div className={`fixed left-0 top-14 bottom-0 z-40 md:hidden transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={(id) => { setActiveConversationId(id); setMobileSidebarOpen(false); }}
            onNew={handleNew}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow
            messages={messages}
            isLoading={sending}
            conversationId={activeConversationId}
            onPromptClick={handleSendMessage}
          />
          <ChatInput onSendMessage={handleSendMessage} disabled={sending} />
        </div>
      </div>
    </div>
  );
}
