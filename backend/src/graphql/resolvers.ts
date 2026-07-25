import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import * as jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Groq from 'groq-sdk';
import { PubSub } from 'graphql-subscriptions';

const SYSTEM_PROMPT = `You are MindFlow, a premium AI assistant. Be helpful, concise, and accurate.
Format code in markdown code blocks. If unsure, say so. Never make up facts.`;

const pubsub = new PubSub();

const getGroqResponse = async (
  content: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<string> => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10),
    { role: 'user', content },
  ];
  const response = await groq.chat.completions.create({
    messages,
    model: 'llama-3.3-70b-versatile',
    max_tokens: 2048,
    temperature: 0.7,
  });
  return response.choices[0]?.message?.content || 'No response generated';
};

const getHistory = async (conversationId: string, beforeDate?: Date) => {
  const query: any = { conversationId };
  if (beforeDate) query.createdAt = { $lt: beforeDate };
  const msgs = await Message.find(query).sort({ createdAt: 1 }).limit(20);
  return msgs.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content || '' }));
};

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { userId }: any) => {
      if (!userId) throw new Error('Not authenticated');
      return User.findOne({ id: userId });
    },
    conversations: async (_: any, { limit = 50, offset = 0 }: any, { userId }: any) => {
      if (!userId) throw new Error('Not authenticated');
      return Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(limit).skip(offset);
    },
    conversation: async (_: any, { id }: any, { userId }: any) => {
      if (!userId) throw new Error('Not authenticated');
      return Conversation.findOne({ id, userId });
    },
    messages: async (_: any, { conversationId }: any, { userId }: any) => {
      if (!userId) throw new Error('Not authenticated');
      return Message.find({ conversationId }).sort({ createdAt: 1 });
    },
  },

  Mutation: {
    signup: async (_: any, { email, password, name }: any) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('Email already in use');
      const hashed = await bcryptjs.hash(password, 10);
      const user = new User({ id: uuidv4(), email, password: hashed, name });
      await user.save();
      const token = (jwt as any).sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
      return { token, user };
    },

    login: async (_: any, { email, password }: any) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid credentials');
      const valid = await bcryptjs.compare(password, user.password);
      if (!valid) throw new Error('Invalid credentials');
      const token = (jwt as any).sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
      return { token, user };
    },

    createConversation: async (_: any, { title }: any, { userId }: any) => {
      if (!userId) throw new Error('Not authenticated');
      const conv = new Conversation({ id: uuidv4(), userId, title });
      await conv.save();
      return conv;
    },

    updateConversation: async (_: any, { id, title }: any, { userId }: any) => {
      if (!userId) throw new Error('Not authenticated');
      return Conversation.findOneAndUpdate({ id, userId }, { title, updatedAt: new Date() }, { new: true });
    },

    deleteConversation: async (_: any, { id }: any, { userId }: any) => {
      if (!userId) throw new Error('Not authenticated');
      await Conversation.deleteOne({ id, userId });
      await Message.deleteMany({ conversationId: id });
      return true;
    },

    // FIXED: saves user msg + AI response exactly once. Auto-sets title.
    sendMessage: async (_: any, { conversationId, content }: any, { userId, pubsub: ctxPubsub }: any) => {
      if (!userId) throw new Error('Not authenticated');
      if (!content?.trim()) throw new Error('Message cannot be empty');
      const ps = ctxPubsub || pubsub;

      const userMsg = new Message({ id: uuidv4(), conversationId, userId, content: content.trim(), role: 'user' });
      await userMsg.save();
      ps.publish(`MESSAGE_ADDED_${conversationId}`, { messageAdded: userMsg });

      const history = await getHistory(conversationId, userMsg.createdAt);
      let aiContent = '';
      try {
        aiContent = await getGroqResponse(content.trim(), history);
      } catch {
        aiContent = 'Sorry, I had trouble generating a response. Please try again.';
      }
      if (!aiContent.trim()) aiContent = 'I could not generate a response. Please try again.';

      const aiMsg = new Message({ id: uuidv4(), conversationId, userId, content: aiContent, role: 'assistant' });
      await aiMsg.save();
      ps.publish(`MESSAGE_ADDED_${conversationId}`, { messageAdded: aiMsg });

      // Auto-set title from first message
      const conv = await Conversation.findOne({ id: conversationId });
      const updates: any = { updatedAt: new Date() };
      if (conv && conv.title === 'New Chat') {
        updates.title = content.trim().split(' ').slice(0, 6).join(' ');
      }
      await Conversation.updateOne({ id: conversationId }, updates);

      return userMsg;
    },

    // FIXED: deletes user msg + the following AI response together
    deleteMessage: async (_: any, { id }: any) => {
      const msg = await Message.findOne({ id });
      if (!msg) return false;
      await Message.deleteOne({ id });
      if (msg.role === 'user') {
        const nextAI = await Message.findOne({
          conversationId: msg.conversationId,
          role: 'assistant',
          createdAt: { $gt: msg.createdAt },
        }).sort({ createdAt: 1 });
        if (nextAI) await Message.deleteOne({ id: nextAI.id });
      }
      return true;
    },

    updateMessage: async (_: any, { id, content }: any) => {
      if (!content?.trim()) throw new Error('Content cannot be empty');
      return Message.findOneAndUpdate({ id }, { content: content.trim() }, { new: true });
    },

    // Deletes all messages after a given message (used during edit)
    deleteMessagesAfter: async (_: any, { messageId }: any) => {
      const msg = await Message.findOne({ id: messageId });
      if (!msg) return false;
      await Message.deleteMany({ conversationId: msg.conversationId, createdAt: { $gt: msg.createdAt } });
      return true;
    },

    // FIXED: pass USER message id. Generates new AI response, no duplicate user msg.
    regenerateMessage: async (_: any, { messageId }: any, { userId }: any) => {
      const userMsg = await Message.findOne({ id: messageId });
      if (!userMsg) throw new Error('Message not found');
      if (userMsg.role !== 'user') throw new Error('Pass the user message id to regenerate');

      // Delete any existing AI response right after this user message
      const existingAI = await Message.findOne({
        conversationId: userMsg.conversationId,
        role: 'assistant',
        createdAt: { $gt: userMsg.createdAt },
      }).sort({ createdAt: 1 });
      if (existingAI) await Message.deleteOne({ id: existingAI.id });

      const history = await getHistory(userMsg.conversationId, userMsg.createdAt);
      let aiContent = '';
      try {
        aiContent = await getGroqResponse(userMsg.content || '', history);
      } catch {
        aiContent = 'Sorry, I had trouble generating a response. Please try again.';
      }
      if (!aiContent.trim()) aiContent = 'Could not generate a response. Please try again.';

      const aiMsg = new Message({ id: uuidv4(), conversationId: userMsg.conversationId, userId, content: aiContent, role: 'assistant' });
      await aiMsg.save();
      await Conversation.updateOne({ id: userMsg.conversationId }, { updatedAt: new Date() });
      return aiMsg;
    },
  },

  Subscription: {
    messageAdded: {
      subscribe: (_: any, { conversationId }: any, { pubsub: ctxPubsub }: any) => {
        const ps = ctxPubsub || pubsub;
        return ps.asyncIterator([`MESSAGE_ADDED_${conversationId}`]);
      },
    },
  },
};