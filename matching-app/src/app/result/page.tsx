import {
  getParticipantByToken,
  getPartyById,
  getMatchesByParticipant,
  getSeatingPlan,
  getAllParticipantsByParty,
  current_type,
} from '@/lib/db/queries';
import { Participant } from '@/lib/db/supabase';
import ResultClient from '@/components/ResultClient';
import { redirect } from 'next/navigation';

// Default name pattern to check if name needs to be updated
const DEFAULT_NAME_PATTERN = /^参加者\d+$/; // Matches "参加者1", "参加者2", etc.

interface ResultPageProps {
  searchParams: Promise<{
    token: string;
  }>;
}

export default async function ResultPage({ searchParams }: ResultPageProps) {
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

    // Check if the participant needs to register their name
    const needsNameRegistration =
      !participant.name ||
      participant.name.trim() === '' ||
      DEFAULT_NAME_PATTERN.test(participant.name);

    if (needsNameRegistration) {
      // Redirect to register page if name registration is needed
      redirect(`/register?token=${token}`);
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

    // Get seating plan if available (for interim matches)
    let seatingPlan = null;
    let allParticipants: Participant[] = [];
    if (party.current_mode === 'interim') {
      seatingPlan = await getSeatingPlan(party.id, party.current_mode);
      // If seating plan exists, fetch all participants for the party
      if (seatingPlan && seatingPlan.layout_data) {
        allParticipants = await getAllParticipantsByParty(party.id);
      }
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
        allParticipants={allParticipants}
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
