const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-replit-backend-subdomain.replit.app/api' 
  : 'http://localhost:5000/api';

export async function fetchMatrixSlates(fallbackData = []) {
  try {
    const response = await fetch(`${API_BASE_URL}/matrix`);
    if (!response.ok) {
      throw new Error('Failed to fetch live matrix data from backend');
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn('Backend matrix endpoint unreachable. Using local fallback state:', err);
    return fallbackData;
  }
}
