import {
  getParticipantByToken,
  getPartyById,
  getParticipantsByParty,
  hasUserVoted,
} from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import VoteClient from '@/components/VoteClient';
import { isRedirectError, RedirectError } from '@/lib/errors/RedirectError';

// Default name pattern to check if name needs to be updated
const DEFAULT_NAME_PATTERN = /^参加者\d+$/; // Matches "参加者1", "参加者2", etc.

interface VotePageProps {
  searchParams: Promise<{
    token: string;
  }>;
}

export default async function VotePage({ searchParams }: VotePageProps) {
  const token = (await searchParams).token as string;

  // Loading state is handled by Suspense in the parent layout
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content">
            <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
            <p className="mb-4">無効なアクセストークンです</p>
          </div>
        </div>
      </div>
    );
  }

  try {
    // Check if user has already voted
    const alreadyVoted = await hasUserVoted(token);
    if (alreadyVoted) {
      throw new RedirectError(`/result?token=${token}`);
    }

    // Validate token and get participant info
    const participant = await getParticipantByToken(token);
    if (!participant) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="card w-full max-w-md">
            <div className="card-content">
              <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
              <p className="mb-4">参加者が見つかりませんでした</p>
            </div>
          </div>
        </div>
      );
    }

    // Check if the participant needs to register their name
    const needsNameRegistration =
      !participant.name ||
      participant.name.trim() === '' ||
      DEFAULT_NAME_PATTERN.test(participant.name);

    if (needsNameRegistration) {
      throw new RedirectError(`/register?token=${token}`);
    }

    // Get party info
    const party = await getPartyById(participant.party_id);
    if (!party) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="card w-full max-w-md">
            <div className="card-content">
              <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
              <p className="mb-4">パーティが見つかりませんでした</p>
            </div>
          </div>
        </div>
      );
    }

    // Check if party is active
    if (party.status !== 'active') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="card w-full max-w-md">
            <div className="card-content">
              <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
              <p className="mb-4">パーティはまだ開始されていないか、既に終了しています</p>
            </div>
          </div>
        </div>
      );
    }

    // Check if voting is open
    if (party.current_mode === 'closed') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="card w-full max-w-md">
            <div className="card-content">
              <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
              <p className="mb-4">現在投票は受け付けていません</p>
            </div>
          </div>
        </div>
      );
    }

    // Check if it's pre-voting mode
    if (party.current_mode === 'pre-voting') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="card w-full max-w-md">
            <div className="card-content text-center">
              <h2 className="text-xl font-bold text-primary-main mb-4">
                パーティをお楽しみください
              </h2>
              <p className="mb-4">投票はまだ始まっていません。パーティをお楽しみください。</p>
              <div className="decorative-line w-24 mx-auto mb-4"></div>
              <p className="text-sm text-text-secondary">
                投票が始まりましたら、再度アクセスしてください。
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Get potential vote options (other participants of opposite gender)
    const oppositeGender = participant.gender === 'male' ? 'female' : 'male';
    const voteOptions = await getParticipantsByParty(party.id, oppositeGender);

    // Render the client component with the fetched data
    return (
      <VoteClient token={token} participant={participant} party={party} voteOptions={voteOptions} />
    );
  } catch (error) {
    if (isRedirectError(error)) {
      redirect(error.path);
    }
    console.error('Vote page error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content">
            <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
            <p className="mb-4">サーバーエラーが発生しました</p>
          </div>
        </div>
      </div>
    );
  }
}
