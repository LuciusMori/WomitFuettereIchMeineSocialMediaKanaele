import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId, prompt, businessType, postContent, videoType = 'text-to-video', sourceImage } = await request.json();
    
    if (!userId || !prompt) {
      return NextResponse.json(
        { error: 'userId and prompt are required' },
        { status: 400 }
      );
    }

    // Check usage limit first
    const usageCheck = await convex.query(api.usage.checkUsageLimit, {
      userId,
      type: 'videos'
    });
    
    if (!usageCheck.canGenerate) {
      return NextResponse.json({
        success: false,
        error: usageCheck.reason,
        remainingTokens: usageCheck.remainingTokens || 0
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Create optimized prompt for Veo
    const optimizedPrompt = createVideoPrompt(prompt, businessType, postContent, videoType);
    
    // Use Veo 3 model (or Veo 3 Fast for quicker generation)
    const model = genAI.getGenerativeModel({ model: "veo-3" });
    
    let requestContent;
    
    if (videoType === 'image-to-video' && sourceImage) {
      // Image-to-video generation
      requestContent = {
        contents: [{
          role: "user",
          parts: [
            { text: optimizedPrompt },
            { 
              inlineData: {
                mimeType: "image/jpeg", // or appropriate mime type
                data: sourceImage // base64 encoded image
              }
            }
          ]
        }]
      };
    } else {
      // Text-to-video generation
      requestContent = {
        contents: [{
          role: "user",
          parts: [{
            text: optimizedPrompt
          }]
        }]
      };
    }
    
    const result = await model.generateContent(requestContent);

    // Increment usage counter after successful generation
    await convex.mutation(api.usage.incrementUsage, {
      userId,
      type: 'videos'
    });

    return NextResponse.json({
      success: true,
      videoUrl: result.response.text(), // This will contain the video URL
      prompt: optimizedPrompt,
      videoType
    });

  } catch (error) {
    console.error('Error generating video:', error);
    return NextResponse.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}

function createVideoPrompt(userPrompt: string, businessType: string, postContent: string, videoType: string): string {
  // System prompt for optimal video generation
  const systemPrompt = `
VIDEO-GENERIERUNG FÜR SOCIAL MEDIA - PROFESSIONELLE QUALITÄT

GESCHÄFTSTYP: ${businessType}
POST-INHALT: ${postContent}
VIDEO-TYP: ${videoType}
NUTZER-WUNSCH: ${userPrompt}

STIL-ANWEISUNGEN:
- Hochauflösend, professionell, social-media-optimiert
- Dynamische aber ruhige Kamerabewegungen
- Warme, einladende Beleuchtung
- Klare Komposition, nicht überladen
- Authentisch und glaubwürdig
- 5-15 Sekunden Länge (optimal für Social Media)

TECHNISCHE SPEZIFIKATIONEN:
- Seitenverhältnis: 9:16 (Stories/Reels) oder 1:1 (Feed-Posts)
- Hohe Auflösung für Social Media
- Lebendige aber natürliche Farben
- Gute Kontraste für mobile Ansicht
- Smooth, professionelle Übergänge

INHALTLICHE AUSRICHTUNG:
- Zeige das Produkt/die Dienstleistung in Aktion
- Berücksichtige die Markenidentität des Geschäftstyps
- Erzeuge positive Emotionen und Aufmerksamkeit
- Fördere Engagement und Interaktion
- Erzähle eine kurze, prägnante Geschichte

BEWEGUNG UND DYNAMIK:
- Sanfte Kamerabewegungen (Zoom, Pan, Tilt)
- Natürliche Objektbewegungen
- Ansprechende Übergänge
- Fokus auf das Wesentliche

ERSTELLE EIN VIDEO: ${userPrompt}
`;

  return systemPrompt;
}