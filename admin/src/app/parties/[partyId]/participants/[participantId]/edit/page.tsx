import { notFound } from 'next/navigation';
import Link from 'next/link';
import ParticipantForm from '@/components/admin/ParticipantForm';
import { getParty, getParticipant, updateParticipant, getParticipants } from '@/lib/db/queries';
import { ParticipantFormData } from '@/lib/utils/validation';

interface EditParticipantPageProps {
  params: Promise<{
    partyId: string;
    participantId: string;
  }>;
}

export default async function EditParticipantPage(props: EditParticipantPageProps) {
  const params = await props.params;
  const { partyId, participantId } = params;

  const party = await getParty(partyId);
  const participants = await getParticipants(partyId);

  if (!party) {
    notFound();
  }

  const participant = await getParticipant(participantId);

  if (!participant || participant.party_id !== partyId) {
    notFound();
  }

  async function handleSubmit(data: ParticipantFormData) {
    'use server';

    await updateParticipant(participantId, data);
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
          <li className="text-text-primary before:content-['/'] before:mx-2">
            {participant.name} を編集
          </li>
        </ol>
      </nav>

      <ParticipantForm
        partyId={partyId}
        initialData={participant}
        onSubmit={handleSubmit}
        participants={participants}
        isSubmitting={false}
      />
    </div>
  );
}
