'use client';

import React from 'react';
import VoiceChatContainer from '@/components/VoiceChat/VoiceChatContainer';
import { ErrorProvider } from '@/contexts/ErrorContext';

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ErrorProvider>
        <VoiceChatContainer />
      </ErrorProvider>
    </div>
  );
} 