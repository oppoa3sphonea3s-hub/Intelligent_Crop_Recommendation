/**
 * API Service for communicating with Flask backend.
 */
const API_BASE_URL = 'http://localhost:5000/api';

async function handleResponse(response) {
  const json = await response.json();
  if (!response.ok || !json.success) {
    const errorMsg = json.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Check backend server status
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3500) });
      return await res.json();
    } catch (e) {
      return { status: 'offline', error: e.message };
    }
  },

  // Crop Recommendation
  async predictCrop(parameters) {
    const res = await fetch(`${API_BASE_URL}/predict-crop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });
    return handleResponse(res);
  },

  // Fertilizer Recommendation
  async recommendFertilizer(parameters) {
    const res = await fetch(`${API_BASE_URL}/recommend-fertilizer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parameters),
    });
    return handleResponse(res);
  },

  // Dashboard Analytics
  async getAnalytics() {
    const res = await fetch(`${API_BASE_URL}/analytics`);
    return handleResponse(res);
  },

  // Prediction History
  async getHistory(type = 'crop', search = '', limit = 50, offset = 0) {
    const params = new URLSearchParams({ type, search, limit, offset });
    const res = await fetch(`${API_BASE_URL}/history?${params.toString()}`);
    return handleResponse(res);
  },

  // Delete History Record
  async deleteHistory(id, type = 'crop') {
    const res = await fetch(`${API_BASE_URL}/history/${type}/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(res);
  },

  // Crops Catalog
  async getCropsCatalog() {
    const res = await fetch(`${API_BASE_URL}/crops-catalog`);
    return handleResponse(res);
  },

  // ML Metrics
  async getMLMetrics() {
    const res = await fetch(`${API_BASE_URL}/ml-metrics`);
    return handleResponse(res);
  }
};
