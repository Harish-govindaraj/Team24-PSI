const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Helper to handle standard API responses
 */
async function handleResponse(response) {
  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (_e) {
    throw new Error('Received an invalid response from the backend.');
  }

  if (!response.ok) {
    // Check if the backend gave a specific error message
    // Note: GlobalExceptionHandler might return a generic error or a map of validation errors
    if (jsonResponse.data && typeof jsonResponse.data === 'object' && !jsonResponse.message) {
       // If it's a validation error map
       const errorValues = Object.values(jsonResponse.data);
       throw new Error(errorValues[0] || 'Validation failed');
    }
    const errorMessage = jsonResponse?.message || `Backend error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (!jsonResponse.success) {
    throw new Error(jsonResponse.message || 'Operation failed.');
  }

  return jsonResponse.data;
}

/**
 * Authenticates a user and returns their JWT token.
 * 
 * @param {Object} credentials - { email, password }
 * @returns {Promise<string>} - JWT token
 */
export async function login(credentials) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await handleResponse(response);
    return data.token;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to PSI backend.');
    }
    throw error;
  }
}

/**
 * Registers a new user.
 * 
 * @param {Object} userData - Registration payload
 * @returns {Promise<Object>} - Registration response data
 */
export async function register(userData) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    return await handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to PSI backend.');
    }
    throw error;
  }
}
