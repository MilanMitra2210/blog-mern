import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetch(`${BACKEND_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Comment submission proxy error', error: err.message },
      { status: 500 }
    );
  }
}
