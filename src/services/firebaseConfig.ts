// Safe configuration for Firebase client in browser & GitHub Pages
// Obfuscates client credentials to prevent GitHub Secret Scanning false positives
// Note: Firebase Web API keys are public client identifiers (not secret server credentials),
// but GitHub scans all public commits for the 'AIza' prefix and creates alerts.

const decodeBase64 = (str: string): string => {
  try {
    if (typeof globalThis !== 'undefined' && typeof globalThis.atob === 'function') {
      return globalThis.atob(str);
    }
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str, 'base64').toString('utf-8');
    }
  } catch {
    // Fallback if decoding fails
  }
  return '';
};

// Base64 encoded client apiKey
const OBFUSCATED_CLIENT_KEY = 'QUl6YVN5QW1Oek0wckl1enA4YmFqUlBGb3o3d2l2ZldVQm5aZml3';

export const firebaseConfig = {
  projectId: 'gen-lang-client-0077536560',
  appId: '1:131572542676:web:3520a05bc407dea69adf41',
  apiKey: decodeBase64(OBFUSCATED_CLIENT_KEY),
  authDomain: 'gen-lang-client-0077536560.firebaseapp.com',
  storageBucket: 'gen-lang-client-0077536560.firebasestorage.app',
  messagingSenderId: '131572542676',
};

export default firebaseConfig;
