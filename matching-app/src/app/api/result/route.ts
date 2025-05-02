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

    // Check if the party is active or closed
    if (party.status === 'preparing') {
      return NextResponse.json({ error: 'パーティはまだ開始されていません' }, { status: 403 });
    }

    // Get the participant's matches
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select(
        `
        id, 
        match_type, 
        table_number, 
        seat_positions,
        participant1_id, 
        participant2_id,
        participants1:participants!matches_participant1_id_fkey(id, name, gender),
        participants2:participants!matches_participant2_id_fkey(id, name, gender)
      `
      )
      .eq('party_id', party.id)
      .or(`participant1_id.eq.${participant.id},participant2_id.eq.${participant.id}`);

    if (matchesError) {
      console.error('Error fetching matches:', matchesError);
      return NextResponse.json({ error: 'マッチング結果の取得に失敗しました' }, { status: 500 });
    }

    // Process matches to get the correct partner information
    const processedMatches = matches.map(match => {
      const isParticipant1 = match.participant1_id === participant.id;
      const partner = isParticipant1 ? match.participants2 : match.participants1;

      return {
        id: match.id,
        match_type: match.match_type,
        table_number: match.table_number,
        seat_positions: match.seat_positions,
        partner: {
          id: partner.id,
          name: partner.name,
          gender: partner.gender,
        },
      };
    });

    // Get seating plan for interim matches
    let seatingPlan = null;
    if (party.current_mode === 'interim' || party.current_mode === 'final') {
      const { data: plan, error: planError } = await supabase
        .from('seating_plans')
        .select('id, layout_data, image_url')
        .eq('party_id', party.id)
        .eq('plan_type', party.current_mode)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!planError && plan) {
        seatingPlan = plan;
      }
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
        status: party.status,
        current_mode: party.current_mode,
      },
      matches: processedMatches,
      seatingPlan: seatingPlan,
    });
  } catch (error) {
    console.error('Result access error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
