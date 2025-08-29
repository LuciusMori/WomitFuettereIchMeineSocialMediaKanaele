import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId, prompt, businessType, postTopic } = await request.json();
    
    if (!userId || !businessType || !postTopic) {
      return NextResponse.json(
        { error: 'userId, businessType and postTopic are required' },
        { status: 400 }
      );
    }

    // Check usage limit first
    const usageCheck = await convex.query(api.usage.checkUsageLimit, {
      userId,
      type: 'posts'
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
    
    const systemPrompt = `Du bist ein Social-Media-Experte für lokale Geschäfte in der DACH-Region. 

WICHTIG: Analysiere zuerst den Geschäftstyp "${businessType}" und das Thema "${postTopic}" um den passenden Tonfall zu bestimmen:

TONALITÄT-ANALYSE:
- Für Cafés, Restaurants, Bäckereien: Locker, herzlich, einladend
- Für Anwaltskanzleien, Steuerberater, Ärzte: Professionell, vertrauensvoll, seriös  
- Für Friseure, Beauty-Salons, Mode: Trendig, inspirierend, lifestyle-orientiert
- Für Handwerker, Autowerkstätten: Bodenständig, kompetent, zuverlässig
- Für Fitness-Studios, Yoga: Motivierend, energisch, gesundheitsbewusst

STIL-ANPASSUNG basierend auf Geschäftstyp:
1. LOCKER & WITZIG: Verwende umgangssprachliche Ausdrücke, Wortspiele, lockere Ansprache ("Hey", "Schaut mal"), mehr Emojis
2. PROFESSIONELL & INFORMATIV: Höfliche Sie-Form, sachliche Informationen, weniger Emojis, vertrauensvolle Sprache

Erstelle einen authentischen Social-Media-Post (4-5 Sätze) der GENAU zum Geschäftstyp passt. Der Post soll so klingen, als hätte ihn der Geschäftsinhaber selbst geschrieben - nicht wie generische KI-Texte.

Geschäftstyp: ${businessType}
Thema: "${postTopic}"

Sprich die Zielgruppe direkt an und verwende den passenden Tonfall für diesen Geschäftstyp.`;
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: systemPrompt
        }]
      }]
    });

    const generatedPost = result.response.text();

    // Increment usage counter after successful generation
    await convex.mutation(api.usage.incrementUsage, {
      userId,
      type: 'posts'
    });

    return NextResponse.json({
      success: true,
      content: generatedPost
    });

  } catch (error) {
    console.error('Error generating post:', error);
    return NextResponse.json(
      { error: 'Failed to generate post' },
      { status: 500 }
    );
  }
}