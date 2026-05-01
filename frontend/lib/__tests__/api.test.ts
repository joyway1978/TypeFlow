import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchTTS, fetchCheck, getAudioUrl } from '../api';
import { TTSResponse, CheckResponse } from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

describe('API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchTTS', () => {
    it('should call TTS endpoint with correct parameters', async () => {
      const mockResponse: TTSResponse = {
        audio_key: 'test-key-123',
        url: '/api/tts/audio/test-key-123',
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchTTS('Hello world');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/tts`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: 'Hello world' }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed request', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      await expect(fetchTTS('Hello')).rejects.toThrow('TTS request failed');
    });

    it('should throw error on network failure', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchTTS('Hello')).rejects.toThrow('Network error');
    });
  });

  describe('fetchCheck', () => {
    it('should call check endpoint with correct parameters', async () => {
      const mockResponse: CheckResponse = {
        items: [
          { word: 'Hello', user_input: 'Hello', status: 'correct', index: 0 },
          { word: 'world', user_input: 'word', status: 'wrong', index: 1 },
        ],
        summary: {
          total: 2,
          correctCount: 1,
          wrongCount: 1,
          ignoredCount: 0,
        },
      };

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await fetchCheck('Hello world', 'Hello word');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/api/check`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original: 'Hello world',
            user_input: 'Hello word',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed check request', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
      } as Response);

      await expect(fetchCheck('test', 'test')).rejects.toThrow('Check request failed');
    });
  });

  describe('getAudioUrl', () => {
    it('should return correct audio URL', () => {
      const url = getAudioUrl('test-key');
      expect(url).toBe(`${API_BASE}/api/tts/audio/test-key`);
    });
  });
});
