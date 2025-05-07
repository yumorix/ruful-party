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
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 animate-fade-in">
      <h1 className="text-3xl font-serif text-primary-dark mb-8 tracking-wide flex items-center">
        <span className="text-accent-gold">R</span>uful
        <span className="text-accent-rose mx-1">P</span>arty
      </h1>

      <div className="card w-full max-w-md shadow-elegant overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-secondary-light via-primary-light to-secondary-light"></div>
        <div className="card-content relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-pattern-dots bg-dots-md opacity-5 -mr-10 -mt-10 rounded-full"></div>

          <h2 className="text-xl font-serif text-center mb-6 text-primary-dark">
            婚活マッチングシステム
          </h2>

          <div className="decorative-line w-32 mx-auto mb-6"></div>

          <p className="text-center mb-6 text-text-secondary">
            QRコードをスキャンして参加者情報を入力してください。
          </p>

          <div className="flex justify-center mb-6">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-8 w-48 h-48 flex items-center justify-center shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-pattern-lines bg-lines-sm opacity-10"></div>
              <p className="text-gray-400 font-serif relative">QRコード</p>
            </div>
          </div>

          <div className="bg-primary-light bg-opacity-5 rounded-lg p-4 border border-primary-light border-opacity-10">
            <p className="text-center text-sm text-text-secondary">
              このページは直接アクセスできません。
              <br />
              イベント主催者から提供されたQRコードをスキャンしてください。
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center text-sm text-gray-400">
        <span className="decorative-dot"></span>
        <span>素敵な出会いを</span>
        <span className="decorative-dot"></span>
      </div>
    </div>
  );
}
