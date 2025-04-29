'use client';

import { useState } from 'react';

interface DeleteModalProps {
  itemType: string;
  itemName: string;
  deleteAction: () => Promise<void>;
  cancelAction?: () => void;
}

export default function DeleteModal({
  itemType,
  itemName,
  deleteAction,
  cancelAction,
}: DeleteModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    if (cancelAction) {
      cancelAction();
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAction();
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="inline-flex items-center px-4 py-2 bg-red-400 text-white rounded-lg font-medium hover:bg-red-500 transition-colors duration-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        削除
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-semibold mb-4">{itemType}を削除</h3>
            <div className="mb-6">
              <p className="text-text-secondary">
                「{itemName}」を削除します。この操作は元に戻せません。
              </p>
            </div>
            <div className="flex justify-end space-x-2">
              <button onClick={handleClose} disabled={isDeleting} className="btn btn-outlined">
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn bg-red-400 text-white hover:bg-red-500"
              >
                {isDeleting ? '削除中...' : '削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
