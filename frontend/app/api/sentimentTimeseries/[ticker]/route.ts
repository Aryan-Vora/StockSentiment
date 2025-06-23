import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { ticker: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '30';
    
    const response = await fetch(`${BACKEND_URL}/api/sentimentTimeseries/${params.ticker}?days=${days}`);
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying sentiment timeseries request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sentiment timeseries data' },
      { status: 500 }
    );
  }
}
