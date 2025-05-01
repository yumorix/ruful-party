'use client';

import { useRouter } from 'next/navigation';
import DeleteModal from './DeleteModal';

interface DeleteParticipantButtonProps {
  partyId: string;
  participantId: string;
  participantName: string;
}

export default function DeleteParticipantButton({
  partyId,
  participantId,
  participantName,
}: DeleteParticipantButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/parties/${partyId}/participants/${participantId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete participant');
      }

      router.push(`/parties/${partyId}/participants`);
      router.refresh();
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  };

  return <DeleteModal itemType="参加者" itemName={participantName} deleteAction={handleDelete} />;
}
