import {
  getParticipantByToken,
  getPartyById,
  getParticipantsByParty,
  hasUserVoted,
} from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import VoteClient from '@/components/VoteClient';
import { isRedirectError, RedirectError } from '@/lib/errors/RedirectError';

interface VotePageProps {
  searchParams: Promise<{
    token: string;
  }>;
}

export default async function VotePage({ searchParams }: VotePageProps) {
  const token = (await searchParams).token as string;
  console.log('VotePage token:', token);

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
