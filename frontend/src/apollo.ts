import {
  ApolloClient, InMemoryCache, HttpLink, split,
  ApolloLink, Observable
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL || 'http://localhost:4000/graphql',
});

// Add auth token to every request
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  operation.setContext({
    headers: { authorization: token ? `Bearer ${token}` : '' },
  });
  return forward(operation);
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:4000/graphql',
    connectionParams: () => ({
      authorization: `Bearer ${localStorage.getItem('token')}`,
    }),
  })
);

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});