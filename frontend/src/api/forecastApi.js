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
 * @throws {Error} - If the backend is unreachable or returns an error
 */
export async function generateForecast(request) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/forecasts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    let jsonResponse;
    try {
      jsonResponse = await response.json();
    } catch (e) {
      throw new Error('Received an invalid response from the backend.');
    }

    if (!response.ok) {
      // Backend returned an HTTP error (e.g. validation failure)
      // Extract the error message if the backend provided one
      const errorMessage = jsonResponse?.message || `Backend error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!jsonResponse.success || !jsonResponse.data) {
      // Structure is not what we expect from ApiResponse
      throw new Error('Unexpected response format from backend.');
    }

    // Return the actual ForecastResponse object (camelCase fields as formatted by Spring Boot)
    return jsonResponse.data;

  } catch (error) {
    // If it's a TypeError from fetch, it means the network request itself failed (e.g., connection refused)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to PSI backend.');
    }
    // Otherwise rethrow the error we constructed
    throw error;
  }
}

/**
 * Fetches historical sales data for a specific product category from the Spring Boot backend.
 *
 * @param {string} category - The product category code (e.g., 'R03')
 * @returns {Promise<Array>} - A list of historical sales data points
 * @throws {Error} - If the backend is unreachable or returns an error
 */
export async function getHistoricalSales(category) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sales/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    let jsonResponse;
    try {
      jsonResponse = await response.json();
    } catch (e) {
      throw new Error('Received an invalid response from the backend.');
    }

    if (!response.ok) {
      // Backend returned an HTTP error
      const errorMessage = jsonResponse?.message || `Backend error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!jsonResponse.success || !jsonResponse.data) {
      // Structure is not what we expect from ApiResponse
      throw new Error('Unexpected response format from backend.');
    }

    // Return the actual list of SalesResponse objects
    return jsonResponse.data;

  } catch (error) {
    // If it's a TypeError from fetch, it means the network request itself failed (e.g., connection refused)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to PSI backend.');
    }
    // Otherwise rethrow the error we constructed
    throw error;
  }
}

/**
 * Fetches operational data for a specific product category from the Spring Boot backend.
 *
 * @param {string} category - The product category code (e.g., 'R03')
 * @returns {Promise<Object>} - The operational data
 * @throws {Error} - If the backend is unreachable or returns an error
 */
export async function getOperationalData(category) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/operational-data/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    let jsonResponse;
    try {
      jsonResponse = await response.json();
    } catch (e) {
      throw new Error('Received an invalid response from the backend.');
    }

    if (!response.ok) {
      // Backend returned an HTTP error
      const errorMessage = jsonResponse?.message || `Backend error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!jsonResponse.success || !jsonResponse.data) {
      // Structure is not what we expect from ApiResponse
      throw new Error('Unexpected response format from backend.');
    }

    // Return the actual OperationalDataResponse object
    return jsonResponse.data;

  } catch (error) {
    // If it's a TypeError from fetch, it means the network request itself failed (e.g., connection refused)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to PSI backend.');
    }
    // Otherwise rethrow the error we constructed
    throw error;
  }
}

/**
 * Runs a supply shock scenario simulation for a given category.
 *
 * @param {Object} request - The scenario request payload
 * @param {string} request.category - The product category
 * @param {number} request.horizon - The forecast horizon
 * @param {number} request.supplyShockPct - Fraction of supply lost (e.g., 0.3 for 30%)
 * @param {number} request.nSimulations - Number of Monte Carlo simulations
 * @returns {Promise<Object>} - The scenario result
 */
export async function runScenario(request) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(request)
    });

    let jsonResponse;
    try {
      jsonResponse = await response.json();
    } catch (e) {
      throw new Error('Received an invalid response from the backend.');
    }

    if (!response.ok) {
      // Backend returned an HTTP error
      const errorMessage = jsonResponse?.message || `Backend error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    if (!jsonResponse.success || !jsonResponse.data) {
      // Structure is not what we expect from ApiResponse
      throw new Error('Unexpected response format from backend.');
    }

    // Return the actual ScenarioResponse object
    return jsonResponse.data;

  } catch (error) {
    // If it's a TypeError from fetch, it means the network request itself failed (e.g., connection refused)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to PSI backend.');
    }
    // Otherwise rethrow the error we constructed
    throw error;
  }
}
