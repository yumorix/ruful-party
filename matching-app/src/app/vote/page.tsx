import { getParticipantByToken, getPartyById, getParticipantsByParty } from '@/lib/db/queries';
import { isValidTokenFormat } from '@/lib/utils/token';
import VoteClient from '@/components/VoteClient';

interface Participant {
  id: string;
  name: string;
  gender: string;
}

interface Party {
  id: string;
  name: string;
  current_mode: 'interim' | 'final' | 'closed';
}

interface VoteOption {
  id: string;
  name: string;
  gender: string;
  participant_number: number;
}

export default async function VotePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const token = searchParams.token as string;

  // Loading state is handled by Suspense in the parent layout
  if (!token || !isValidTokenFormat(token)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content">
            <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
            <p className="mb-4">無効なアクセストークンです</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  try {
    // Validate token and get participant info
    const participant = await getParticipantByToken(token);
    if (!participant) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="card w-full max-w-md">
            <div className="card-content">
              <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
              <p className="mb-4">参加者が見つかりませんでした</p>
              <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
                再試行
              </button>
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
              <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
                再試行
              </button>
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
              <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
                再試行
              </button>
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
              <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
                再試行
              </button>
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
    console.error('Vote page error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content">
            <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
            <p className="mb-4">サーバーエラーが発生しました</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }
}
