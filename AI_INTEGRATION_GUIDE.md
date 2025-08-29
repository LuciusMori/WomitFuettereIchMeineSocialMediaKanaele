# AI Integration Guide - Google Gemini, Imagen & Veo APIs

## Übersicht

Diese Anwendung integriert die neuesten Google AI APIs für umfassende Social Media Content-Erstellung:

- **Gemini 2.5 Flash**: Für Text-Generierung (Posts, Hashtags, Bild-Ideen)
- **Imagen 4**: Für professionelle Bild-Generierung
- **Veo 3**: Für Video-Generierung

## Setup & Konfiguration

### 1. Google AI API Key erstellen

#### Option A: Google AI Studio (Empfohlen für Entwicklung)

1. Besuchen Sie [Google AI Studio](https://aistudio.google.com/)
2. Melden Sie sich mit Ihrem Google-Konto an
3. Klicken Sie auf "Get API key"
4. Erstellen Sie einen neuen API-Schlüssel
5. Kopieren Sie den Schlüssel

#### Option B: Google Cloud Console (Für Produktion)

1. Öffnen Sie die [Google Cloud Console](https://console.cloud.google.com/)
2. Erstellen Sie ein neues Projekt oder wählen Sie ein bestehendes
3. Aktivieren Sie die "Vertex AI API"
4. Erstellen Sie ein Dienstkonto mit "Vertex AI User" Berechtigung
5. Laden Sie die JSON-Schlüsseldatei herunter

### 2. Umgebungsvariablen konfigurieren

Fügen Sie zu Ihrer `.env.local` Datei hinzu:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Abhängigkeiten

Die erforderlichen Pakete sind bereits installiert:

- `@google/generative-ai`: Offizielle Google AI SDK

## Funktionen & Limits

### Plan-basierte Limits

```typescript
const PLAN_LIMITS = {
  starter: {
    posts: 15,
    hashtags: 15,
    imageIdeas: 15,
    images: 5,
    videos: 2,
  },
  business: {
    posts: 50,
    hashtags: 50,
    imageIdeas: 50,
    images: 20,
    videos: 10,
  },
  pro: {
    posts: 150,
    hashtags: 150,
    imageIdeas: 150,
    images: 75,
    videos: 30,
  },
};
```

### Content-Typen

1. **Posts**: Authentische Social Media Texte
2. **Hashtags**: Relevante und effektive Hashtags
3. **Bild-Ideen**: Detaillierte Regieanweisungen für Smartphone-Fotografie
4. **Bilder**: KI-generierte professionelle Bilder (Imagen 4)
5. **Videos**: KI-generierte kurze Videos (Veo 3)

## API Endpoints

### POST /api/generate-post

Generiert authentische Social Media Posts.

**Request:**

```json
{
  "userId": "string",
  "businessType": "string",
  "postTopic": "string"
}
```

### POST /api/generate-hashtags

Erstellt relevante Hashtags für einen Post.

**Request:**

```json
{
  "userId": "string",
  "businessType": "string",
  "postContent": "string"
}
```

### POST /api/generate-image-ideas

Generiert detaillierte Foto-Regieanweisungen.

**Request:**

```json
{
  "userId": "string",
  "businessType": "string",
  "postContent": "string"
}
```

### POST /api/generate-image

Erstellt professionelle Bilder mit Imagen 4.

**Request:**

```json
{
  "userId": "string",
  "prompt": "string",
  "businessType": "string",
  "postContent": "string"
}
```

### POST /api/generate-video

Generiert kurze Videos mit Veo 3.

**Request:**

```json
{
  "userId": "string",
  "prompt": "string",
  "businessType": "string",
  "postContent": "string",
  "videoType": "text-to-video" | "image-to-video",
  "sourceImage": "string" // base64 für image-to-video
}
```

## System Prompts

### Post-Generierung

Das System analysiert den Geschäftstyp und passt den Tonfall entsprechend an:

- **Cafés/Restaurants**: Locker, herzlich, einladend
- **Anwaltskanzleien**: Professionell, vertrauensvoll, seriös
- **Friseure/Beauty**: Trendig, inspirierend, lifestyle-orientiert
- **Handwerker**: Bodenständig, kompetent, zuverlässig

### Bild-Generierung (Imagen 4)

```
BILD-GENERIERUNG FÜR SOCIAL MEDIA - PROFESSIONELLE QUALITÄT

STIL-ANWEISUNGEN:
- Hochauflösend, professionell, social-media-optimiert
- Warme, einladende Beleuchtung
- Klare Komposition, nicht überladen
- Authentisch und glaubwürdig

TECHNISCHE SPEZIFIKATIONEN:
- Seitenverhältnis: 1:1 (Instagram) oder 16:9 (Facebook/LinkedIn)
- Hohe Auflösung für Social Media
- Lebendige aber natürliche Farben
```

### Video-Generierung (Veo 3)

```
VIDEO-GENERIERUNG FÜR SOCIAL MEDIA - PROFESSIONELLE QUALITÄT

STIL-ANWEISUNGEN:
- Hochauflösend, professionell, social-media-optimiert
- Dynamische aber ruhige Kamerabewegungen
- 5-15 Sekunden Länge (optimal für Social Media)

TECHNISCHE SPEZIFIKATIONEN:
- Seitenverhältnis: 9:16 (Stories/Reels) oder 1:1 (Feed-Posts)
- Smooth, professionelle Übergänge
- Fokus auf das Wesentliche
```

## Usage Tracking

Das System verfolgt die Nutzung pro Benutzer und Monat:

```typescript
// Schema
usage: {
  userId: string,
  month: string, // "2025-01"
  postsGenerated: number,
  hashtagsGenerated: number,
  imageIdeasGenerated: number,
  imagesGenerated: number,
  videosGenerated: number,
  extraTokensPurchased: number,
  lastUpdated: number
}
```

## Frontend Integration

Die neue `AIContentGenerator` Komponente bietet eine vollständige Benutzeroberfläche mit:

- **Tabs für verschiedene Content-Typen**
- **Echtzeit-Generierung mit Loading-States**
- **Copy-to-Clipboard Funktionalität**
- **Download-Optionen für Medien**
- **Responsive Design**

### Verwendung:

```tsx
import { AIContentGenerator } from "./components/ai-content-generator";

function Dashboard() {
  return (
    <div>
      <AIContentGenerator />
    </div>
  );
}
```

## Sicherheit & Best Practices

1. **API-Schlüssel**: Niemals im Frontend-Code verwenden
2. **Rate Limiting**: Implementiert über Usage-Tracking
3. **Error Handling**: Umfassende Fehlerbehandlung in allen APIs
4. **Validation**: Input-Validierung auf Server-Seite

## Kosten-Optimierung

- **Imagen 4 Fast**: Für schnellere, günstigere Bildgenerierung
- **Veo 3 Fast**: Für schnellere Videogenerierung
- **Caching**: Implementieren Sie Caching für häufige Anfragen
- **Batch Processing**: Für mehrere Inhalte gleichzeitig

## Troubleshooting

### Häufige Probleme:

1. **"API key not configured"**

   - Überprüfen Sie die GEMINI_API_KEY Umgebungsvariable

2. **"Usage limit exceeded"**

   - Benutzer hat sein monatliches Kontingent erreicht
   - Zusätzliche Tokens können gekauft werden

3. **"Failed to generate content"**
   - Überprüfen Sie die Netzwerkverbindung
   - Validieren Sie die API-Schlüssel-Berechtigung

### Logs überprüfen:

```bash
# Entwicklung
npm run dev

# Produktion
vercel logs
```

## Nächste Schritte

1. **Gemini 2.5 Flash Image** ("Nano Banana") Integration
2. **Batch-Generierung** für mehrere Posts
3. **Template-System** für wiederkehrende Inhalte
4. **Analytics Dashboard** für Generierungs-Statistiken
5. **A/B Testing** für verschiedene Prompts
