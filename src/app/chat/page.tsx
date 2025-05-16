'use client';

import React from 'react';
import VoiceChatContainer from '@/components/VoiceChat/VoiceChatContainer';
import { ErrorProvider } from '@/contexts/ErrorContext';

export default function ChatPage() {
  return (
    <div className="h-full">
      <ErrorProvider>
        <VoiceChatContainer />
      </ErrorProvider>
    </div>
  );
} 