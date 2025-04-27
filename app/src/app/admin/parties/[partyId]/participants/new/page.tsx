import { notFound, redirect } from 'next/navigation';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import ParticipantForm from '@/components/admin/ParticipantForm';
import { getParty, createParticipant } from '@/lib/db/queries';
import { ParticipantFormData } from '@/lib/utils/validation';
import { generateAccessToken } from '@/lib/utils/token';

interface NewParticipantPageProps {
  params: {
    partyId: string;
  };
}

export default async function NewParticipantPage({ params }: NewParticipantPageProps) {
  const { partyId } = params;
  
  const party = await getParty(partyId);
  
  if (!party) {
    notFound();
  }
  
  async function handleSubmit(data: ParticipantFormData) {
    'use server';
    
    await createParticipant({
      ...data,
      party_id: partyId,
      access_token: generateAccessToken(partyId, data.name)
    });
    
    redirect(`/admin/parties/${partyId}/participants`);
  }
  
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/admin/parties">パーティ一覧</Link>
        <Link href={`/admin/parties/${partyId}`}>{party.name}</Link>
        <Link href={`/admin/parties/${partyId}/participants`}>参加者管理</Link>
        <Typography color="text.primary">参加者を追加</Typography>
      </Breadcrumbs>
      
      <ParticipantForm 
        partyId={partyId}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </Box>
  );
}
