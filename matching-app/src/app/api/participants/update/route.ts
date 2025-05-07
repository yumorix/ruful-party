import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByToken, getPartyById } from '@/lib/db/queries';
import { supabase } from '@/lib/db/supabase';
import { isValidTokenFormat } from '@/lib/utils/token';
import { z } from 'zod';

// Name update validation schema
const nameUpdateSchema = z.object({
  token: z.string().min(1, { message: 'トークンは必須です' }),
  name: z
    .string()
    .min(1, { message: '名前は必須です' })
    .max(50, { message: '名前は50文字以内で入力してください' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = nameUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: '無効なリクエストです' }, { status: 400 });
    }

    const { token, name } = result.data;

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

    // Update participant name
    const { error: updateError } = await supabase
      .from('participants')
      .update({ name })
      .eq('id', participant.id);

    if (updateError) {
      console.error('Error updating participant name:', updateError);
      return NextResponse.json({ error: '名前の更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '名前が更新されました',
    });
  } catch (error) {
    console.error('Name update error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
