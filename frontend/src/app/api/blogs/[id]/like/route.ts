import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendRes = await fetch(`${BACKEND_URL}/blogs/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Like proxy error', error: err.message },
      { status: 500 }
    );
  }
}
