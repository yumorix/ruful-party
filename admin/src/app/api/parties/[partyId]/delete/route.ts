import { NextRequest, NextResponse } from 'next/server';
import { deleteParty } from '@/lib/db/queries';

interface RouteParams {
  params: Promise<{
    partyId: string;
  }>;
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  try {
    const { partyId } = await props.params;

    if (!partyId) {
      return NextResponse.json({ error: 'パーティIDが必要です' }, { status: 400 });
    }

    await deleteParty(partyId);

    return NextResponse.json({ message: 'パーティが正常に削除されました' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting party:', error);
    return NextResponse.json({ error: 'パーティの削除中にエラーが発生しました' }, { status: 500 });
  }
}
