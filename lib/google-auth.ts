import { GoogleAuth } from 'google-auth-library';

// Google Authentication für Netlify und lokale Entwicklung
export function getGoogleAuth() {
  // Für Netlify: JSON als Umgebungsvariable
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    return new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }
  
  // Für lokale Entwicklung: Dateipfad
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new GoogleAuth({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    });
  }
  
  throw new Error('Google credentials not configured. Please set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS');
}