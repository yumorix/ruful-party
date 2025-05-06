'use client';

import Image from 'next/image';

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
  seat_positions: any | null; //eslint-disable-line @typescript-eslint/no-explicit-any
  partner: Partner;
}

interface SeatingPlan {
  id: string;
  layout_data: any; //eslint-disable-line @typescript-eslint/no-explicit-any
  image_url: string | null;
}

interface ResultClientProps {
  participant: Participant;
  party: Party;
  matches: Match[];
  seatingPlan: SeatingPlan | null;
  initialError?: string | null;
}

export default function ResultClient({
  participant,
  party,
  matches,
  seatingPlan,
  initialError,
}: ResultClientProps) {
  if (initialError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content">
            <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
            <p className="mb-4">{initialError}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filter matches by type based on party mode
  const currentMatches = matches.filter(match => match.match_type === party.current_mode);
  const finalMatches = matches.filter(match => match.match_type === 'final');

  return (
    <div className="flex flex-col items-center p-4">
      <div className="card w-full max-w-md mb-4">
        <div className="card-content">
          <h2 className="text-xl font-bold mb-2">{party.name}</h2>
          <p className="mb-4">
            {party.current_mode === 'interim'
              ? '中間結果'
              : party.current_mode === 'final'
                ? '最終結果'
                : '結果'}
          </p>
          <div className="flex items-center mb-4">
            <div className="bg-primary-light text-white px-3 py-1 rounded-full text-sm">
              {participant.name}
            </div>
          </div>
        </div>
      </div>

      {/* Seating Plan (for interim results) */}
      {party.current_mode === 'interim' && seatingPlan && (
        <div className="card w-full max-w-md mb-4">
          <div className="card-content">
            <h3 className="font-bold mb-4">席替え結果</h3>
            {seatingPlan.image_url ? (
              <div className="relative w-full h-64 mb-4">
                <Image
                  src={seatingPlan.image_url}
                  alt="席配置図"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-center text-gray-500">席配置図は準備中です</p>
              </div>
            )}

            {currentMatches.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">あなたの席</h4>
                <ul className="space-y-2">
                  {currentMatches.map(match => (
                    <li key={match.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">
                            テーブル {match.table_number || '未定'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600 mr-2">隣席:</span>
                          <span className="font-medium">{match.partner.name}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Final Matches (for final results) */}
      {party.current_mode === 'final' && (
        <div className="card w-full max-w-md mb-4">
          <div className="card-content">
            <h3 className="font-bold mb-4">マッチング結果</h3>
            {finalMatches.length === 0 ? (
              <p className="text-center text-gray-500 p-4">マッチング結果はありません</p>
            ) : (
              <ul className="space-y-3">
                {finalMatches.map(match => (
                  <li
                    key={match.id}
                    className="p-4 bg-primary-main bg-opacity-5 border border-primary-light rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lg mb-1">{match.partner.name}</div>
                        <div className="text-sm text-gray-600">相互マッチングが成立しました！</div>
                      </div>
                      <div className="bg-success-main text-white rounded-full p-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Waiting message if party is active but no results yet */}
      {party.status === 'active' && matches.length === 0 && (
        <div className="card w-full max-w-md mb-4">
          <div className="card-content text-center">
            <p className="mb-4">結果はまだ発表されていません。</p>
            <p className="text-sm text-gray-500">
              しばらくお待ちください。結果が発表されると、このページに表示されます。
            </p>
          </div>
        </div>
      )}

      <button onClick={() => window.location.reload()} className="btn btn-primary w-full max-w-md">
        更新する
      </button>
    </div>
  );
}
