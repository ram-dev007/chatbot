import { FileMetadata } from '../types';

const BASE_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';
const LIST_URL = 'https://generativelanguage.googleapis.com/v1beta/files';
const API_KEY = process.env.API_KEY || '';

/**
 * Uploads a file to the Gemini File API using the resumable upload protocol.
 */
export const uploadFile = async (file: File): Promise<FileMetadata> => {
  if (!API_KEY) throw new Error('API Key is missing');

  // 1. Initial Resumable Request
  const initResponse = await fetch(`${BASE_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'X-Goog-Upload-Protocol': 'resumable',
      'X-Goog-Upload-Command': 'start',
      'X-Goog-Upload-Header-Content-Length': file.size.toString(),
      'X-Goog-Upload-Header-Content-Type': file.type,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: { display_name: file.name } }),
  });

  if (!initResponse.ok) {
    const err = await initResponse.text();
    throw new Error(`Failed to initiate upload: ${err}`);
  }

  const uploadUrl = initResponse.headers.get('x-goog-upload-url');
  if (!uploadUrl) {
    throw new Error('Upload URL not found in response headers');
  }

  // 2. Upload the actual bytes
  const uploadResponse = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Content-Length': file.size.toString(),
      'X-Goog-Upload-Offset': '0',
      'X-Goog-Upload-Command': 'upload, finalize',
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    const err = await uploadResponse.text();
    throw new Error(`Failed to upload file content: ${err}`);
  }

  const result = await uploadResponse.json();
  return result.file as FileMetadata;
};

/**
 * Lists uploaded files.
 */
export const listFiles = async (): Promise<FileMetadata[]> => {
  if (!API_KEY) throw new Error('API Key is missing');

  const response = await fetch(`${LIST_URL}?key=${API_KEY}`);
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to list files: ${err}`);
  }

  const data = await response.json();
  return (data.files as FileMetadata[]) || [];
};

/**
 * Deletes a file by its name (resource ID).
 */
export const deleteFile = async (fileName: string): Promise<void> => {
  if (!API_KEY) throw new Error('API Key is missing');

  const response = await fetch(`${LIST_URL}/${fileName}?key=${API_KEY}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to delete file: ${err}`);
  }
};
