import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId, businessType, postContent } = await request.json();
    
    if (!userId || !postContent) {
      return NextResponse.json(
        { error: 'userId and postContent are required' },
        { status: 400 }
      );
    }

    // Check usage limit first
    const usageCheck = await convex.query(api.usage.checkUsageLimit, {
      userId,
      type: 'imageIdeas'
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    
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
- Engagement fördern

Geschäftstyp aus Post ableiten und passende Bildideen entwickeln.`;
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: prompt
        }]
      }]
    });

    const generatedIdeas = result.response.text();

    // Increment usage counter after successful generation
    await convex.mutation(api.usage.incrementUsage, {
      userId,
      type: 'imageIdeas'
    });

    return NextResponse.json({
      success: true,
      content: generatedIdeas
    });

  } catch (error) {
    console.error('Error generating image ideas:', error);
    return NextResponse.json(
      { error: 'Failed to generate image ideas' },
      { status: 500 }
    );
  }
}