import { authenticatedFetch } from './apiClient';

/**
 * Base URL for the PSI Spring Boot backend.
 * Falls back to http://localhost:8080 if not specified in environment.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Generates a sales forecast by communicating with the Spring Boot backend.
 *
 * @param {Object} request - The forecast request payload
 * @param {string} request.category - The product category code (e.g., 'R03')
 * @param {number} request.horizon - The forecast horizon in days (e.g., 7, 14, 30)
 * @returns {Promise<Object>} - The forecast response data returned by the backend
 */
export async function generateForecast(request) {
  return authenticatedFetch(`${API_BASE_URL}/api/forecasts`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

/**
 * Fetches historical sales data for a specific product category from the Spring Boot backend.
 *
 * @param {string} category - The product category code (e.g., 'R03')
 * @returns {Promise<Array>} - A list of historical sales data points
 */
export async function getHistoricalSales(category) {
  return authenticatedFetch(`${API_BASE_URL}/api/sales/${encodeURIComponent(category)}`, {
    method: 'GET'
  });
}

/**
 * Fetches operational data for a specific product category from the Spring Boot backend.
 *
 * @param {string} category - The product category code (e.g., 'R03')
 * @returns {Promise<Object>} - The operational data
 */
export async function getOperationalData(category) {
  return authenticatedFetch(`${API_BASE_URL}/api/operational-data/${encodeURIComponent(category)}`, {
    method: 'GET'
  });
}

/**
 * Runs a supply shock scenario simulation for a given category.
 *
 * @param {Object} request - The scenario request payload
 * @returns {Promise<Object>} - The scenario result
 */
export async function runScenario(request) {
  return authenticatedFetch(`${API_BASE_URL}/api/scenarios`, {
    method: 'POST',
    body: JSON.stringify(request)
  });
}

/**
 * Fetches the ML quality report for a specific product category from the Spring Boot backend.
 *
 * @param {string} category - The product category code (e.g., 'R03')
 * @returns {Promise<Object>} - The quality report data
 */
export async function getQualityReport(category) {
  return authenticatedFetch(`${API_BASE_URL}/api/forecasts/${encodeURIComponent(category)}/quality-report`, {
    method: 'GET'
  });
}
