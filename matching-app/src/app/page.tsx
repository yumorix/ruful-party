'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    // If token is provided in query params, redirect to vote page
    if (token) {
      router.push(`/vote?token=${token}`);
    }
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <h1 className="text-2xl font-bold mb-6">RufulParty</h1>
      <div className="card w-full max-w-md">
        <div className="card-content">
          <p className="text-center mb-4">QRコードをスキャンして参加者情報を入力してください。</p>
          <div className="flex justify-center">
            <div className="bg-gray-200 rounded-lg p-8 w-48 h-48 flex items-center justify-center">
              <p className="text-gray-500">QRコード</p>
            </div>
          </div>
          <p className="text-center mt-4 text-sm text-gray-500">
            このページは直接アクセスできません。
            <br />
            イベント主催者から提供されたQRコードをスキャンしてください。
          </p>
        </div>
      </div>
    </div>
  );
}
