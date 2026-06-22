"use client";

import { useEffect, useState, ReactNode } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex-helpers-api";
import { useGuest } from "../../hooks/useGuest";

interface MultiplayerWrapperProps {
  orgId: string;
  tagId: string;
  children: (props: { guestId: string | null; sessionId: string | null }) => ReactNode;
}

export function MultiplayerWrapper({ orgId, tagId, children }: MultiplayerWrapperProps) {
  const guestId = useGuest(tagId);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const joinSession = useMutation(api.tableSessions.joinSession);

  useEffect(() => {
    if (!guestId || !orgId || !tagId || sessionId || isJoining) return;

    let isMounted = true;
    setIsJoining(true);

    joinSession({ orgId, tagId: tagId as any, guestId })
      .then((id) => {
        if (isMounted) {
          setSessionId(id);
          setIsJoining(false);
        }
      })
      .catch((err) => {
        console.error("Failed to join session:", err);
        if (isMounted) setIsJoining(false);
      });

    return () => { isMounted = false; };
  }, [guestId, orgId, tagId, sessionId, isJoining, joinSession]);

  return <>{children({ guestId, sessionId })}</>;
}
