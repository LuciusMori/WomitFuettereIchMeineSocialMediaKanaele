# Netlify Deployment Guide

## 🚀 Deployment-Konfiguration für Netlify

### 1. Lokale Entwicklung Setup

Fügen Sie zu Ihrer `.env.local` hinzu:

```bash
# Gemini API Key (von Google AI Studio)
GEMINI_API_KEY=your_gemini_api_key_here

# Lokale Entwicklung: Dateipfad zur JSON-Datei
GOOGLE_APPLICATION_CREDENTIALS=./credentials/your-service-account-key.json

# Convex & Clerk (bereits vorhanden)
CONVEX_DEPLOYMENT=your_deployment
VITE_CONVEX_URL=your_convex_url
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

### 2. JSON-Datei für Netlify vorbereiten

1. **Öffnen Sie Ihre JSON-Datei** im `credentials/` Ordner
2. **Kopieren Sie den GESAMTEN Inhalt** (alles zwischen `{` und `}`)
3. **Entfernen Sie alle Zeilenumbrüche** - machen Sie es zu einer einzigen Zeile

**Beispiel:**

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service@your-project.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/your-service%40your-project.iam.gserviceaccount.com"
}
```

### 3. Netlify Environment Variables konfigurieren

1. **Gehen Sie zu Ihrem Netlify Dashboard**
2. **Wählen Sie Ihr Projekt**
3. **Site settings → Environment variables**
4. **Fügen Sie folgende Variablen hinzu:**

```bash
# Gemini API
GEMINI_API_KEY = your_gemini_api_key_here

# Google Service Account (JSON als String - EINE ZEILE!)
GOOGLE_SERVICE_ACCOUNT_KEY = {"type":"service_account","project_id":"..."}

# Convex
CONVEX_DEPLOYMENT = your_deployment
VITE_CONVEX_URL = your_convex_url

# Clerk
VITE_CLERK_PUBLISHABLE_KEY = your_clerk_key
CLERK_SECRET_KEY = your_clerk_secret

# Frontend URL
FRONTEND_URL = https://your-app.netlify.app
```

### 4. Build-Konfiguration

Erstellen Sie eine `netlify.toml` Datei im Projekt-Root:

```toml
[build]
  command = "npm run build"
  publish = "build/client"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 5. Deployment-Checklist

- ✅ JSON-Datei lokal im `credentials/` Ordner
- ✅ JSON-Inhalt als `GOOGLE_SERVICE_ACCOUNT_KEY` in Netlify
- ✅ Alle anderen Environment Variables in Netlify gesetzt
- ✅ `netlify.toml` erstellt
- ✅ Repository mit Netlify verbunden

### 6. Testen

1. **Lokal testen:**

   ```bash
   npm run dev
   ```

2. **Netlify Build testen:**

   ```bash
   npm run build
   ```

3. **Deploy:**
   - Push zu GitHub/GitLab
   - Netlify baut automatisch

### 🔒 Sicherheitshinweise

- ❌ **Niemals** die JSON-Datei ins Git Repository committen
- ✅ **Immer** Environment Variables für Produktion verwenden
- ✅ **Regelmäßig** Service Account Keys rotieren
- ✅ **Minimale Berechtigungen** für Service Accounts verwenden

### 🐛 Troubleshooting

**Problem:** "Google credentials not configured"

- **Lösung:** Überprüfen Sie `GOOGLE_SERVICE_ACCOUNT_KEY` in Netlify

**Problem:** "Invalid JSON in service account key"

- **Lösung:** JSON muss eine einzige Zeile sein, keine Zeilenumbrüche

**Problem:** "Permission denied"

- **Lösung:** Service Account braucht "Vertex AI User" Rolle

**Problem:** Build fails

- **Lösung:** Überprüfen Sie alle Environment Variables in Netlify
