import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Token pricing: €0.50 per token
const TOKEN_PRICE = 0.50;

export async function POST(request: NextRequest) {
  try {
    const { userId, tokenCount } = await request.json();
    
    if (!userId || !tokenCount || tokenCount < 1) {
      return NextResponse.json(
        { error: 'userId and valid tokenCount are required' },
        { status: 400 }
      );
    }
    
    const totalPrice = tokenCount * TOKEN_PRICE;
    
    // Here you would integrate with your payment provider (Stripe, PayPal, etc.)
    // For now, we'll simulate a successful payment
    
    // Add tokens to user's account
    const result = await convex.mutation(api.usage.purchaseExtraTokens, {
      userId,
      tokenCount
    });
    
    return NextResponse.json({
      success: true,
      tokensAdded: tokenCount,
      totalPrice,
      message: `${tokenCount} zusätzliche Tokens erfolgreich hinzugefügt!`
    });
  } catch (error) {
    console.error('Error purchasing tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
