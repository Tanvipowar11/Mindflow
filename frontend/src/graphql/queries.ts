import { gql } from '@apollo/client';

export const GET_CONVERSATIONS = gql`
  query GetConversations($limit: Int, $offset: Int) {
    conversations(limit: $limit, offset: $offset) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const GET_MESSAGES = gql`
  query GetMessages($conversationId: ID!) {
    messages(conversationId: $conversationId) {
      id
      content
      role
      createdAt
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation SendMessage($conversationId: ID!, $content: String!) {
    sendMessage(conversationId: $conversationId, content: $content) {
      id
      content
      role
      createdAt
    }
  }
`;

export const MESSAGE_SUBSCRIPTION = gql`
  subscription OnMessageAdded($conversationId: ID!) {
    messageAdded(conversationId: $conversationId) {
      id
      content
      role
      createdAt
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id email name }
    }
  }
`;

export const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
      user { id email name }
    }
  }
`;

export const CREATE_CONVERSATION = gql`
  mutation CreateConversation($title: String!) {
    createConversation(title: $title) {
      id
      title
      createdAt
      updatedAt
    }
  }
`;

export const DELETE_CONVERSATION = gql`
  mutation DeleteConversation($id: ID!) {
    deleteConversation(id: $id)
  }
`;

export const UPDATE_CONVERSATION = gql`
  mutation UpdateConversation($id: ID!, $title: String!) {
    updateConversation(id: $id, title: $title) {
      id
      title
      updatedAt
    }
  }
`;

export const DELETE_MESSAGE = gql`
  mutation DeleteMessage($id: ID!) {
    deleteMessage(id: $id)
  }
`;

export const UPDATE_MESSAGE = gql`
  mutation UpdateMessage($id: ID!, $content: String!) {
    updateMessage(id: $id, content: $content) {
      id
      content
    }
  }
`;

export const DELETE_MESSAGES_AFTER = gql`
  mutation DeleteMessagesAfter($messageId: ID!) {
    deleteMessagesAfter(messageId: $messageId)
  }
`;

export const REGENERATE_MESSAGE = gql`
  mutation RegenerateMessage($messageId: ID!) {
    regenerateMessage(messageId: $messageId) {
      id
      content
      role
      createdAt
    }
  }
`;
