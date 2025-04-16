'use client';

import React from 'react';
import VoiceChatContainer from '@/components/VoiceChatContainer';

export default function ChatPage() {
  return (
    <div className="flex flex-1 min-h-[calc(100vh-64px)]">
      {/* Área principal del chat */}
      <div className="flex-1 flex flex-col relative">
        <VoiceChatContainer />
      </div>
      
      {/* Sidebar y Modales eliminados */}
    </div>
  );
} 