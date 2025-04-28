'use client';

import { useRouter } from 'next/navigation';
import DeleteModal from './DeleteModal';

interface DeletePartyButtonProps {
  partyId: string;
  partyName: string;
}

export default function DeletePartyButton({ partyId, partyName }: DeletePartyButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/parties/${partyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete party');
      }

      router.push('/admin/parties');
      router.refresh();
    } catch (error) {
      console.error('Error deleting party:', error);
      throw error;
    }
  };

  return (
    <DeleteModal
      itemType="パーティ"
      itemName={partyName}
      deleteAction={handleDelete}
    />
  );
}
