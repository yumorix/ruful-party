'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { isValidTokenFormat } from '@/lib/utils/token';

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
  selected: boolean;
  rank: number | null;
}

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [party, setParty] = useState<Party | null>(null);
  const [voteOptions, setVoteOptions] = useState<VoteOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token || !isValidTokenFormat(token)) {
      setError('無効なアクセストークンです');
      setLoading(false);
      return;
    }

    async function validateToken() {
      try {
        const response = await fetch('/api/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'トークンの検証に失敗しました');
          setLoading(false);
          return;
        }

        setParticipant(data.participant);
        setParty(data.party);

        // Fetch potential vote options (other participants of opposite gender)
        const participantsResponse = await fetch(`/api/participants?party_id=${data.party.id}&gender=${data.participant.gender === 'male' ? 'female' : 'male'}`);
        
        if (!participantsResponse.ok) {
          setError('参加者情報の取得に失敗しました');
          setLoading(false);
          return;
        }

        const participantsData = await participantsResponse.json();
        setVoteOptions(
          participantsData.participants.map((p: any) => ({
            id: p.id,
            name: p.name,
            gender: p.gender,
            selected: false,
            rank: null,
          }))
        );

        setLoading(false);
      } catch (err) {
        console.error('Token validation error:', err);
        setError('サーバーエラーが発生しました');
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  const handleVoteSelection = (id: string) => {
    if (submitting || submitted) return;

    setVoteOptions(prev => {
      const selectedCount = prev.filter(option => option.selected).length;
      const option = prev.find(opt => opt.id === id);
      
      if (!option) return prev;
      
      // If already selected, deselect
      if (option.selected) {
        const updated = prev.map(opt => {
          if (opt.id === id) {
            return { ...opt, selected: false, rank: null };
          }
          // Reorder ranks for remaining selected options
          if (opt.selected && opt.rank && opt.rank > option.rank!) {
            return { ...opt, rank: opt.rank - 1 };
          }
          return opt;
        });
        return updated;
      }
      
      // If not selected and we haven't reached the limit of 3
      if (selectedCount < 3) {
        return prev.map(opt => {
          if (opt.id === id) {
            return { ...opt, selected: true, rank: selectedCount + 1 };
          }
          return opt;
        });
      }
      
      return prev;
    });
  };

  const handleSubmit = async () => {
    if (submitting || submitted) return;
    
    setSubmitting(true);
    
    try {
      const selectedVotes = voteOptions
        .filter(option => option.selected)
        .map(option => ({
          voted_id: option.id,
          rank: option.rank,
        }));
      
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
        router.push(`/result/${token}`);
      }, 3000);
    } catch (err) {
      console.error('Vote submission error:', err);
      setError('サーバーエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content text-center">
            <p>読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md">
          <div className="card-content">
            <h2 className="text-xl font-bold text-error-main mb-4">エラー</h2>
            <p className="mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary w-full"
            >
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
          <h2 className="text-xl font-bold mb-2">{party?.name}</h2>
          <p className="mb-4">
            {party?.current_mode === 'interim' ? '中間投票' : '最終投票'}
          </p>
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
            <ul className="space-y-2">
              {voteOptions.map((option) => (
                <li
                  key={option.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    option.selected
                      ? 'border-primary-main bg-primary-main bg-opacity-10'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleVoteSelection(option.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{option.name}</span>
                    </div>
                    {option.selected && (
                      <div className="bg-primary-main text-white rounded-full w-6 h-6 flex items-center justify-center">
                        {option.rank}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || voteOptions.filter(o => o.selected).length === 0}
        className={`btn ${
          submitting || voteOptions.filter(o => o.selected).length === 0
            ? 'bg-gray-300 cursor-not-allowed'
            : 'btn-primary'
        } w-full max-w-md`}
      >
        {submitting ? '送信中...' : '投票する'}
      </button>
    </div>
  );
}
