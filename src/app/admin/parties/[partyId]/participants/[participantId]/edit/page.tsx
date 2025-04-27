import { notFound, redirect } from 'next/navigation';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import ParticipantForm from '@/components/admin/ParticipantForm';
import { getParty, getParticipant, updateParticipant } from '@/lib/db/queries';
import { ParticipantFormData } from '@/lib/utils/validation';

interface EditParticipantPageProps {
  params: {
    partyId: string;
    participantId: string;
  };
}

export default async function EditParticipantPage({ params }: EditParticipantPageProps) {
  const { partyId, participantId } = params;
  
  const party = await getParty(partyId);
  
  if (!party) {
    notFound();
  }
  
  const participant = await getParticipant(participantId);
  
  if (!participant || participant.party_id !== partyId) {
    notFound();
  }
  
  async function handleSubmit(data: ParticipantFormData) {
    'use server';
    
    await updateParticipant(participantId, data);
    
    redirect(`/admin/parties/${partyId}/participants`);
  }
  
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/admin/parties">パーティ一覧</Link>
        <Link href={`/admin/parties/${partyId}`}>{party.name}</Link>
        <Link href={`/admin/parties/${partyId}/participants`}>参加者管理</Link>
        <Typography color="text.primary">{participant.name} を編集</Typography>
      </Breadcrumbs>
      
      <ParticipantForm 
        partyId={partyId}
        initialData={participant}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </Box>
  );
}
