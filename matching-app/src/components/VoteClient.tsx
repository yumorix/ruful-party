'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { current_type } from '@/lib/db/queries';

interface Participant {
  id: string;
  name: string;
  gender: string;
}

interface Party {
  id: string;
  name: string;
  current_mode: current_type;
}

interface VoteOption {
  id: string;
  name: string;
  gender: string;
  participant_number: number;
}

interface VoteClientProps {
  token: string;
  participant: Participant;
  party: Party;
  voteOptions: VoteOption[];
  initialError?: string | null;
}

export default function VoteClient({
  token,
  participant,
  party,
  voteOptions,
  initialError,
}: VoteClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(initialError || null);
  const [firstChoice, setFirstChoice] = useState<string>('');
  const [secondChoice, setSecondChoice] = useState<string>('');
  const [thirdChoice, setThirdChoice] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle selection changes
  const handleFirstChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFirstChoice(value);

    // If the new selection is the same as second or third choice, clear those choices
    if (value === secondChoice) setSecondChoice('');
    if (value === thirdChoice) setThirdChoice('');
  };

  const handleSecondChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSecondChoice(value);

    // If the new selection is the same as first or third choice, clear third choice
    if (value === firstChoice) {
      setFirstChoice('');
    }
    if (value === thirdChoice) setThirdChoice('');
  };

  const handleThirdChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setThirdChoice(value);

    // If the new selection is the same as first or second choice, clear those choices
    if (value === firstChoice) setFirstChoice('');
    if (value === secondChoice) setSecondChoice('');
  };

  const handleSubmit = async () => {
    if (submitting || submitted) return;

    setSubmitting(true);

    try {
      const selectedVotes = [];

      if (firstChoice) {
        selectedVotes.push({
          voted_id: firstChoice,
          rank: 1,
        });
      }

      if (secondChoice) {
        selectedVotes.push({
          voted_id: secondChoice,
          rank: 2,
        });
      }

      if (thirdChoice) {
        selectedVotes.push({
          voted_id: thirdChoice,
          rank: 3,
        });
      }

      if (selectedVotes.length === 0) {
        setError('少なくとも1人は選択してください');
        setSubmitting(false);
        return;
      }

      const response = await fetch('/api/vote/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          votes: selectedVotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '投票の送信に失敗しました');
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setError(null);

      // Redirect to result page after successful submission
      setTimeout(() => {
        router.push(`/result?token=${token}`);
      }, 3000);
    } catch (err) {
      console.error('Vote submission error:', err);
      setError('サーバーエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
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
            <p className="mb-6 text-text-secondary">{error}</p>
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

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in">
        <div className="card w-full max-w-md shadow-elegant overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-success-light via-success-main to-success-light"></div>
          <div className="card-content text-center">
            <div className="w-16 h-16 bg-success-light bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-success-main"
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
            <h2 className="text-xl font-serif text-success-main mb-4">投票完了</h2>
            <div className="decorative-line w-24 mx-auto mb-4"></div>
            <p className="mb-4 text-text-secondary">投票が正常に送信されました。</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-text-secondary">
              <div className="animate-spin rounded-full h-4 w-4 border border-gray-300 border-t-primary-main"></div>
              <p>結果ページに移動します...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4 animate-fade-in">
      <div className="card w-full max-w-md mb-6 shadow-elegant overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-secondary-light via-primary-light to-secondary-light"></div>
        <div className="card-content relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pattern-dots bg-dots-md opacity-5 -mr-10 -mt-10 rounded-full"></div>

          <div className="flex items-center mb-4">
            <div className="h-px flex-grow bg-gray-100"></div>
            <span className="px-2 text-xl text-text-secondary font-medium">
              {party.current_mode === 'interim' ? '中間投票' : '最終投票'}
            </span>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>

          <div className="bg-primary-light bg-opacity-5 rounded-lg p-4 border border-primary-light border-opacity-10 mb-6">
            <div>
              <p className="text-text-primary font-medium mb-1">{`あなたは${participant.name}さんです`}</p>
              <p className="text-sm text-text-secondary">
                気になる相手を最大3人まで選択してください。
                <br />
                選択順が優先順位になります。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card w-full max-w-md mb-6 shadow-card overflow-hidden">
        <div className="card-content">
          <h3 className="font-serif text-xl text-primary-dark mb-6">投票対象者</h3>

          {voteOptions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">投票対象者がいません</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-gold rounded-full"></div>
                <div className="pl-4">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    第一希望
                    <span className="text-xs ml-1 text-accent-gold">(最も気になる方)</span>
                  </label>
                  <select
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main text-text-primary bg-white text-base"
                    value={firstChoice}
                    onChange={handleFirstChoiceChange}
                  >
                    <option value="" className="py-2 text-base">
                      選択してください
                    </option>
                    {voteOptions.map(option => (
                      <option
                        key={`first-${option.id}`}
                        value={option.id}
                        className="py-2 text-base"
                      >
                        {option.participant_number}番
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-rose rounded-full opacity-80"></div>
                <div className="pl-4">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    第二希望
                  </label>
                  <select
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main text-text-primary bg-white text-base ${
                      !firstChoice ? 'bg-gray-50 border-gray-200 text-gray-400' : 'border-gray-200'
                    }`}
                    value={secondChoice}
                    onChange={handleSecondChoiceChange}
                    disabled={!firstChoice}
                  >
                    <option value="" className="py-2 text-base">
                      選択してください
                    </option>
                    {voteOptions.map(option => (
                      <option
                        key={`second-${option.id}`}
                        value={option.id}
                        disabled={option.id === firstChoice}
                        className="py-2 text-base"
                      >
                        {option.participant_number}番
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent-navy rounded-full opacity-60"></div>
                <div className="pl-4">
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    第三希望
                  </label>
                  <select
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main text-text-primary bg-white text-base ${
                      !secondChoice ? 'bg-gray-50 border-gray-200 text-gray-400' : 'border-gray-200'
                    }`}
                    value={thirdChoice}
                    onChange={handleThirdChoiceChange}
                    disabled={!secondChoice}
                  >
                    <option value="" className="py-2 text-base">
                      選択してください
                    </option>
                    {voteOptions.map(option => (
                      <option
                        key={`third-${option.id}`}
                        value={option.id}
                        disabled={option.id === firstChoice || option.id === secondChoice}
                        className="py-2 text-base"
                      >
                        {option.participant_number}番
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || (!firstChoice && !secondChoice && !thirdChoice)}
        className={`btn ${
          submitting || (!firstChoice && !secondChoice && !thirdChoice)
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'btn-primary'
        } w-full max-w-md flex items-center justify-center`}
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
            送信中...
          </>
        ) : (
          <>
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
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            投票する
          </>
        )}
      </button>

      <div className="mt-6 text-center text-xs text-text-secondary">
        <p>投票内容は後で変更できません。慎重に選択してください。</p>
      </div>
    </div>
  );
}
