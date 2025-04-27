import { notFound, redirect } from 'next/navigation';
import { Box, Typography, Breadcrumbs } from '@mui/material';
import Link from 'next/link';
import SettingForm from '@/components/admin/SettingForm';
import { getParty, getPartySetting, createOrUpdatePartySetting } from '@/lib/db/queries';
import { PartySettingsFormData } from '@/lib/utils/validation';

interface SettingsPageProps {
  params: {
    partyId: string;
  };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { partyId } = params;
  
  const party = await getParty(partyId);
  
  if (!party) {
    notFound();
  }
  
  const settings = await getPartySetting(partyId);
  
  async function handleSubmit(data: PartySettingsFormData) {
    'use server';
    
    // Ensure all required fields are present
    const settingsData = {
      party_id: partyId,
      seating_layout: data.seating_layout,
      matching_rule: data.matching_rule || {
        prioritizeMutualMatches: true,
        considerVoteRanking: true,
        balanceGenderRatio: true
      },
      gender_rules: data.gender_rules || {
        requireMixedGender: true,
        alternateSeating: true
      }
    };
    
    await createOrUpdatePartySetting(settingsData);
    
    redirect(`/admin/parties/${partyId}/settings`);
  }
  
  return (
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link href="/admin/parties">パーティ一覧</Link>
        <Link href={`/admin/parties/${partyId}`}>{party.name}</Link>
        <Typography color="text.primary">設定</Typography>
      </Breadcrumbs>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          パーティ設定
        </Typography>
      </Box>
      
      <SettingForm 
        partyId={partyId}
        initialData={settings || undefined}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </Box>
  );
}
