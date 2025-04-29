'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Party } from '@/lib/db/supabase';

interface PartyListProps {
  parties: Party[];
  onDelete: (id: string) => Promise<void>;
}

export default function PartyList({ parties, onDelete }: PartyListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (party: Party) => {
    setPartyToDelete(party);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partyToDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(partyToDelete.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting party:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPartyToDelete(null);
  };

  const getStatusChip = (status: Party['status']) => {
    switch (status) {
      case 'preparing':
        return <span className="chip chip-info">準備中</span>;
      case 'active':
        return <span className="chip chip-success">開催中</span>;
      case 'closed':
        return <span className="chip chip-default">終了</span>;
      default:
        return null;
    }
  };

  const getModeChip = (mode: Party['current_mode']) => {
    switch (mode) {
      case 'interim':
        return <span className="chip bg-primary-light text-primary-dark">中間投票</span>;
      case 'final':
        return <span className="chip chip-secondary">最終投票</span>;
      case 'closed':
        return <span className="chip chip-default">クローズ</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">
          パーティ一覧
        </h1>
        <Link
          href="/admin/parties/new"
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          新規パーティ
        </Link>
      </div>

      {parties.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <p className="text-center text-text-secondary">
              パーティがまだ登録されていません。「新規パーティ」ボタンから作成してください。
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {parties.map((party) => (
            <div key={party.id} className="card">
              <div className="card-content">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {party.name}
                    </h2>
                    <p className="text-text-secondary text-sm mb-2">
                      {format(new Date(party.date), 'yyyy年MM月dd日(E) HH:mm', { locale: ja })}
                    </p>
                    <p className="text-sm">
                      {party.location}
                    </p>
                    <p className="text-sm">
                      定員: {party.capacity}名
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusChip(party.status)}
                    {getModeChip(party.current_mode)}
                  </div>
                </div>
              </div>
              <div className="card-actions justify-end">
                <Link
                  href={`/admin/parties/${party.id}/participants`}
                  className="icon-button"
                  title="参加者管理"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </Link>
                <Link
                  href={`/admin/parties/${party.id}/settings`}
                  className="icon-button"
                  title="設定"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                {/* <Link
                  href={`/admin/parties/${party.id}/matching`}
                  className="icon-button"
                  title="マッチング"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </Link> */}
                <Link
                  href={`/admin/parties/${party.id}`}
                  className="btn btn-sm btn-outlined mr-2"
                >
                  詳細
                </Link>
                <Link
                  href={`/admin/parties/${party.id}/edit`}
                  className="btn btn-sm btn-outlined mr-2"
                >
                  編集
                </Link>
                <button
                  onClick={() => handleDeleteClick(party)}
                  className="icon-button text-error-main"
                  title="削除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">パーティを削除</h3>
            <div className="mb-6">
              <p className="text-text-secondary">
                {partyToDelete && `「${partyToDelete.name}」を削除します。この操作は元に戻せません。`}
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={handleDeleteCancel} 
                disabled={isDeleting}
                className="btn btn-outlined"
              >
                キャンセル
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                disabled={isDeleting}
                className="btn btn-error"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
