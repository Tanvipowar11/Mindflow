import React, { useState, useRef, useEffect } from 'react';
import { SendHorizonal, Mic, MicOff, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: number }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSendMessage(message.trim());
    setMessage('');
    setAttachedFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported in this browser.'); return; }
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.onstart = () => setIsRecording(true);
    rec.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setMessage(t);
    };
    rec.onerror = () => setIsRecording(false);
    rec.onend = () => setIsRecording(false);
    recognitionRef.current = rec;
    rec.start();
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles((p) => [...p, ...files.map((f) => ({ name: f.name, size: f.size }))]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSend = message.trim().length > 0 && !disabled;

  return (
    <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f172a] px-4 md:px-6 pt-3 pb-4 flex-shrink-0">
      {/* Attached files */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5 bg-purple-900/30 border border-purple-500/30 rounded-lg px-2.5 py-1 text-xs text-purple-300">
              <span className="max-w-[120px] truncate">{f.name}</span>
              <button onClick={() => setAttachedFiles((p) => p.filter((_, j) => j !== i))} className="text-purple-400 hover:text-white">
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="relative bg-gray-100 dark:bg-slate-800 rounded-2xl ring-1 ring-gray-200 dark:ring-white/10 focus-within:ring-2 focus-within:ring-purple-500/60 transition-all">
        {/* Left buttons */}
        <div className="absolute left-3 bottom-3 flex gap-1">
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled}
            title="Attach file"
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-500 hover:bg-purple-500/10 transition-all disabled:opacity-40">
            <Paperclip size={17} />
          </button>
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf,.txt,.doc,.docx" className="hidden" onChange={handleFiles} />
          <button type="button" onClick={toggleRecording} disabled={disabled}
            title={isRecording ? 'Stop recording' : 'Voice input'}
            className={`p-1.5 rounded-lg transition-all disabled:opacity-40 ${
              isRecording ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-purple-500 hover:bg-purple-500/10'
            }`}>
            {isRecording ? <MicOff size={17} /> : <Mic size={17} />}
          </button>
        </div>

        <textarea
          ref={textareaRef}
          value={message}
          disabled={disabled}
          placeholder={isRecording ? 'Listening…' : 'Ask MindFlow anything…'}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          rows={1}
          className="w-full rounded-2xl bg-transparent pl-20 pr-14 py-4 resize-none focus:outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 min-h-[60px] max-h-[200px] overflow-y-auto"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`absolute right-3 bottom-3 rounded-full p-2.5 transition-all duration-200 ${
            canSend
              ? 'bg-gradient-to-br from-purple-600 to-violet-700 text-white hover:from-purple-700 hover:to-violet-800 shadow-lg shadow-purple-500/20'
              : 'bg-gray-200 dark:bg-slate-700 text-gray-400 cursor-not-allowed'
          }`}>
          <SendHorizonal size={17} />
        </button>
      </div>
      <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1.5 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};
