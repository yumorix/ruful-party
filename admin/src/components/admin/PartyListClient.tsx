'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { Party } from '../../lib/db/supabase';

export default function PartyListClient() {
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch parties on component mount and set up auto-refresh
  useEffect(() => {
    fetchParties(true);

    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchParties(false);
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchParties = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const response = await fetch('/api/parties');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'パーティの取得中にエラーが発生しました。');
      }

      const data = await response.json();
      setParties(data as Party[]);

      // Clear any previous errors when fetch is successful
      if (error) {
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching parties:', err);
      setError(err instanceof Error ? err.message : 'パーティの取得中にエラーが発生しました。');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleDeleteClick = (party: Party) => {
    setPartyToDelete(party);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!partyToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/parties/${partyToDelete.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'パーティの削除中にエラーが発生しました。');
      }

      // Remove the deleted party from the state
      setParties(parties.filter(party => party.id !== partyToDelete.id));
      setDeleteDialogOpen(false);
      setPartyToDelete(null);
    } catch (err) {
      console.error('Error deleting party:', err);
      setError(err instanceof Error ? err.message : 'パーティの削除中にエラーが発生しました。');
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
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold mr-2">パーティ一覧</h1>
          <button
            onClick={() => fetchParties(true)}
            className="icon-button"
            title="更新"
            disabled={loading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`}
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
          </button>
        </div>
        <Link href="/parties/new" className="btn btn-primary flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          新規パーティ
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="card-content">
            <p className="text-center text-red-500">{error}</p>
            <div className="flex justify-center mt-4">
              <button onClick={() => fetchParties(true)} className="btn btn-primary">
                再読み込み
              </button>
            </div>
          </div>
        </div>
      ) : parties.length === 0 ? (
        <div className="card">
          <div className="card-content">
            <p className="text-center text-text-secondary">
              パーティがまだ登録されていません。「新規パーティ」ボタンから作成してください。
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          {parties.map(party => (
            <div key={party.id} className="card">
              <div className="card-content">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{party.name}</h2>
                    <p className="text-text-secondary text-sm mb-2">
                      {format(new Date(party.date), 'yyyy年MM月dd日(E) HH:mm', { locale: ja })}
                    </p>
                    <p className="text-sm">{party.location}</p>
                    <p className="text-sm">定員: {party.capacity}名</p>
                  </div>
                  <div className="flex space-x-2">
                    {getStatusChip(party.status)}
                    {getModeChip(party.current_mode)}
                  </div>
                </div>
              </div>
              <div className="card-actions justify-end">
                <Link
                  href={`/parties/${party.id}/participants`}
                  className="icon-button"
                  title="参加者管理"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </Link>
                <Link href={`/parties/${party.id}/settings`} className="icon-button" title="設定">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
                <Link
                  href={`/parties/${party.id}/matching`}
                  className="icon-button"
                  title="マッチング"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </Link>
                <Link href={`/parties/${party.id}`} className="btn btn-sm btn-outlined mr-2">
                  詳細
                </Link>
                <Link href={`/parties/${party.id}/edit`} className="btn btn-sm btn-outlined mr-2">
                  編集
                </Link>
                <button
                  onClick={() => handleDeleteClick(party)}
                  className="btn btn-sm bg-red-400 text-white hover:bg-red-500"
                >
                  削除
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
                {partyToDelete &&
                  `「${partyToDelete.name}」を削除します。この操作は元に戻せません。`}
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
                className="btn bg-red-400 text-white hover:bg-red-500"
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
