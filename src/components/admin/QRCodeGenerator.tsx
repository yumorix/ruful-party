'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/db/supabase';
import { generateQRCodeUrl } from '@/lib/utils/token';

interface QRCodeGeneratorProps {
  participants: Participant[];
  baseUrl: string;
  onGenerateAll: () => Promise<void>;
  isGenerating: boolean;
}

export default function QRCodeGenerator({ 
  participants, 
  baseUrl,
  onGenerateAll,
  isGenerating
}: QRCodeGeneratorProps) {
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>(participants);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredParticipants(
        participants.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.participant_number.toString().includes(searchTerm)
        )
      );
    } else {
      setFilteredParticipants(participants);
    }
  }, [searchTerm, participants]);
  
  const handleGenerateAll = async () => {
    try {
      setError(null);
      await onGenerateAll();
    } catch (error) {
      console.error('Error generating QR codes:', error);
      setError('QRコードの生成中にエラーが発生しました。もう一度お試しください。');
    }
  };
  
  const handlePrintAll = () => {
    window.print();
  };
  
  return (
    <div className="card max-w-6xl mx-auto">
      <div className="card-content">
        <h2 className="text-2xl font-semibold mb-4">
          QRコード生成
        </h2>
        
        <div className="space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="relative min-w-[300px]">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-main"
                placeholder="名前または参加者番号"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-text-secondary">
                参加者を検索
              </label>
            </div>
            
            <div className="flex gap-4">
              <button
                className="btn btn-outlined"
                onClick={handlePrintAll}
                disabled={participants.length === 0}
              >
                すべて印刷
              </button>
              <button
                className="btn btn-primary"
                onClick={handleGenerateAll}
                disabled={isGenerating || participants.length === 0}
              >
                {isGenerating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </span>
                ) : 'すべてのQRコードを生成'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-error-light text-error-dark p-4 rounded-lg">
              {error}
            </div>
          )}
          
          {filteredParticipants.length === 0 ? (
            <div className="bg-info-light text-info-dark p-4 rounded-lg">
              {participants.length === 0 
                ? '参加者が登録されていません。参加者を追加してください。' 
                : '検索条件に一致する参加者が見つかりません。'}
            </div>
          ) : (
            <div className="qr-code-grid">
              <div className="flex flex-wrap gap-6">
                {filteredParticipants.map((participant) => (
                  <div key={participant.id} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)]">
                    <div className="card qr-code-card">
                      <div className="card-content">
                        <h3 className="text-xl font-semibold">
                          {participant.name}
                        </h3>
                        <p className="text-text-secondary text-sm mb-1">
                          参加者番号: {participant.participant_number}
                        </p>
                        <p className="text-text-secondary text-sm mb-3">
                          性別: {participant.gender === 'male' ? '男性' : '女性'}
                        </p>
                        
                        {participant.access_token ? (
                          <div className="mt-4 text-center">
                            <img 
                              src={generateQRCodeUrl(participant.access_token, baseUrl)}
                              alt={`QR Code for ${participant.name}`}
                              className="w-full max-w-[200px] h-auto mx-auto"
                            />
                          </div>
                        ) : (
                          <div className="mt-4 text-center p-6 bg-gray-100 rounded-lg">
                            <p className="text-text-secondary">
                              QRコードが生成されていません
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="card-actions">
                        <p className="text-xs ml-2">
                          {participant.access_token 
                            ? `トークン: ${participant.access_token.substring(0, 8)}...` 
                            : 'トークンなし'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .qr-code-grid, .qr-code-grid * {
            visibility: visible;
          }
          .qr-code-grid {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .qr-code-card {
            page-break-inside: avoid;
            margin: 10mm;
            border: 1px solid #ddd;
          }
        }
      `}</style>
    </div>
  );
}
