import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  suggestedQuestions?: string[];
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isProcessing,
  suggestedQuestions = [],
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSendMessage = () => {
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Reajustar altura del textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const toggleRecording = () => {
    // Simulamos grabación (aquí se integraría con Livekit o APIs de Speech-to-Text)
    setIsRecording(!isRecording);
    
    if (isRecording) {
      // Simulamos finalización de grabación con texto de ejemplo
      setTimeout(() => {
        setMessage(prev => prev + " Texto transcrito de ejemplo");
        setIsRecording(false);
      }, 1500);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question);
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea después de seleccionar una pregunta sugerida
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="border-t border-neutral-200 bg-white pt-4">
      {suggestedQuestions.length > 0 && (
        <div className="mb-4 flex flex-wrap justify-center gap-2">
          {suggestedQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedQuestion(question)}
              className="text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-3 py-1.5 rounded-full transition-colors duration-200"
            >
              {question}
            </button>
          ))}
        </div>
      )}
      
      <div className="relative rounded-xl border border-neutral-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje aquí..."
          className="w-full resize-none px-4 py-3 pr-16 focus:outline-none rounded-xl max-h-[150px]"
          rows={1}
          disabled={isProcessing}
        />
        
        <div className="absolute bottom-2 right-2 flex space-x-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleRecording}
            className={`p-2 rounded-full ${
              isRecording 
                ? 'bg-red-100 text-red-600' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
            disabled={isProcessing}
            title="Grabar mensaje de voz"
          >
            {isRecording ? (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </motion.div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSendMessage}
            className={`p-2 rounded-full ${
              message.trim() && !isProcessing
                ? 'bg-primary-500 text-white hover:bg-primary-600' 
                : 'bg-neutral-100 text-neutral-400'
            }`}
            disabled={!message.trim() || isProcessing}
            title="Enviar mensaje"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
            </svg>
          </motion.button>
        </div>
      </div>
      
      <div className="mt-2 text-xs text-center text-neutral-500">
        {isProcessing ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Procesando tu mensaje...</span>
          </div>
        ) : (
          <span>
            Recuerda que este asistente ofrece orientación inicial pero no sustituye a un profesional de la salud mental.
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatInput; 