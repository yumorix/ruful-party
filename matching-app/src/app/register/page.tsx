'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [participant, setParticipant] = useState<any>(null);
  const [party, setParty] = useState<any>(null);

  useEffect(() => {
    // Validate token and get participant info
    const validateToken = async () => {
      if (!token) {
        setError('無効なアクセストークンです');
        return;
      }

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
          return;
        }

        setParticipant(data.participant);
        setParty(data.party);
      } catch (err) {
        console.error('Token validation error:', err);
        setError('サーバーエラーが発生しました');
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('名前を入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/participants/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '名前の更新に失敗しました');
        setLoading(false);
        return;
      }

      // Redirect to vote page after successful registration
      router.push(`/vote?token=${token}`);
    } catch (err) {
      console.error('Name update error:', err);
      setError('サーバーエラーが発生しました');
      setLoading(false);
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

  if (!participant || !party) {
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

  return (
    <div className="flex flex-col items-center p-4">
      <div className="card w-full max-w-md mb-4">
        <div className="card-content">
          <h2 className="text-xl font-bold mb-2">{party.name}</h2>
          <p className="mb-4">参加者登録</p>
          <p className="text-sm mb-6">パーティに参加するための名前を入力してください。</p>
        </div>
      </div>

      <div className="card w-full max-w-md mb-4">
        <div className="card-content">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">お名前</label>
              <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-main text-black"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="お名前を入力してください"
                maxLength={50}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`btn ${
                loading || !name.trim() ? 'bg-gray-300 cursor-not-allowed' : 'btn-primary'
              } w-full`}
            >
              {loading ? '送信中...' : '登録する'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
