import { NextRequest, NextResponse } from 'next/server';
import { submitVotes } from '@/lib/db/queries';
import { voteSubmissionSchema } from '@/lib/utils/validation';
import { isValidTokenFormat } from '@/lib/utils/token';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = voteSubmissionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: '投票データが無効です' }, { status: 400 });
    }

    const { token, votes } = result.data;

    if (!isValidTokenFormat(token)) {
      return NextResponse.json({ error: '無効なトークンです' }, { status: 400 });
    }

    // Submit votes using the query function
    await submitVotes(token, votes);

    return NextResponse.json({
      success: true,
      message: '投票が完了しました',
    });
  } catch (error) {
    console.error('Vote submission error:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
