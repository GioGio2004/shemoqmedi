'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type LiquidContextType = {
  isSplitting: boolean;
  splitPosition: number;
  chatResponse: string;
  isProcessing: boolean;
  startSplit: (position: number) => void;
  endSplit: () => void;
  setResponse: (response: string) => void;
  appendResponse: (chunk: string) => void;
  setIsProcessing: (loading: boolean) => void;
  query: string;
  setQuery: (q: string) => void;
};

const LiquidContext = createContext<LiquidContextType | undefined>(undefined);

export function LiquidProvider({ children }: { children: ReactNode }) {
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(0);
  const [chatResponse, listChatResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [query, setQuery] = useState('');

  const startSplit = (position: number) => {
    setSplitPosition(position);
    setIsSplitting(true);
  };

  const endSplit = () => {
    setIsSplitting(false);
    // Optional: clear response after closing or keep it
    // listChatResponse(''); 
    // setQuery('');
  };

  const setResponse = (response: string) => {
    listChatResponse(response);
  };

  const appendResponse = (chunk: string) => {
    listChatResponse((prev) => prev + chunk);
  };

  return (
    <LiquidContext.Provider
      value={{
        isSplitting,
        splitPosition,
        chatResponse,
        isProcessing,
        startSplit,
        endSplit,
        setResponse,
        appendResponse,
        setIsProcessing,
        query,
        setQuery,
      }}
    >
      {children}
    </LiquidContext.Provider>
  );
}

export function useLiquid() {
  const context = useContext(LiquidContext);
  if (context === undefined) {
    throw new Error('useLiquid must be used within a LiquidProvider');
  }
  return context;
}
