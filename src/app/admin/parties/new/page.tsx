import { redirect } from 'next/navigation';
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
    <div>
      <nav className="mb-6" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/admin/parties" className="text-primary-main hover:underline">
              パーティ一覧
            </Link>
          </li>
          <li className="text-text-primary before:content-['/'] before:mx-2">
            新規パーティ
          </li>
        </ol>
      </nav>
      
      <PartyForm 
        onSubmit={handleSubmit}
        isSubmitting={false}
      />
    </div>
  );
}
