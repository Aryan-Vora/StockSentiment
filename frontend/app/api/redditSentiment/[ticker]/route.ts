import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/redditSentiment/${params.ticker}`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying reddit sentiment request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reddit sentiment data' },
      { status: 500 }
    );
  }
}
