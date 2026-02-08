import React, { useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, FileText, Loader2 } from 'lucide-react';
import { ChatMessage, FileMetadata } from '../types';

interface ChatAreaProps {
  history: ChatMessage[];
  isLoading: boolean;
  input: string;
  setInput: (val: string) => void;
  onSend: () => void;
  activeFiles: Set<string>;
  allFiles: FileMetadata[];
}

const ChatArea: React.FC<ChatAreaProps> = ({
  history,
  isLoading,
  input,
  setInput,
  onSend,
  activeFiles,
  allFiles,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Get active file objects for display
  const activeFileObjects = allFiles.filter(f => activeFiles.has(f.uri));

  return (
    <div className="flex flex-col h-full bg-gray-950 w-full relative">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {history.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-2">
              <Bot className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-lg font-medium text-gray-400">How can I help you today?</p>
            <p className="text-sm max-w-md text-center text-gray-600">
              Upload documents in the sidebar and select them to chat with your knowledge base.
            </p>
          </div>
        )}
        
        {history.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-4xl mx-auto ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-sm'
                } ${msg.isError ? 'border-red-500 bg-red-900/10 text-red-200' : ''}`}
              >
                {msg.text}
              </div>
              {msg.isError && (
                <span className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Error generating response
                </span>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-5 h-5 text-gray-300" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto justify-start">
             <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-5 h-5 text-blue-400" />
              </div>
              <div className="bg-gray-800 border border-gray-700 px-5 py-4 rounded-2xl rounded-bl-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900/80 border-t border-gray-800 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Active Files Indicators */}
          {activeFileObjects.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {activeFileObjects.map(f => (
                <div key={f.uri} className="flex items-center gap-1.5 bg-blue-900/30 border border-blue-500/30 text-blue-300 text-xs px-2.5 py-1 rounded-full whitespace-nowrap">
                  <FileText className="w-3 h-3" />
                  <span className="max-w-[100px] truncate">{f.displayName || f.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-gray-800/50 border border-gray-700 rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 transition-all shadow-inner">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeFiles.size > 0 ? "Ask questions about selected files..." : "Message Gemini..."}
              className="w-full bg-transparent border-none text-gray-100 placeholder-gray-500 focus:ring-0 resize-none max-h-32 min-h-[44px] py-2.5 px-2 text-sm md:text-base scrollbar-hide"
              rows={1}
            />
            <button
              onClick={onSend}
              disabled={isLoading || (!input.trim() && activeFiles.size === 0)}
              className={`p-2.5 rounded-lg flex-shrink-0 transition-all ${
                input.trim() || activeFiles.size > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">
              Gemini can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
