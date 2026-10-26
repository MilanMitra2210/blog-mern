import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const backendRes = await fetch(`${BACKEND_URL}/blogs?${searchParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Server proxy error fetching blogs', error: err.message },
      { status: 500 }
    );
  }
}
