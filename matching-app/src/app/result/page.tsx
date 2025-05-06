import {
  getParticipantByToken,
  getPartyById,
  getMatchesByParticipant,
  getSeatingPlan,
} from '@/lib/db/queries';
import { isValidTokenFormat } from '@/lib/utils/token';
import ResultClient from '@/components/ResultClient';

interface Participant {
  id: string;
  name: string;
  gender: string;
}

interface Party {
  id: string;
  name: string;
  status: 'preparing' | 'active' | 'closed';
  current_mode: 'interim' | 'final' | 'closed';
}

interface Partner {
  id: string;
  name: string;
  gender: string;
}

interface Match {
  id: string;
  match_type: 'interim' | 'final';
  table_number: number | null;
  seat_positions: any | null;
  partner: Partner;
}

interface SeatingPlan {
  id: string;
  layout_data: any;
  image_url: string | null;
}

export default async function ResultPage({
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
          </div>
        </div>
      </div>
    );
  }

  try {
    // Get participant info
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

    // Check if party is active or closed
    if (party.status === 'preparing') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <div className="card w-full max-w-md">
            <div className="card-content">
              <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
              <p className="mb-4">パーティはまだ開始されていません</p>
            </div>
          </div>
        </div>
      );
    }

    // Get matches for this participant
    const matches = await getMatchesByParticipant(participant.id, party.id);

    // Get seating plan if available (only for interim matches)
    let seatingPlan = null;
    if (party.current_mode === 'interim') {
      seatingPlan = await getSeatingPlan(party.id, party.current_mode);
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

    // Render the client component with the fetched data
    return (
      <ResultClient
        participant={participant}
        party={party}
        matches={processedMatches}
        seatingPlan={seatingPlan}
      />
    );
  } catch (error) {
    console.error('Result page error:', error);
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
