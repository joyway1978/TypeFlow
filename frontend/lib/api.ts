import { CheckResponse, TTSResponse } from './types';

const API_BASE = 'http://localhost:8000';

export async function fetchTTS(text: string): Promise<TTSResponse> {
  const res = await fetch(`${API_BASE}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);
  return res.json();
}

export async function fetchCheck(targetText: string, userText: string): Promise<CheckResponse> {
  const res = await fetch(`${API_BASE}/api/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetText, userText }),
  });
  if (!res.ok) throw new Error(`Check request failed: ${res.status}`);
  return res.json();
}

export function getAudioUrl(key: string): string {
  return `${API_BASE}${key}`;
}
