'use client';

import React from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface ChatToggleProps {
  isChatVisible: boolean;
  toggleChatVisibility: () => void;
  conversationActive: boolean;
}

const ChatToggle: React.FC<ChatToggleProps> = ({
  isChatVisible,
  toggleChatVisibility,
  conversationActive
}) => {
  if (!conversationActive) return null;

  return (
    <button
        onClick={toggleChatVisibility}
        className={`absolute top-1/2 left-2 transform -translate-y-1/2 z-30 p-2 bg-neutral-200 dark:bg-neutral-700 rounded-full shadow-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-opacity duration-300 ease-in-out`}
        aria-label={isChatVisible ? "Ocultar chat" : "Mostrar chat"}
    >
        {isChatVisible ? (
            <ChevronsLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
        ) : (
            <ChevronsRight className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
        )}
    </button>
  );
};

export default ChatToggle; 