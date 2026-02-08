export interface FileMetadata {
  name: string;
  displayName?: string;
  mimeType: string;
  sizeBytes: string;
  createTime: string;
  updateTime: string;
  expirationTime: string;
  uri: string;
  state: 'PROCESSING' | 'ACTIVE' | 'FAILED';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  id: string;
  timestamp: number;
  isError?: boolean;
}

export interface AppState {
  files: FileMetadata[];
  chatHistory: ChatMessage[];
  systemPrompt: string;
  isLoading: boolean;
  isUploading: boolean;
}
