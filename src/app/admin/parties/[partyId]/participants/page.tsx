import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getParty, getParticipants, createParticipant, updateParticipant, deleteParticipant } from '@/lib/db/queries';
import { ParticipantFormData } from '@/lib/utils/validation';
import { generateAccessToken } from '@/lib/utils/token';
import ParticipantForm from '@/components/admin/ParticipantForm';
import QRCodeGenerator from '@/components/admin/QRCodeGenerator';

interface ParticipantsPageProps {
  params: Promise<{
    partyId: string;
  }>;
}

export default async function ParticipantsPage(props: ParticipantsPageProps) {
  const params = await props.params;
  const { partyId } = params;

  const party = await getParty(partyId);

  if (!party) {
    notFound();
  }

  const participants = await getParticipants(partyId);

  // Group participants by gender
  const maleParticipants = participants.filter(p => p.gender === 'male');
  const femaleParticipants = participants.filter(p => p.gender === 'female');

  async function handleAddParticipant(data: ParticipantFormData) {
    'use server';
    
    await createParticipant({
      ...data,
      party_id: partyId,
      access_token: generateAccessToken(partyId, data.name)
    });
    
    redirect(`/admin/parties/${partyId}/participants`);
  }

  async function handleGenerateAllQRCodes() {
    'use server';
    
    // Generate access tokens for participants who don't have one
    for (const participant of participants) {
      if (!participant.access_token) {
        await updateParticipant(participant.id, {
          access_token: generateAccessToken(partyId, participant.name)
        });
      }
    }
    
    redirect(`/admin/parties/${partyId}/participants`);
  }

  async function handleDeleteParticipant(id: string) {
    'use server';
    
    await deleteParticipant(id);
    redirect(`/admin/parties/${partyId}/participants`);
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
            参加者管理
          </li>
        </ol>
      </nav>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          参加者管理
        </h1>
        
        <Link 
          href={`/admin/parties/${partyId}/participants/new`}
          className="inline-flex items-center px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          参加者を追加
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button className="px-4 py-2 border-b-2 border-primary-main text-primary-main font-medium">
              参加者一覧 ({participants.length})
            </button>
            <button className="px-4 py-2 text-gray-500 font-medium">
              QRコード生成
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">
              男性参加者 ({maleParticipants.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">参加者番号</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QRコード</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {maleParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        男性参加者がいません
                      </td>
                    </tr>
                  ) : (
                    maleParticipants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.participant_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {participant.access_token ? (
                            <span className="text-success-main">
                              生成済み
                            </span>
                          ) : (
                            <span className="text-error-main">
                              未生成
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/admin/parties/${partyId}/participants/${participant.id}/edit`}
                            className="text-primary-main hover:text-primary-dark mr-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </Link>
                          <button 
                            className="text-error-main hover:text-error-dark"
                            onClick={() => handleDeleteParticipant(participant.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">
              女性参加者 ({femaleParticipants.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">参加者番号</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QRコード</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {femaleParticipants.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        女性参加者がいません
                      </td>
                    </tr>
                  ) : (
                    femaleParticipants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.participant_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{participant.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {participant.access_token ? (
                            <span className="text-success-main">
                              生成済み
                            </span>
                          ) : (
                            <span className="text-error-main">
                              未生成
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/admin/parties/${partyId}/participants/${participant.id}/edit`}
                            className="text-primary-main hover:text-primary-dark mr-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </Link>
                          <button 
                            className="text-error-main hover:text-error-dark"
                            onClick={() => handleDeleteParticipant(participant.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <QRCodeGenerator 
          participants={participants}
          baseUrl={process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}
          onGenerateAll={handleGenerateAllQRCodes}
          isGenerating={false}
        />
      </div>
    </div>
  );
}
