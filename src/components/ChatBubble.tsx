import React from 'react';
import { motion } from 'framer-motion';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: string;
  hasResources?: boolean;
  resources?: {
    title: string;
    url: string;
    type: 'article' | 'contact' | 'guide';
  }[];
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isUser,
  timestamp,
  hasResources = false,
  resources = [],
}) => {
  const bubbleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      initial="hidden"
      animate="visible"
      variants={bubbleVariants}
    >
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`chat-bubble ${
            isUser ? 'chat-bubble-user' : 'chat-bubble-ai'
          }`}
        >
          {!isUser && (
            <div className="flex items-center mb-2">
              <div className="w-7 h-7 bg-secondary-200 rounded-full flex items-center justify-center mr-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="w-4 h-4 text-secondary-700"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <span className="font-medium text-secondary-800">AI Mental Health</span>
            </div>
          )}
          
          <div className="whitespace-pre-wrap">{message}</div>
          
          {!isUser && hasResources && resources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-secondary-200">
              <h4 className="text-sm font-semibold mb-2 text-secondary-700">Recursos recomendados:</h4>
              <ul className="space-y-2">
                {resources.map((resource, index) => (
                  <li key={index}>
                    <a 
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm flex items-center text-primary-600 hover:text-primary-700"
                    >
                      <span className="mr-1">
                        {resource.type === 'article' && '📄'}
                        {resource.type === 'contact' && '☎️'}
                        {resource.type === 'guide' && '📚'}
                      </span>
                      {resource.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {!isUser && (
            <div className="mt-3 text-xs text-neutral-500 italic">
              Este asistente no sustituye a un profesional de la salud mental.
            </div>
          )}
        </div>
        
        {timestamp && (
          <div className="text-xs text-neutral-500 mt-1">{timestamp}</div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble; 