'use client';

import React, { FormEvent } from 'react';
import { Send, Mic, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChatInputProps {
  textInput: string;
  setTextInput: (text: string) => void;
  handleSendTextMessage: (text: string) => void;
  handleStartListening: () => void;
  handleStopListening: () => void;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  isSessionClosed: boolean;
  conversationActive: boolean;
  isPushToTalkActive: boolean;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  textInput,
  setTextInput,
  handleSendTextMessage,
  handleStartListening,
  handleStopListening,
  isListening,
  isProcessing,
  isSpeaking,
  isThinking,
  isSessionClosed,
  conversationActive,
  isPushToTalkActive,
  textAreaRef,
  onSpeechStart,
  onSpeechEnd,
}) => {
  const safeTextInput = textInput ?? '';

  return (
    <div className="p-4 bg-transparent">
      <form onSubmit={(e) => { 
        e.preventDefault(); 
        if (safeTextInput.trim() && conversationActive && !isSessionClosed && !isProcessing && !isSpeaking && !isThinking) {
          console.log('[ChatInput] 📝 Enviando mensaje por formulario:', safeTextInput);
          handleSendTextMessage(safeTextInput);
        }
      }} className="flex items-center space-x-3">
        
        {/* Entrada de texto habilitada */}
        <textarea
          ref={textAreaRef}
          value={safeTextInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={
            !conversationActive ? "Inicia una conversación..." :
            isSessionClosed ? "Sesión finalizada." : 
            isListening ? "Escuchando..." :
            isProcessing ? "Procesando..." :
            isSpeaking ? "María está hablando..." :
            isThinking ? "María está pensando..." :
            "Escribe tu mensaje o pulsa [Espacio] para hablar..."
          }
          rows={1}
          className="flex-1 resize-none p-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700/80 text-neutral-800 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400 disabled:opacity-60 disabled:cursor-not-allowed text-xs shadow-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (safeTextInput.trim() && conversationActive && !isSessionClosed && !isProcessing && !isSpeaking && !isThinking) {
                console.log('[ChatInput] 📝 Enviando mensaje por Enter:', safeTextInput);
                handleSendTextMessage(safeTextInput);
              }
            }
            if (e.code === 'Space') {
              e.stopPropagation();
            }
          }}
          disabled={!conversationActive || isSessionClosed || isProcessing || isSpeaking || isThinking}
        />
        
        {/* Botón de enviar texto */}
        <button
          type="submit"
          disabled={!conversationActive || isSessionClosed || isProcessing || isSpeaking || isThinking || !safeTextInput.trim()}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-md ${
            (!conversationActive || isSessionClosed || isProcessing || isSpeaking || isThinking || !safeTextInput.trim()) 
              ? 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 cursor-not-allowed opacity-50' 
              : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
          }`}
          aria-label="Enviar mensaje"
        >
          <Send className="h-5 w-5" />
        </button>

        {/* Botón de micrófono */}
        <button 
          type="button"
          onClick={isListening ? handleStopListening : handleStartListening} 
          disabled={!conversationActive || isSessionClosed || isProcessing || isSpeaking || isThinking}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 shadow-md ${ 
            isListening
            ? 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400' 
            : 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500'
          } ${ 
            (isPushToTalkActive) ? 'ring-4 ring-offset-0 ring-green-400 scale-110' : '' 
          } ${ 
            (!conversationActive || isSessionClosed || isProcessing || isSpeaking || isThinking) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={isListening ? "Detener micrófono" : "Activar micrófono"}
          onMouseDown={() => { console.log('[ChatInput] 🎤 Botón mic: mouse down'); onSpeechStart?.(); }}
          onMouseUp={() =>   { console.log('[ChatInput] 🎤 Botón mic: mouse up');   onSpeechEnd?.(); }}
          onTouchStart={() => { console.log('[ChatInput] 🎤 Botón mic: touch start'); onSpeechStart?.(); }}
          onTouchEnd={() =>   { console.log('[ChatInput] 🎤 Botón mic: touch end');   onSpeechEnd?.(); }}
        >
          {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
        </button>
      </form>
      
      {isSessionClosed ? (
        <div className="text-center mt-3">
          <Link 
            href="/settings/profile" 
            passHref 
            legacyBehavior
          >
            <Button 
              className="bg-secondary-600 hover:bg-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-800 transition-colors cursor-pointer"
            >
              Ver Historial en Perfil
            </Button>
          </Link>
        </div>
      ) : (
          <p className={`text-xs mt-2 text-center text-neutral-500 dark:text-neutral-400 ${!conversationActive ? 'opacity-50' : 'font-medium'}`}>
              {conversationActive ? 'Escribe un mensaje o mantén pulsada la tecla [Espacio] para hablar.' : 'Inicia la conversación para activar el chat.'}
          </p>
      )}
    </div>
  );
};

export default ChatInput; 