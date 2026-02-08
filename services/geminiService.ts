import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { ChatMessage, FileMetadata } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateResponseStream = async (
  history: ChatMessage[],
  currentMessage: string,
  modelName: string,
  systemInstruction: string,
  activeFiles: FileMetadata[],
  onChunk: (text: string) => void
) => {
  
  const systemInstructionPart = systemInstruction ? systemInstruction : undefined;

  // Prepare contents for the chat
  // We need to format the history for the SDK.
  
  const contents = [];

  // 1. Add previous history
  for (const msg of history) {
    contents.push({
      role: msg.role,
      parts: [{ text: msg.text }],
    });
  }

  // 2. Construct the current User message
  const currentUserParts: any[] = [];
  
  // Add files to the current message (or context)
  if (activeFiles.length > 0) {
    for (const file of activeFiles) {
      currentUserParts.push({
        fileData: {
          mimeType: file.mimeType,
          fileUri: file.uri,
        },
      });
    }
  }

  currentUserParts.push({ text: currentMessage });

  contents.push({
    role: 'user',
    parts: currentUserParts,
  });

  const responseStream = await ai.models.generateContentStream({
    model: modelName,
    contents: contents,
    config: {
      systemInstruction: systemInstructionPart,
    }
  });

  for await (const chunk of responseStream) {
    const text = chunk.text;
    if (text) {
      onChunk(text);
    }
  }
};
