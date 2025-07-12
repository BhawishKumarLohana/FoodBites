// Utility for handling JWT tokens in localStorage

export function setToken(token) {
  localStorage.setItem('jwt_token', token);
}

export function getToken() {
  return localStorage.getItem('jwt_token');
}

export function removeToken() {
  localStorage.removeItem('jwt_token');
}

// Simple JWT decode (no validation, just base64 decode)
export function decodeToken(token) {
  if (!token) return null;
  try {
    // Handle both real JWT and mock JWT formats
    const parts = token.split('.');
    if (parts.length === 3) {
      // Real JWT format
      const payload = parts[1];
      return JSON.parse(atob(payload));
    } else if (parts.length === 2) {
      // Mock JWT format (fallback)
      const payload = parts[1];
      return JSON.parse(atob(payload));
    }
    return null;
  } catch (e) {
    return null;
  }
} 