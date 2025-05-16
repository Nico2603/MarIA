'use client';

import React, { useRef, useEffect } from 'react';
import { Mic, Loader2 } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import RemoteTrackPlayer from './RemoteTrackPlayer';
import type { ActiveTrackInfo } from '@/hooks/voicechat/useLiveKitTrackManagement';
import { Track } from 'livekit-client';

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
  const fallbackVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (fallbackVideoRef.current) {
      if (!tavusTrackInfo) {
        const newSrc = '/videos/mute.mp4';
        const currentBaseSrc = fallbackVideoRef.current.currentSrc 
          ? fallbackVideoRef.current.currentSrc.substring(fallbackVideoRef.current.currentSrc.lastIndexOf('/') + 1) 
          : "";
        if (currentBaseSrc !== 'mute.mp4' || fallbackVideoRef.current.paused) {
          fallbackVideoRef.current.src = newSrc;
          fallbackVideoRef.current.load();
          fallbackVideoRef.current.play().catch(e => {
            if (e.name !== 'AbortError') {
              console.error("Error playing fallback video:", e);
            }
          });
        }
      } else {
        if (!fallbackVideoRef.current.paused) {
            fallbackVideoRef.current.pause();
        }
      }
    }
  }, [tavusTrackInfo]);

  return (
    <div className={`relative flex flex-col items-center justify-center flex-1 h-full bg-white dark:bg-neutral-800 transition-all duration-300 ease-in-out p-4 md:p-6 ${isChatVisible ? 'md:w-2/3' : 'w-full'}`}>
      <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg bg-black">
        {tavusTrackInfo && tavusTrackInfo.kind === Track.Kind.Video ? (
          <RemoteTrackPlayer
            key={tavusTrackInfo.id}
            track={tavusTrackInfo.trackRef}
            className="w-full h-full object-contain"
            autoPlay
            playsInline
          />
        ) : (
          <video
            ref={fallbackVideoRef}
            key={isSpeaking && !tavusTrackInfo ? 'speaking-fallback' : 'idle-fallback'}
            autoPlay
            loop
            muted
            playsInline
            className={`w-full h-full transition-all duration-300 ease-in-out ${isChatVisible || !conversationActive ? 'object-cover' : 'object-contain'}`}
          >
            Tu navegador no soporta el elemento de video.
          </video>
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