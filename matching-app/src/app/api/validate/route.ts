import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByToken, getPartyById } from '@/lib/db/queries';
import { tokenValidationSchema } from '@/lib/utils/validation';
import { isValidTokenFormat } from '@/lib/utils/token';

// Default name pattern to check if name needs to be updated
const DEFAULT_NAME_PATTERN = /^参加者\d+$/; // Matches "参加者1", "参加者2", etc.

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

    // Check if the participant needs to register their name
    // This checks if the name matches the default pattern or is empty
    const needsNameRegistration =
      !participant.name ||
      participant.name.trim() === '' ||
      DEFAULT_NAME_PATTERN.test(participant.name);

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
      needsNameRegistration,
    });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
