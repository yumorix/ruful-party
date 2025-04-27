import { notFound, redirect } from 'next/navigation';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import PartyForm from '@/components/admin/PartyForm';
import { getParty, updateParty } from '@/lib/db/queries';
import { PartyFormData } from '@/lib/utils/validation';

interface PartyPageProps {
  params: {
    partyId: string;
  };
}

export default async function PartyPage({ params }: PartyPageProps) {
  const { partyId } = params;
  
  const party = await getParty(partyId);
  
  if (!party) {
    notFound();
  }
  
  async function handleSubmit(data: PartyFormData) {
    'use server';
    
    await updateParty(partyId, data);
    redirect(`/admin/parties/${partyId}`);
  }
  
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/admin/parties">パーティ一覧</Link>
        <Typography color="text.primary">{party.name}</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          パーティ編集
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href={`/admin/parties/${partyId}/participants`} passHref>
            <Typography component="a" sx={{ textDecoration: 'none' }}>
              参加者管理
            </Typography>
          </Link>
          <Link href={`/admin/parties/${partyId}/settings`} passHref>
            <Typography component="a" sx={{ textDecoration: 'none' }}>
              設定
            </Typography>
          </Link>
          <Link href={`/admin/parties/${partyId}/matching`} passHref>
            <Typography component="a" sx={{ textDecoration: 'none' }}>
              マッチング
            </Typography>
          </Link>
        </Box>
      </Box>
      
      <PartyForm 
        initialData={party}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </Box>
  );
}
