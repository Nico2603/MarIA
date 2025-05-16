'use client';

import React from 'react';
import { Loader2, VideoOff } from 'lucide-react';

const VideoPanelSkeleton: React.FC<{ isChatVisible?: boolean }> = ({ isChatVisible }) => {
  return (
    <div 
      className={`
        relative 
        ${isChatVisible ? 'w-full md:w-2/3' : 'w-full'} 
        h-full 
        bg-gray-800 
        flex flex-col items-center justify-center 
        transition-all duration-300 ease-in-out
        p-4
      `}
    >
      <div className="aspect-video w-full max-w-3xl bg-gray-700 rounded-lg flex items-center justify-center mb-4">
        <VideoOff className="w-16 h-16 text-gray-500" />
      </div>
      <div className="w-full max-w-3xl flex items-center justify-between p-2 bg-gray-700 rounded-md">
        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
        <div className="h-6 w-24 bg-gray-600 rounded"></div>
        <div className="h-10 w-10 bg-gray-600 rounded-full"></div>
      </div>
    </div>
  );
};

export default VideoPanelSkeleton; 