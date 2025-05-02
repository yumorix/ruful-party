import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 400 });
    }

    // Find the participant with this token
    const { data: participant, error } = await supabase
      .from('participants')
      .select('id, name, gender, party_id')
      .eq('access_token', token)
      .single();

    if (error || !participant) {
      return NextResponse.json({ error: '参加者が見つかりませんでした' }, { status: 404 });
    }

    // Get the party information
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('id, name, status, current_mode')
      .eq('id', participant.party_id)
      .single();

    if (partyError || !party) {
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

    return NextResponse.json({
      participant: {
        id: participant.id,
        name: participant.name,
        gender: participant.gender,
      },
      party: {
        id: party.id,
        name: party.name,
        current_mode: party.current_mode,
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
