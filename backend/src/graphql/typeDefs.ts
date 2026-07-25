import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    avatar: String
    createdAt: String!
  }

  type Message {
    id: ID!
    conversationId: ID!
    content: String!
    role: String!
    createdAt: String!
  }

  type Conversation {
    id: ID!
    userId: ID!
    title: String!
    messages: [Message!]!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User!
    conversations(limit: Int, offset: Int): [Conversation!]!
    conversation(id: ID!): Conversation
    messages(conversationId: ID!): [Message!]!
  }

  type Mutation {
    signup(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!

    createConversation(title: String!): Conversation!
    updateConversation(id: ID!, title: String!): Conversation!
    deleteConversation(id: ID!): Boolean!

    sendMessage(conversationId: ID!, content: String!): Message!

    deleteMessage(id: ID!): Boolean
    updateMessage(id: ID!, content: String!): Message
    deleteMessagesAfter(messageId: ID!): Boolean
    regenerateMessage(messageId: ID!): Message!
  }

  type Subscription {
    messageAdded(conversationId: ID!): Message!
    typingIndicator(conversationId: ID!): String!
  }
`;
