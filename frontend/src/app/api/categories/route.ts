import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/blogs/categories`, {
      cache: 'no-store',
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Categories proxy error', error: err.message },
      { status: 500 }
    );
  }
}
