import { Suspense } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import PartyList from '@/components/admin/PartyList';
import { getParties, deleteParty } from '@/lib/db/queries';

async function PartiesContent() {
  const parties = await getParties();
  
  const handleDelete = async (id: string) => {
    'use server';
    await deleteParty(id);
  };
  
  return (
    <PartyList 
      parties={parties} 
      onDelete={handleDelete}
    />
  );
}

export default function PartiesPage() {
  return (
    <Box>
      <Suspense fallback={
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      }>
        <PartiesContent />
      </Suspense>
    </Box>
  );
}
