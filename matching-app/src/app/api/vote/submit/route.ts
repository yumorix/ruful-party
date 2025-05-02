import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import { isValidTokenFormat } from '@/lib/utils/token';
import { ulid } from 'ulid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, votes } = body;

    if (!token || !isValidTokenFormat(token)) {
      return NextResponse.json(
        { error: '無効なトークンです' },
        { status: 400 }
      );
    }

    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      return NextResponse.json(
        { error: '投票データが無効です' },
        { status: 400 }
      );
    }

    // Find the participant with this token
    const { data: participant, error } = await supabase
      .from('participants')
      .select('id, party_id')
      .eq('access_token', token)
      .single();

    if (error || !participant) {
      return NextResponse.json(
        { error: '参加者が見つかりませんでした' },
        { status: 404 }
      );
    }

    // Get the party information
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('id, status, current_mode')
      .eq('id', participant.party_id)
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

    // Check if the participant has already voted in this round
    const { data: existingVotes, error: votesError } = await supabase
      .from('votes')
      .select('id')
      .eq('voter_id', participant.id)
      .eq('party_id', party.id)
      .eq('vote_type', party.current_mode);

    if (existingVotes && existingVotes.length > 0) {
      return NextResponse.json(
        { error: 'すでに投票済みです' },
        { status: 400 }
      );
    }

    // Prepare vote data
    const voteData = votes.map((vote: any, index: number) => ({
      id: ulid(),
      party_id: party.id,
      voter_id: participant.id,
      voted_id: vote.voted_id,
      vote_type: party.current_mode,
      rank: vote.rank || index + 1,
    }));

    // Insert votes
    const { error: insertError } = await supabase
      .from('votes')
      .insert(voteData);

    if (insertError) {
      console.error('Vote insertion error:', insertError);
      return NextResponse.json(
        { error: '投票の保存に失敗しました' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: '投票が完了しました',
    });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
