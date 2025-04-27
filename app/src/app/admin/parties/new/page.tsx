import { redirect } from 'next/navigation';
import { Box, Typography, Paper, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import PartyForm from '@/components/admin/PartyForm';
import { createParty } from '@/lib/db/queries';
import { PartyFormData } from '@/lib/utils/validation';

export default function NewPartyPage() {
  async function handleSubmit(data: PartyFormData) {
    'use server';
    
    const newParty = await createParty(data);
    redirect(`/admin/parties/${newParty.id}`);
  }
  
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/admin/parties">パーティ一覧</Link>
        <Typography color="text.primary">新規パーティ</Typography>
      </Breadcrumbs>
      
      <PartyForm 
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </Box>
  );
}
