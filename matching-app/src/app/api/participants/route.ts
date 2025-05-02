import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('party_id');
    const gender = searchParams.get('gender');

    if (!partyId) {
      return NextResponse.json(
        { error: 'パーティIDが必要です' },
        { status: 400 }
      );
    }

    if (!gender || (gender !== 'male' && gender !== 'female')) {
      return NextResponse.json(
        { error: '性別が無効です' },
        { status: 400 }
      );
    }

    // Get the party information
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('id, status, current_mode')
      .eq('id', partyId)
      .single();

    if (partyError || !party) {
      return NextResponse.json(
        { error: 'パーティが見つかりませんでした' },
        { status: 404 }
      );
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
      return NextResponse.json(
        { error: '現在投票は受け付けていません' },
        { status: 403 }
      );
    }

    // Get participants of the specified gender
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('id, name, gender, participant_number')
      .eq('party_id', partyId)
      .eq('gender', gender)
      .order('participant_number', { ascending: true });

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return NextResponse.json(
        { error: '参加者情報の取得に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      participants: participants || [],
    });
  } catch (error) {
    console.error('Participants fetch error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
