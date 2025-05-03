import { NextRequest, NextResponse } from 'next/server';
import { getPartyById, getParticipantsByParty } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('party_id');
    const gender = searchParams.get('gender');

    if (!partyId) {
      return NextResponse.json({ error: 'パーティIDが必要です' }, { status: 400 });
    }

    if (!gender || (gender !== 'male' && gender !== 'female')) {
      return NextResponse.json({ error: '性別が無効です' }, { status: 400 });
    }

    // Get the party information
    const party = await getPartyById(partyId);
    if (!party) {
      return NextResponse.json({ error: 'パーティが見つかりませんでした' }, { status: 404 });
    }

    // Check if the party is active
    if (party.status !== 'active') {
      return NextResponse.json(
        { error: 'パーティはまだ開始されていないか、既に終了しています' },
        { status: 403 }
      );
    }

    // Check if voting is open
    if (party.current_mode === 'closed') {
      return NextResponse.json({ error: '現在投票は受け付けていません' }, { status: 403 });
    }

    // Get participants of the specified gender
    const participants = await getParticipantsByParty(partyId, gender as 'male' | 'female');

    return NextResponse.json({
      participants: participants || [],
    });
  } catch (error) {
    console.error('Participants fetch error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
