import { useCallback, useEffect, useRef, useState } from 'react';

import { emitTypingEvent, subscribeToSocket } from '@/shared';

const TYPING_TIMEOUT_MS = 1500;

type Params = {
  conversationId: string;
  userId: string;
};

type TypingController = {
  partnerIsTyping: boolean;
  notifyTyping: () => void;
  stopTyping: () => void;
};

export function useTypingController({ conversationId, userId }: Params): TypingController {
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sendTypingEvent = useCallback(
    (isTyping: boolean): void => {
      emitTypingEvent({ conversationId, userId }, isTyping);
    },
    [conversationId, userId],
  );

  const stopTyping = useCallback((): void => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }

    sendTypingEvent(false);
  }, [sendTypingEvent]);

  const notifyTyping = useCallback((): void => {
    sendTypingEvent(true);

    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
    }

    stopTimerRef.current = setTimeout(() => {
      stopTimerRef.current = null;
      sendTypingEvent(false);
    }, TYPING_TIMEOUT_MS);
  }, [sendTypingEvent]);

  useEffect(() => {
    setPartnerIsTyping(false);

    const unsubscribeStart = subscribeToSocket('typing:start', (event) => {
      if (event.conversationId === conversationId && event.userId !== userId) {
        setPartnerIsTyping(true);
      }
    });
    const unsubscribeStop = subscribeToSocket('typing:stop', (event) => {
      if (event.conversationId === conversationId && event.userId !== userId) {
        setPartnerIsTyping(false);
      }
    });

    return () => {
      unsubscribeStart();
      unsubscribeStop();

      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
    };
  }, [conversationId, userId]);

  return { partnerIsTyping, notifyTyping, stopTyping };
}
