import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId, businessType, postContent } = await request.json();
    
    if (!userId || !businessType || !postContent) {
      return NextResponse.json(
        { error: 'userId, businessType and postContent are required' },
        { status: 400 }
      );
    }

    // Check usage limit first
    const usageCheck = await convex.query(api.usage.checkUsageLimit, {
      userId,
      type: 'hashtags'
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
    
    const prompt = `Gib mir 5-7 relevante und effektive Hashtags (nur die Hashtags, mit # am Anfang, durch Leerzeichen getrennt) für diesen Social-Media-Post für ein/e ${businessType}: "${postContent}"`;
    
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: prompt
        }]
      }]
    });

    const generatedHashtags = result.response.text();

    // Increment usage counter after successful generation
    await convex.mutation(api.usage.incrementUsage, {
      userId,
      type: 'hashtags'
    });

    return NextResponse.json({
      success: true,
      content: generatedHashtags
    });

  } catch (error) {
    console.error('Error generating hashtags:', error);
    return NextResponse.json(
      { error: 'Failed to generate hashtags' },
      { status: 500 }
    );
  }
}