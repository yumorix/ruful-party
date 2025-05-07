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

  if (!participant || !party) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="card w-full max-w-md shadow-card">
          <div className="card-content text-center">
            <div className="flex justify-center items-center h-20">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary-light opacity-30"></div>
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary-main absolute top-0 left-0"></div>
              </div>
            </div>
            <p className="text-text-secondary mt-4 font-serif">読み込み中...</p>
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
            <span className="px-2 text-xl text-text-secondary font-medium">参加者登録</span>
            <div className="h-px flex-grow bg-gray-100"></div>
          </div>

          <p className="text-text-secondary mb-6">
            パーティに参加するための名前を入力してください。
          </p>
        </div>
      </div>

      <div className="card w-full max-w-md mb-6 shadow-card overflow-hidden">
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">お名前</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary-main text-text-primary bg-white"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="お名前を入力してください"
                  maxLength={50}
                  required
                />
                {name && (
                  <div className="absolute right-3 top-3 text-primary-main">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                )}
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                ※ここで入力した名前は他の参加者には表示されません
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`btn ${
                loading || !name.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              } w-full flex items-center justify-center`}
            >
              {loading ? (
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  登録する
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-sm text-text-secondary">
        <p>入力いただいた情報は本イベントのみで使用します</p>
      </div>
    </div>
  );
}
