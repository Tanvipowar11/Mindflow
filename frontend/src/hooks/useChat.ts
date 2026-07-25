import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_MESSAGES, SEND_MESSAGE } from '../graphql/queries';

export const useChat = (conversationId: string | null) => {
  const { data, loading } = useQuery(GET_MESSAGES, {
    variables: { conversationId },
    skip: !conversationId,
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

  const send = async (content: string) => {
    if (!conversationId || !content.trim()) return;
    await sendMessage({
      variables: { conversationId, content },
      refetchQueries: [{ query: GET_MESSAGES, variables: { conversationId } }],
    });
  };

  return {
    messages: data?.messages || [],
    loading: loading || sending,
    send,
  };
};