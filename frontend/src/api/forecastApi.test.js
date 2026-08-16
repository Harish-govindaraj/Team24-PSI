import { generateForecast } from './forecastApi';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('forecastApi', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a forecast successfully', async () => {
    const mockResponse = {
      success: true,
      data: { category: 'R03', horizon: 14, forecast: [] }
    };
    
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    const request = { category: 'R03', horizon: 14 };
    const result = await generateForecast(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/forecasts'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(request)
      })
    );
    expect(result).toEqual(mockResponse.data);
  });

  it('handles non-2xx HTTP responses', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Invalid category' })
    });

    await expect(generateForecast({ category: 'INVALID', horizon: 14 }))
      .rejects.toThrow('Invalid category');
  });

  it('handles unexpected JSON formats gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: 'structure' })
    });

    await expect(generateForecast({ category: 'R03', horizon: 14 }))
      .rejects.toThrow('Unexpected response format from backend.');
  });

  it('handles network failures gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(generateForecast({ category: 'R03', horizon: 14 }))
      .rejects.toThrow('Unable to connect to PSI backend.');
  });
});
