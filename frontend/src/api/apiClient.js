/**
 * A centralized API client for authenticated requests.
 * Automatically injects the JWT token and handles 401/403 responses.
 */

export async function authenticatedFetch(url, options = {}) {
  // Read token at request time
  const token = localStorage.getItem('jwt_token');

  const headers = new Headers(options.headers || {});

  // Inject JWT if it exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Ensure default content type for JSON if not explicitly omitted
  if (!headers.has('Content-Type') && options.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const fetchOptions = {
    ...options,
    headers
  };

  let response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to PSI backend.');
    }
    throw error;
  }

  // Handle 401 Unauthorized (missing, expired, or invalid token)
  if (response.status === 401) {
    localStorage.removeItem('jwt_token');
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Authentication expired or invalid. Please log in again.');
  }

  // Handle 403 Forbidden (authenticated but lacks permission)
  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission to access this resource.');
  }

  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (e) {
    throw new Error('Received an invalid response from the backend.');
  }

  if (!response.ok) {
    // Preserve existing error extraction
    const errorMessage = jsonResponse?.message || `Backend error: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }

  if (!jsonResponse.success || !jsonResponse.data) {
    throw new Error('Unexpected response format from backend.');
  }

  return jsonResponse.data;
}
