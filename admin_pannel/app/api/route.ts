import { NextRequest, NextResponse } from 'next/server';
import { logApiRequest } from '@/lib/utils';

// GET / - Basic route to check server status
export async function GET(request: NextRequest) {
  logApiRequest(request, '/api');
  
  return NextResponse.json(
    { message: "Hello World!!!" },
    { status: 200 }
  );
}
