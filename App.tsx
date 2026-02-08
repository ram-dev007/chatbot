import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import SettingsModal from './components/SettingsModal';
import { ChatMessage, FileMetadata } from './types';
import { uploadFile, listFiles, deleteFile } from './services/fileService';
import { generateResponseStream } from './services/geminiService';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  
  // Settings State
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant. Use the provided files to answer questions if available.');
  const [model, setModel] = useState('gemini-3-flash-preview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // UI State: Sidebar collapsed by default
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load files on mount
  useEffect(() => {
    refreshFiles();
  }, []);

  const refreshFiles = async () => {
    try {
      const fetchedFiles = await listFiles();
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Failed to list files:', error);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      await uploadFile(file);
      await refreshFiles();
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteFile(fileName);
      
      const deletedFile = files.find(f => f.name === fileName);
      if (deletedFile) {
        setSelectedFiles(prev => {
          const next = new Set(prev);
          next.delete(deletedFile.uri);
          return next;
        });
      }
      
      await refreshFiles();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete file');
    }
  };

  const toggleFileSelection = (uri: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(uri)) {
        next.delete(uri);
      } else {
        next.add(uri);
      }
      return next;
    });
  };

  const handleSend = async () => {
    if ((!input.trim() && selectedFiles.size === 0) || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: ChatMessage = {
      role: 'model',
      text: '',
      id: modelMsgId,
      timestamp: Date.now(),
    };
    
    setChatHistory(prev => [...prev, modelMsg]);

    const activeFileList = files.filter(f => selectedFiles.has(f.uri));

    try {
      let accumText = '';
      await generateResponseStream(
        chatHistory,
        userMsg.text,
        model,
        systemPrompt,
        activeFileList,
        (chunk) => {
          accumText += chunk;
          setChatHistory(prev => 
            prev.map(m => m.id === modelMsgId ? { ...m, text: accumText } : m)
          );
        }
      );
    } catch (error) {
      console.error('Generation error:', error);
      setChatHistory(prev => 
        prev.map(m => m.id === modelMsgId ? { ...m, text: "I encountered an error while processing your request.", isError: true } : m)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 overflow-hidden relative">
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        model={model}
        setModel={setModel}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
      />

      {/* Sidebar Toggle Button (Always visible logic adjusted below) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`absolute top-4 left-4 z-50 p-2 rounded-full text-white shadow-lg transition-colors ${isSidebarOpen ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-800 hover:bg-gray-700'}`}
        style={{ transform: isSidebarOpen ? 'translateX(0)' : 'translateX(0)' }}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-40 h-full transition-all duration-300 ease-in-out border-r border-gray-800
        ${isSidebarOpen ? 'translate-x-0 w-80' : '-translate-x-full md:translate-x-0 md:w-0 overflow-hidden'}
        bg-gray-900 flex-shrink-0
      `}>
         {/* Render Sidebar content even if width is 0 for transition purposes, or handle visibility */}
         <div className="w-80 h-full">
            <Sidebar 
              files={files}
              selectedFiles={selectedFiles}
              onToggleFile={toggleFileSelection}
              onUpload={handleUpload}
              onDelete={handleDelete}
              onRefresh={refreshFiles}
              onOpenSettings={() => setIsSettingsOpen(true)}
              isUploading={isUploading}
            />
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-full w-full relative min-w-0 bg-gray-950">
        <ChatArea 
          history={chatHistory}
          isLoading={isLoading}
          input={input}
          setInput={setInput}
          onSend={handleSend}
          activeFiles={selectedFiles}
          allFiles={files}
        />
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
