'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import { VideoTrack } from '@livekit/components-react';
import type { ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';

interface VideoPanelProps {
  isChatVisible: boolean;
  tavusTrackInfo?: ActiveTrackInfo;
  isSpeaking: boolean;
  isListening: boolean;
  isProcessing: boolean;
  isThinking: boolean;
  isSessionClosed: boolean;
  conversationActive: boolean;
  handleStartListening: () => void;
  handleStopListening: () => void;
  isPushToTalkActive: boolean;
}

const VideoPanel: React.FC<VideoPanelProps> = ({
  isChatVisible,
  tavusTrackInfo,
  isSpeaking,
  isListening,
  isProcessing,
  isThinking,
  isSessionClosed,
  conversationActive,
  handleStartListening,
  handleStopListening,
  isPushToTalkActive,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center flex-1 min-h-0 bg-white dark:bg-neutral-800 transition-all duration-300 ease-in-out ${isChatVisible ? 'md:w-2/3' : 'w-full'}`}>
      <div className="relative w-full h-full overflow-hidden shadow-lg bg-black">
        {tavusTrackInfo?.participant && tavusTrackInfo.publication?.track && tavusTrackInfo.source ? (
          <VideoTrack
            trackRef={{
              participant: tavusTrackInfo.participant,
              publication: tavusTrackInfo.publication,
              source: tavusTrackInfo.source,
            }}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
            <span className="text-gray-500">Esperando vídeo del avatar…</span>
          </div>
        )}
        <StatusIndicator 
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            isThinking={isThinking}
            isSessionClosed={isSessionClosed}
            conversationActive={conversationActive}
        />
      </div>

      {!isChatVisible && conversationActive && !isSessionClosed && (
          <div className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 via-black/50 to-transparent pb-4 pt-12 pointer-events-none`}>
             <div className={`mx-auto px-4 max-w-md pointer-events-auto`}>
                <div className={`p-4 rounded-t-lg bg-transparent flex justify-center`}> 
                    <button 
                    type="button"
                    onClick={isListening ? handleStopListening : handleStartListening} 
                    disabled={isProcessing || isSpeaking || isThinking} 
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-lg ${ 
                        isListening
                        ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 scale-110' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
                    } ${ 
                        (isPushToTalkActive) ? 'ring-4 ring-offset-0 ring-green-400 scale-110' : ''
                    } ${ 
                        (isProcessing || isSpeaking || isThinking) ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                    aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
                    >
                    {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mic className="h-6 w-6" />}
                    </button>
                 </div>
                 <p className={`text-xs mt-1 text-center text-neutral-200 drop-shadow-sm pointer-events-none`}>
                        Mantén [Espacio] para hablar.
                    </p>
             </div>
          </div>
      )}
    </div>
  );
};

export default VideoPanel; 