'use client';

import Image from 'next/image';
import SeatingPlanViewer from './SeatingPlanViewer';

import { Participant } from '@/lib/db/supabase';

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
  allParticipants?: Participant[];
  initialError?: string | null;
}

export default function ResultClient({
  participant,
  party,
  matches,
  seatingPlan,
  allParticipants,
  initialError,
}: ResultClientProps) {
  if (initialError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in">
        <div className="card w-full max-w-md shadow-elegant overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-error-light via-error-main to-error-light"></div>
          <div className="card-content">
            <div className="flex items-center mb-4 text-error-main">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h2 className="text-xl font-serif">エラー</h2>
            </div>
            <div className="decorative-line w-24 mb-4"></div>
            <p className="mb-6 text-text-secondary">{initialError}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
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
    <div className="flex flex-col items-center p-4 animate-fade-in">
      <div className="card w-full max-w-md mb-6 shadow-elegant overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-secondary-light via-primary-light to-secondary-light"></div>
        <div className="card-content relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pattern-dots bg-dots-md opacity-5 -mr-10 -mt-10 rounded-full"></div>

          <h2 className="text-xl font-serif text-primary-dark mb-2">{party.name}</h2>
          <div className="flex items-center mb-4">
            <div className="h-px flex-grow bg-gray-100"></div>
            <span className="px-2 text-xl text-text-secondary font-medium">
              {party.current_mode === 'interim'
                ? '中間結果'
                : party.current_mode === 'final'
                  ? '最終結果'
                  : '結果'}
            </span>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>
        </div>
      </div>

      {/* Seating Plan (for interim results) */}
      {party.current_mode === 'interim' && seatingPlan && (
        <div className="card w-full max-w-md mb-6 shadow-card overflow-hidden animate-fade-in animate-delay-100">
          <div className="card-content">
            <h3 className="font-serif text-lg text-primary-dark mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-accent-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              席替え結果
            </h3>

            <div className="decorative-line w-24 mb-6"></div>

            {seatingPlan.image_url ? (
              <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden shadow-sm border border-gray-100">
                <Image
                  src={seatingPlan.image_url}
                  alt="席配置図"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : seatingPlan.layout_data &&
              typeof seatingPlan.layout_data === 'object' &&
              'seatingArrangement' in seatingPlan.layout_data &&
              Array.isArray(
                (seatingPlan.layout_data as { seatingArrangement: unknown }).seatingArrangement
              ) ? (
              <div className="mb-6">
                <SeatingPlanViewer
                  seatingPlan={
                    seatingPlan.layout_data as {
                      seatingArrangement: Array<{
                        tableNumber: number;
                        participants: Array<{
                          participantId: string;
                          name: string;
                          gender: string;
                        }>;
                      }>;
                    }
                  }
                  participants={
                    allParticipants || [
                      {
                        id: participant.id,
                        name: participant.name,
                        gender: participant.gender,
                        participant_number: participant.participant_number,
                      },
                    ]
                  }
                  currentParticipantId={participant.id}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-6 rounded-lg mb-6 text-center border border-gray-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-300 mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                <p className="text-gray-500 font-serif">席配置図は準備中です</p>
              </div>
            )}

            {currentMatches.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-4 text-primary-dark flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 text-accent-rose"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  あなたの席
                </h4>
                <ul className="space-y-3">
                  {currentMatches.map(match => (
                    <li
                      key={match.id}
                      className="p-4 bg-primary-light bg-opacity-5 border border-primary-light border-opacity-10 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-accent-navy bg-opacity-10 text-accent-navy rounded-full w-8 h-8 flex items-center justify-center mr-3 font-medium">
                            {match.table_number || '?'}
                          </div>
                          <span className="font-medium text-primary-dark">
                            テーブル {match.table_number || '未定'}
                          </span>
                        </div>
                        <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                          <span className="text-text-secondary mr-2 text-sm">隣席:</span>
                          <span className="font-medium text-text-primary">
                            {match.partner.name}
                          </span>
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
        <div className="card w-full max-w-md mb-6 shadow-card overflow-hidden animate-fade-in animate-delay-100">
          <div className="card-content">
            <h3 className="font-serif text-lg text-primary-dark mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-accent-rose"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              マッチング結果
            </h3>

            <div className="decorative-line w-24 mb-6"></div>

            {finalMatches.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-lg text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <p className="text-gray-500 font-serif mb-2">マッチング結果はありません</p>
                <p className="text-xs text-gray-400">
                  他の参加者とのマッチングが成立しませんでした
                </p>
              </div>
            ) : (
              <ul className="space-y-4">
                {finalMatches.map(match => (
                  <li
                    key={match.id}
                    className="p-5 bg-gradient-to-br from-primary-light to-secondary-light bg-opacity-10 rounded-xl shadow-sm border border-secondary-light border-opacity-20 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pattern-dots bg-dots-md opacity-10 -mr-6 -mt-6 rounded-full"></div>
                    <div className="flex items-center justify-between relative">
                      <div>
                        <div className="font-serif text-xl mb-2 text-primary-dark">
                          {match.partner.name}
                        </div>
                        <div className="flex items-center text-sm text-text-secondary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1 text-accent-rose"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                            />
                          </svg>
                          相互マッチングが成立しました！
                        </div>
                      </div>
                      <div className="bg-success-light bg-opacity-20 text-success-dark rounded-full p-3 shadow-sm border border-success-light border-opacity-30">
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
        <div className="card w-full max-w-md mb-6 shadow-card overflow-hidden animate-fade-in animate-delay-100">
          <div className="card-content text-center">
            <div className="w-16 h-16 bg-primary-light bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary-main"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-serif text-lg text-primary-dark mb-2">結果待ち</h3>
            <div className="decorative-line w-24 mx-auto mb-4"></div>
            <p className="mb-4 text-text-secondary">最終マッチング結果はまだ発表されていません。</p>
            <div className="bg-primary-light bg-opacity-5 rounded-lg p-4 border border-primary-light border-opacity-10 inline-block">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border border-primary-light border-t-primary-main mr-2"></div>
                <p className="text-sm text-text-secondary">
                  しばらくお待ちください。結果が発表されると、このページに表示されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => window.location.reload()}
        className="btn btn-primary w-full max-w-md flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        更新する
      </button>
    </div>
  );
}
