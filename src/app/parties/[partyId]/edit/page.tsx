import { notFound } from 'next/navigation';
import Link from 'next/link';
import PartyForm from '@/components/admin/PartyForm';
import { getParty, updateParty } from '@/lib/db/queries';
import { PartyFormData } from '@/lib/utils/validation';

interface EditPartyPageProps {
  params: Promise<{
    partyId: string;
  }>;
}

export default async function EditPartyPage(props: EditPartyPageProps) {
  const params = await props.params;
  const { partyId } = params;

  const party = await getParty(partyId);

  if (!party) {
    notFound();
  }

  async function handleSubmit(data: PartyFormData) {
    'use server';

    await updateParty(partyId, data);
  }

  return (
    <div>
      <nav className="mb-6" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/parties" className="text-primary-main hover:underline">
              パーティ一覧
            </Link>
          </li>
          <li className="before:content-['/'] before:mx-2">
            <Link href={`/parties/${partyId}`} className="text-primary-main hover:underline">
              {party.name}
            </Link>
          </li>
          <li className="text-text-primary before:content-['/'] before:mx-2">編集</li>
        </ol>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">パーティ編集</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <PartyForm initialData={party} onSubmit={handleSubmit} isSubmitting={false} />
      </div>

      <div className="mt-6 flex justify-between">
        <Link
          href={`/parties/${partyId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          パーティ詳細に戻る
        </Link>
      </div>
    </div>
  );
}
