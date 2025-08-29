import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId, prompt, businessType, postContent } = await request.json();
    
    if (!userId || !prompt) {
      return NextResponse.json(
        { error: 'userId and prompt are required' },
        { status: 400 }
      );
    }

    // Check usage limit first
    const usageCheck = await convex.query(api.usage.checkUsageLimit, {
      userId,
      type: 'images'
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
    
    // Create optimized prompt for Imagen
    const optimizedPrompt = createImagePrompt(prompt, businessType, postContent);
    
    // Use Imagen 4 model
    const model = genAI.getGenerativeModel({ model: "imagen-4" });
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: optimizedPrompt
        }]
      }]
    });

    // Increment usage counter after successful generation
    await convex.mutation(api.usage.incrementUsage, {
      userId,
      type: 'images'
    });

    return NextResponse.json({
      success: true,
      imageUrl: result.response.text(), // This will contain the image URL or base64
      prompt: optimizedPrompt
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

function createImagePrompt(userPrompt: string, businessType: string, postContent: string): string {
  // System prompt for optimal image generation
  const systemPrompt = `
BILD-GENERIERUNG FÜR SOCIAL MEDIA - PROFESSIONELLE QUALITÄT

GESCHÄFTSTYP: ${businessType}
POST-INHALT: ${postContent}
NUTZER-WUNSCH: ${userPrompt}

STIL-ANWEISUNGEN:
- Hochauflösend, professionell, social-media-optimiert
- Warme, einladende Beleuchtung
- Klare Komposition, nicht überladen
- Authentisch und glaubwürdig
- Passend zur Zielgruppe des Geschäftstyps

TECHNISCHE SPEZIFIKATIONEN:
- Seitenverhältnis: 1:1 (Instagram-Post) oder 16:9 (Facebook/LinkedIn)
- Hohe Auflösung für Social Media
- Lebendige aber natürliche Farben
- Gute Kontraste für mobile Ansicht

INHALTLICHE AUSRICHTUNG:
- Zeige das Produkt/die Dienstleistung authentisch
- Berücksichtige die Markenidentität des Geschäftstyps
- Erzeuge positive Emotionen
- Fördere Engagement und Interaktion

ERSTELLE EIN BILD: ${userPrompt}
`;

  return systemPrompt;
}