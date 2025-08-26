import { NextRequest, NextResponse } from 'next/server';
import { api } from '../../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const { userId, type } = await request.json();
    
    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      );
    }
    
    const result = await convex.query(api.usage.checkUsageLimit, {
      userId,
      type
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking usage limit:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
