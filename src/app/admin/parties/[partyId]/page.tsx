import { notFound, redirect } from 'next/navigation';
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
    <div>
      <nav className="mb-6" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/admin/parties" className="text-primary-main hover:underline">
              パーティ一覧
            </Link>
          </li>
          <li className="text-text-primary before:content-['/'] before:mx-2">
            {party.name}
          </li>
        </ol>
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          パーティ編集
        </h1>
        
        <div className="flex gap-4">
          <Link 
            href={`/admin/parties/${partyId}/participants`}
            className="text-primary-main hover:underline"
          >
            参加者管理
          </Link>
          <Link 
            href={`/admin/parties/${partyId}/settings`}
            className="text-primary-main hover:underline"
          >
            設定
          </Link>
          {/* <Link 
            href={`/admin/parties/${partyId}/matching`}
            className="text-primary-main hover:underline"
          >
            マッチング
          </Link> */}
        </div>
      </div>
      
      <PartyForm 
        initialData={party}
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </div>
  );
}
