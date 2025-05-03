'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content">
            <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
            <p className="mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary w-full">
              再試行
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content text-center">
            <h2 className="text-xl font-bold text-success-main mb-4">投票完了</h2>
            <p className="mb-4">投票が正常に送信されました。</p>
            <p className="text-sm text-gray-500">結果ページに移動します...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="card w-full max-w-md mb-4">
        <div className="card-content">
          <h2 className="text-xl font-bold mb-2">{party.name}</h2>
          <p className="mb-4">{party.current_mode === 'interim' ? '中間投票' : '最終投票'}</p>
          <p className="text-sm mb-6">
            気になる相手を最大3人まで選択してください。
            <br />
            選択順が優先順位になります。
          </p>
        </div>
      </div>

      <div className="card w-full max-w-md mb-4">
        <div className="card-content">
          <h3 className="font-bold mb-4">投票対象者</h3>
          {voteOptions.length === 0 ? (
            <p className="text-center text-gray-500">投票対象者がいません</p>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">1人目</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-black"
                  value={firstChoice}
                  onChange={handleFirstChoiceChange}
                >
                  <option value="">選択してください</option>
                  {voteOptions.map(option => (
                    <option key={`first-${option.id}`} value={option.id}>
                      {option.participant_number}番
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">2人目</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-black"
                  value={secondChoice}
                  onChange={handleSecondChoiceChange}
                  disabled={!firstChoice}
                >
                  <option value="">選択してください</option>
                  {voteOptions.map(option => (
                    <option
                      key={`second-${option.id}`}
                      value={option.id}
                      disabled={option.id === firstChoice}
                    >
                      {option.participant_number}番
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">3人目</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-black"
                  value={thirdChoice}
                  onChange={handleThirdChoiceChange}
                  disabled={!secondChoice}
                >
                  <option value="">選択してください</option>
                  {voteOptions.map(option => (
                    <option
                      key={`third-${option.id}`}
                      value={option.id}
                      disabled={option.id === firstChoice || option.id === secondChoice}
                    >
                      {option.participant_number}番
                    </option>
                  ))}
                </select>
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
            ? 'bg-gray-300 cursor-not-allowed'
            : 'btn-primary'
        } w-full max-w-md`}
      >
        {submitting ? '送信中...' : '投票する'}
      </button>
    </div>
  );
}
