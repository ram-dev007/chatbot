import React from 'react';
import { X, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: string;
  setModel: (model: string) => void;
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  model,
  setModel,
  systemPrompt,
  setSystemPrompt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900/50">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Configuration
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Model Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Model</label>
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 appearance-none hover:bg-gray-750 transition-colors"
              >
                <option value="gemini-3-flash-preview">Gemini 3.0 Flash (Recommended)</option>
                <option value="gemini-3-pro-preview">Gemini 3.0 Pro (High Intelligence)</option>
                <option value="gemini-2.5-flash-latest">Gemini 2.5 Flash (Fast)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Select the Gemini model version to use for chat generation.
            </p>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">System Instructions</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant..."
              className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none placeholder-gray-500 transition-all"
            />
            <p className="text-xs text-gray-500">
              Define the persona and behavior of the AI assistant.
            </p>
          </div>

          {/* API Key Status (Read Only) */}
           <div className="space-y-2 opacity-60">
            <label className="text-sm font-medium text-gray-300">API Key</label>
            <div className="w-full bg-gray-800/50 border border-gray-700/50 rounded-lg p-3 text-sm text-gray-400 italic">
               Configured via Environment (Protected)
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-900/20"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;
