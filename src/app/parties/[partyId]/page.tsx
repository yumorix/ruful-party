import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getParty, getParticipants } from '@/lib/db/queries';
import DeletePartyButton from '@/components/admin/DeletePartyButton';

interface PartyPageProps {
  params: Promise<{
    partyId: string;
  }>;
}

export default async function PartyPage(props: PartyPageProps) {
  const params = await props.params;
  const { partyId } = params;

  const party = await getParty(partyId);

  if (!party) {
    notFound();
  }

  const participants = await getParticipants(partyId);
  const maleParticipants = participants.filter(p => p.gender === 'male');
  const femaleParticipants = participants.filter(p => p.gender === 'female');

  // Format date for display
  const formattedDate = new Date(party.date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div>
      <nav className="mb-6" aria-label="breadcrumb">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/parties" className="text-primary-main hover:underline">
              パーティ一覧
            </Link>
          </li>
          <li className="text-text-primary before:content-['/'] before:mx-2">{party.name}</li>
        </ol>
      </nav>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">パーティ詳細</h1>

        <div className="flex gap-2">
          <Link
            href={`/parties/${partyId}/edit`}
            className="inline-flex items-center px-4 py-2 bg-primary-main text-white rounded-lg font-medium hover:bg-primary-dark transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            編集
          </Link>

          <DeletePartyButton partyId={partyId} partyName={party.name} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Party Information Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">パーティ情報</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">パーティ名</p>
              <p className="font-medium">{party.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">日時</p>
              <p className="font-medium">{formattedDate}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">場所</p>
              <p className="font-medium">{party.location}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">定員</p>
              <p className="font-medium">{party.capacity}人</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">ステータス</p>
              <p className="font-medium">
                {party.status === 'preparing' && <span className="text-warning-main">準備中</span>}
                {party.status === 'active' && <span className="text-success-main">開催中</span>}
                {party.status === 'closed' && <span className="text-error-main">終了</span>}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">現在のモード</p>
              <p className="font-medium">
                {party.current_mode === 'interim' && (
                  <span className="text-info-main">中間投票</span>
                )}
                {party.current_mode === 'final' && (
                  <span className="text-primary-main">最終投票</span>
                )}
                {party.current_mode === 'closed' && <span className="text-gray-500">クローズ</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Participants Statistics Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">参加者統計</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">総参加者数</p>
              <p className="font-medium text-2xl">
                {participants.length} / {party.capacity}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div
                  className="bg-primary-main h-2.5 rounded-full"
                  style={{
                    width: `${Math.min(100, (participants.length / party.capacity) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">男性</p>
                <p className="font-medium text-xl">{maleParticipants.length}人</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">女性</p>
                <p className="font-medium text-xl">{femaleParticipants.length}人</p>
              </div>
            </div>

            <div className="mt-4">
              <Link
                href={`/parties/${partyId}/participants`}
                className="inline-flex items-center text-primary-main hover:underline"
              >
                参加者一覧を見る
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">クイックアクション</h2>

          <div className="space-y-3">
            <Link
              href={`/parties/${partyId}/participants/new`}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-main mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
              <span>参加者を追加</span>
            </Link>

            <Link
              href={`/parties/${partyId}/settings`}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-main mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>パーティ設定</span>
            </Link>

            <Link
              href={`/parties/${partyId}/matching`}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary-main mr-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>マッチング管理</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
