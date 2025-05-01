import { Suspense } from 'react';
import PartyList from '../../components/admin/PartyList';
import { getParties, deleteParty } from '../../lib/db/queries';

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
    <div>
      <Suspense fallback={
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-main"></div>
        </div>
      }>
        <PartiesContent />
      </Suspense>
    </div>
  );
}
