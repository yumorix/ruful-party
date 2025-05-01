import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getParty, getParticipant } from '@/lib/db/queries';
import DeleteParticipantButton from '@/components/admin/DeleteParticipantButton';

interface ParticipantDetailPageProps {
  params: Promise<{
    partyId: string;
    participantId: string;
  }>;
}

export default async function ParticipantDetailPage(props: ParticipantDetailPageProps) {
  const params = await props.params;
  const { partyId, participantId } = params;

  const party = await getParty(partyId);

  if (!party) {
    notFound();
  }

  const participant = await getParticipant(participantId);

  if (!participant || participant.party_id !== partyId) {
    notFound();
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
          <li className="before:content-['/'] before:mx-2">
            <Link href={`/admin/parties/${partyId}/participants`} className="text-primary-main hover:underline">
              参加者管理
            </Link>
          </li>
          <li className="text-text-primary before:content-['/'] before:mx-2">
            {participant.name}
          </li>
        </ol>
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          参加者詳細
        </h1>
        
        <div className="flex gap-2">
          <Link 
            href={`/admin/parties/${partyId}/participants/${participantId}/edit`}
            className="inline-flex items-center px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            編集
          </Link>
          
          <DeleteParticipantButton 
            partyId={partyId} 
            participantId={participantId} 
            participantName={participant.name} 
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">基本情報</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">参加者番号</p>
                <p className="font-medium">{participant.participant_number}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">名前</p>
                <p className="font-medium">{participant.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">性別</p>
                <p className="font-medium">
                  {participant.gender === 'male' ? '男性' : '女性'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">QRコード情報</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">アクセストークン</p>
                <p className="font-medium">
                  {participant.access_token ? (
                    <span className="text-success-main">生成済み</span>
                  ) : (
                    <span className="text-error-main">未生成</span>
                  )}
                </p>
              </div>
              
              {participant.access_token && (
                <div>
                  <p className="text-sm text-gray-500">QRコードURL</p>
                  <p className="font-medium break-all">
                    {`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/vote?token=${participant.access_token}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <Link 
          href={`/admin/parties/${partyId}/participants`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          参加者一覧に戻る
        </Link>
      </div>
    </div>
  );
}
