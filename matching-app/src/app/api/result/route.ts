import { NextRequest, NextResponse } from 'next/server';
import {
  getParticipantByToken,
  getPartyById,
  getMatchesByParticipant,
  getSeatingPlan,
} from '@/lib/db/queries';
import { tokenValidationSchema } from '@/lib/utils/validation';
import { isValidTokenFormat } from '@/lib/utils/token';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = tokenValidationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 });
    }

    const { token } = result.data;

    if (!isValidTokenFormat(token)) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 400 });
    }

    // Find the participant with this token
    const participant = await getParticipantByToken(token);
    if (!participant) {
      return NextResponse.json({ error: '参加者が見つかりませんでした' }, { status: 404 });
    }

    // Get the party information
    const party = await getPartyById(participant.party_id);
    if (!party) {
      return NextResponse.json({ error: 'パーティが見つかりませんでした' }, { status: 404 });
    }

    // Check if the party is active or closed
    if (party.status === 'preparing') {
      return NextResponse.json({ error: 'パーティはまだ開始されていません' }, { status: 403 });
    }

    // Get the participant's matches
    const matches = await getMatchesByParticipant(participant.id, party.id);

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

    // Get seating plan for interim matches only
    let seatingPlan = null;
    if (party.current_mode === 'interim') {
      seatingPlan = await getSeatingPlan(party.id, party.current_mode);
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
