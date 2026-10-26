import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const referer = req.headers.get('referer') || req.headers.get('referrer') || '';
    const userAgent = req.headers.get('user-agent') || '';

    const backendRes = await fetch(`${BACKEND_URL}/blogs/${id}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'referer': referer,
        'user-agent': userAgent,
      },
      body: JSON.stringify({}),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'View beacon proxy error', error: err.message },
      { status: 500 }
    );
  }
}
