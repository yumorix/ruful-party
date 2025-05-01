import { notFound } from 'next/navigation';
import Link from 'next/link';
import ParticipantForm from '@/components/admin/ParticipantForm';
import { getParty, createParticipant } from '@/lib/db/queries';
import { ParticipantFormData } from '@/lib/utils/validation';
import { generateAccessToken } from '@/lib/utils/token';

interface NewParticipantPageProps {
  params: Promise<{
    partyId: string;
  }>;
}

export default async function NewParticipantPage(props: NewParticipantPageProps) {
  const params = await props.params;
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
      access_token: generateAccessToken(partyId, data.name),
    });
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
          <li className="before:content-['/'] before:mx-2">
            <Link
              href={`/parties/${partyId}/participants`}
              className="text-primary-main hover:underline"
            >
              参加者管理
            </Link>
          </li>
          <li className="text-text-primary before:content-['/'] before:mx-2">参加者を追加</li>
        </ol>
      </nav>

      <ParticipantForm partyId={partyId} onSubmit={handleSubmit} isSubmitting={false} />
    </div>
  );
}
