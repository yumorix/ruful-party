'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // If token is provided in query params, validate and redirect
    if (token) {
      setIsValidating(true);

      // Validate the token and check if name registration is needed
      fetch('/api/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.needsNameRegistration) {
            // Redirect to register page if name registration is needed
            router.push(`/register?token=${token}`);
          } else {
            // Redirect to vote page if name is already set
            router.push(`/vote?token=${token}`);
          }
        })
        .catch(error => {
          console.error('Token validation error:', error);
          // On error, redirect to vote page and let it handle the error
          router.push(`/vote?token=${token}`);
        })
        .finally(() => {
          setIsValidating(false);
        });
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
