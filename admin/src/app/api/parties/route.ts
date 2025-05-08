import { NextRequest, NextResponse } from 'next/server';
import { getParties } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const parties = await getParties();

    return NextResponse.json(parties, { status: 200 });
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json({ error: 'パーティの取得中にエラーが発生しました' }, { status: 500 });
  }
}
