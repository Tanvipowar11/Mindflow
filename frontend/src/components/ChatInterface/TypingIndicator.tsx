import React from 'react';

export const TypingIndicator: React.FC = () => (
  <div className="flex items-start gap-3 mb-6">
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
      AI
    </div>
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 px-4 py-3 rounded-2xl">
      <div className="flex items-center gap-1.5 h-5">
        {[0,1,2].map((i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-purple-500"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }`}</style>
    </div>
  </div>
);
