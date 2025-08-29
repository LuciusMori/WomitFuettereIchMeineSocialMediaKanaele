import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGoogleAuth } from '../../lib/google-auth';

// AI Service für alle Content-Generierung
export class AIService {
  private geminiClient: GoogleGenerativeAI;
  
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.geminiClient = new GoogleGenerativeAI(apiKey);
  }

  // Post-Generierung
  async generatePost(businessType: string, postTopic: string): Promise<string> {
    const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    
    const prompt = `Du bist ein Social-Media-Experte für lokale Geschäfte in der DACH-Region. 

WICHTIG: Analysiere zuerst den Geschäftstyp "${businessType}" und das Thema "${postTopic}" um den passenden Tonfall zu bestimmen:

TONALITÄT-ANALYSE:
- Für Cafés, Restaurants, Bäckereien: Locker, herzlich, einladend
- Für Anwaltskanzleien, Steuerberater, Ärzte: Professionell, vertrauensvoll, seriös  
- Für Friseure, Beauty-Salons, Mode: Trendig, inspirierend, lifestyle-orientiert
- Für Handwerker, Autowerkstätten: Bodenständig, kompetent, zuverlässig
- Für Fitness-Studios, Yoga: Motivierend, energisch, gesundheitsbewusst

Erstelle einen authentischen Social-Media-Post (4-5 Sätze) der GENAU zum Geschäftstyp passt. Der Post soll so klingen, als hätte ihn der Geschäftsinhaber selbst geschrieben.

Geschäftstyp: ${businessType}
Thema: "${postTopic}"`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // Hashtag-Generierung
  async generateHashtags(businessType: string, postContent: string): Promise<string> {
    const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    
    const prompt = `Gib mir 5-7 relevante und effektive Hashtags (nur die Hashtags, mit # am Anfang, durch Leerzeichen getrennt) für diesen Social-Media-Post für ein/e ${businessType}: "${postContent}"`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // Bild-Ideen Generierung
  async generateImageIdeas(postContent: string): Promise<string> {
    const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    
    const prompt = `Du bist ein Foto-Regisseur für Social Media Content. Basierend auf diesem Post: "${postContent}"

Erstelle 3 detaillierte REGIE-ANWEISUNGEN für Bilder/Videos, die ein Kleinunternehmer mit dem Smartphone umsetzen kann:

FORMAT für jede Idee:
📸 BILD-IDEE [Nummer]: [Kurzer Titel]
🎬 WAS FOTOGRAFIEREN: [Genaue Beschreibung des Motivs]
📐 AUFNAHME-WINKEL: [Perspektive, z.B. "Von oben", "Augenhöhe", "Leicht schräg"]
💡 LICHT-TIPP: [Beleuchtung, z.B. "Natürliches Licht vom Fenster", "Warmes Abendlicht"]
🎨 STYLING: [Anordnung, Farben, Requisiten]
📱 SMARTPHONE-TIPP: [Technische Hinweise für bessere Qualität]

Die Ideen sollen:
- Zum Geschäftstyp und Post-Inhalt passen
- Mit einfachen Mitteln umsetzbar sein
- Professionell aussehen
- Engagement fördern`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // Bild-Generierung (Placeholder - wird später mit Imagen implementiert)
  async generateImage(prompt: string, businessType: string, postContent: string): Promise<string> {
    // Für jetzt verwenden wir Gemini für Bild-Beschreibungen
    // Später wird das durch echte Imagen-Integration ersetzt
    const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    
    const imagePrompt = `
BILD-GENERIERUNG FÜR SOCIAL MEDIA - PROFESSIONELLE QUALITÄT

GESCHÄFTSTYP: ${businessType}
POST-INHALT: ${postContent}
NUTZER-WUNSCH: ${prompt}

Erstelle eine detaillierte Beschreibung für ein professionelles Social Media Bild:

STIL-ANWEISUNGEN:
- Hochauflösend, professionell, social-media-optimiert
- Warme, einladende Beleuchtung
- Klare Komposition, nicht überladen
- Authentisch und glaubwürdig

BESCHREIBE DAS BILD: ${prompt}
`;

    const result = await model.generateContent(imagePrompt);
    return `Bild-Beschreibung: ${result.response.text()}\n\n(Hinweis: Echte Bild-Generierung wird in einer späteren Version implementiert)`;
  }

  // Video-Generierung (Placeholder - wird später mit Veo implementiert)
  async generateVideo(prompt: string, businessType: string, postContent: string): Promise<string> {
    // Für jetzt verwenden wir Gemini für Video-Beschreibungen
    // Später wird das durch echte Veo-Integration ersetzt
    const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    
    const videoPrompt = `
VIDEO-GENERIERUNG FÜR SOCIAL MEDIA - PROFESSIONELLE QUALITÄT

GESCHÄFTSTYP: ${businessType}
POST-INHALT: ${postContent}
NUTZER-WUNSCH: ${prompt}

Erstelle eine detaillierte Beschreibung für ein professionelles Social Media Video:

STIL-ANWEISUNGEN:
- 5-15 Sekunden Länge
- Dynamische aber ruhige Kamerabewegungen
- Warme, einladende Beleuchtung
- Professionelle Übergänge

BESCHREIBE DAS VIDEO: ${prompt}
`;

    const result = await model.generateContent(videoPrompt);
    return `Video-Beschreibung: ${result.response.text()}\n\n(Hinweis: Echte Video-Generierung wird in einer späteren Version implementiert)`;
  }
}