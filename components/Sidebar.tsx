import React from 'react';
import { Trash2, FileText, Upload, RefreshCw, Settings, Info } from 'lucide-react';
import { FileMetadata } from '../types';

interface SidebarProps {
  files: FileMetadata[];
  selectedFiles: Set<string>;
  onToggleFile: (uri: string) => void;
  onUpload: (file: File) => void;
  onDelete: (name: string) => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
  isUploading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  files,
  selectedFiles,
  onToggleFile,
  onUpload,
  onDelete,
  onRefresh,
  onOpenSettings,
  isUploading,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
    e.target.value = '';
  };

  const formatBytes = (bytes: string) => {
    const b = parseInt(bytes, 10);
    if (isNaN(b)) return '0 B';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${(b / Math.pow(1024, i)).toFixed(1)} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`;
  };

  return (
    <div className="w-80 h-full bg-gray-900 border-r border-gray-700 flex flex-col shadow-xl z-20">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Gemini RAG</span>
        </h2>
        <div className="flex gap-1">
          <button onClick={onRefresh} className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Refresh Files">
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button onClick={onOpenSettings} className="p-2 hover:bg-gray-800 rounded-full transition-colors" title="Settings">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Files Section */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Knowledge Base</h3>
          <span className="text-xs text-gray-500">{files.length} files</span>
        </div>

        {files.length === 0 && !isUploading && (
          <div className="text-center py-8 text-gray-600 border-2 border-dashed border-gray-800 rounded-lg">
            <p className="text-sm">No files uploaded</p>
          </div>
        )}

        <div className="space-y-2">
          {files.map((file) => {
            const isSelected = selectedFiles.has(file.uri);
            const isProcessing = file.state === 'PROCESSING';
            return (
              <div
                key={file.name}
                className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-900/20 border-blue-500/50' 
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                }`}
                onClick={() => onToggleFile(file.uri)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm text-gray-200 font-medium truncate pr-2" title={file.displayName || file.name}>
                      {file.displayName || 'Untitled'}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-2">
                      {formatBytes(file.sizeBytes)}
                      {isProcessing && <span className="text-yellow-500 animate-pulse">• Processing</span>}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.name);
                  }}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-4 border-t border-gray-800 bg-gray-900">
        <label className={`
          flex items-center justify-center gap-2 w-full py-3 px-4 
          rounded-lg border-2 border-dashed border-gray-700 
          hover:border-blue-500 hover:bg-blue-500/5 
          cursor-pointer transition-all group
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}>
          <input 
            type="file" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={isUploading}
            accept=".pdf,.txt,.md,.csv,.html"
          />
          {isUploading ? (
            <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          )}
          <span className="text-sm font-medium text-gray-300 group-hover:text-blue-400">
            {isUploading ? 'Uploading...' : 'Upload File'}
          </span>
        </label>
        <div className="mt-2 text-xs text-gray-600 text-center flex items-center justify-center gap-1">
           <Info className="w-3 h-3"/> Supports PDF, TXT, MD
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
