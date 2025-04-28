import { notFound } from 'next/navigation';
import Link from 'next/link';
import SettingForm from '@/components/admin/SettingForm';
import { getParty, getPartySetting, createOrUpdatePartySetting } from '@/lib/db/queries';
import { PartySettingsFormData } from '@/lib/utils/validation';

interface SettingsPageProps {
  params: Promise<{
    partyId: string;
  }>;
}

export default async function SettingsPage(props: SettingsPageProps) {
  const params = await props.params;
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
  }

  return (
    <div>
      <nav className="mb-6" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/admin/parties" className="text-primary-main hover:underline">
              パーティ一覧
            </Link>
          </li>
          <li className="before:content-['/'] before:mx-2">
            <Link href={`/admin/parties/${partyId}`} className="text-primary-main hover:underline">
              {party.name}
            </Link>
          </li>
          <li className="text-text-primary before:content-['/'] before:mx-2">
            設定
          </li>
        </ol>
      </nav>
      
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">
          パーティ設定
        </h1>
      </div>
      
      <SettingForm 
        partyId={partyId}
        initialData={settings || undefined}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </div>
  );
}
