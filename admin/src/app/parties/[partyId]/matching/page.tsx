import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import {
  getParty,
  getParticipants,
  getVotes,
  getPartySetting,
  getMatches,
  getSeatingPlan,
  createMatches,
  createOrUpdateSeatingPlan,
  updateParty,
} from '../../../../lib/db/queries';
import { generateMatches } from '../../../../lib/ai/matchingEngine';
import { generateSeatingPlan } from '../../../../lib/ai/seatingPlanner';

interface MatchingPageProps {
  params: Promise<{
    partyId: string;
  }>;
}

export default async function MatchingPage({ params }: MatchingPageProps) {
  const { partyId } = await params;

  const party = await getParty(partyId);

  if (!party) {
    notFound();
  }

  const participants = await getParticipants(partyId);
  const interimVotes = await getVotes(partyId, 'interim');
  const finalVotes = await getVotes(partyId, 'final');
  const settings = await getPartySetting(partyId);
  const interimMatches = await getMatches(partyId, 'interim');
  const finalMatches = await getMatches(partyId, 'final');
  const interimSeatingPlan = await getSeatingPlan(partyId, 'interim');
  // const finalSeatingPlan = await getSeatingPlan(partyId, 'final');

  // const maleParticipants = participants.filter(p => p.gender === 'male');
  // const femaleParticipants = participants.filter(p => p.gender === 'female');

  async function handleGenerateInterimMatches() {
    'use server';

    if (!settings) {
      throw new Error('パーティの設定が見つかりません');
    }

    // Generate matches using AI
    const matchingResult = await generateMatches(participants, interimVotes, 'interim');

    // Create match records
    const matchesToCreate = matchingResult.pairs.map(([p1Id, p2Id], index) => ({
      party_id: partyId,
      match_type: 'interim' as const,
      participant1_id: p1Id,
      participant2_id: p2Id,
      table_number: Math.floor(index / 3) + 1, // 3 pairs per table
      seat_positions: {
        p1: (index % 3) * 2,
        p2: (index % 3) * 2 + 1,
      },
    }));

    await createMatches(matchesToCreate);

    // Generate seating plan
    const seatingPlanResult = await generateSeatingPlan(participants, interimVotes, settings);

    await createOrUpdateSeatingPlan({
      party_id: partyId,
      plan_type: 'interim',
      layout_data: JSON.parse(JSON.stringify(seatingPlanResult.layoutData)),
      image_url: '',
    });

    redirect(`/parties/${partyId}/matching`);
  }

  async function handleGenerateFinalMatches() {
    'use server';

    if (!settings) {
      throw new Error('パーティの設定が見つかりません');
    }

    // Generate matches using AI
    const matchingResult = await generateMatches(participants, finalVotes, 'final');

    // Create match records
    const matchesToCreate = matchingResult.pairs.map(([p1Id, p2Id]) => ({
      party_id: partyId,
      match_type: 'final' as const,
      participant1_id: p1Id,
      participant2_id: p2Id,
      table_number: 0, // Not relevant for final matches
      seat_positions: {},
    }));

    await createMatches(matchesToCreate);

    // 最終投票では席替えは不要なので、席配置の生成は行わない

    redirect(`/parties/${partyId}/matching`);
  }

  async function handleChangeMode(mode: 'interim' | 'final' | 'closed') {
    'use server';

    await updateParty(partyId, {
      current_mode: mode,
    });

    redirect(`/parties/${partyId}/matching`);
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
          <li className="text-text-primary before:content-['/'] before:mx-2">マッチング</li>
        </ol>
      </nav>

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">マッチング管理</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold mb-2">
          現在のモード:{' '}
          <span
            className={`
            inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
            ${
              party.current_mode === 'interim'
                ? 'bg-blue-100 text-blue-800'
                : party.current_mode === 'final'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-800'
            }
          `}
          >
            {party.current_mode === 'interim'
              ? '中間投票'
              : party.current_mode === 'final'
                ? '最終投票'
                : 'クローズ'}
          </span>
        </h2>

        <div className="flex gap-4 mt-4">
          <form action={handleChangeMode.bind(null, 'interim')}>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                party.current_mode === 'interim'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'border border-blue-300 text-blue-800 hover:bg-blue-50'
              }`}
              type="submit"
            >
              中間投票モード
            </button>
          </form>
          <form action={handleChangeMode.bind(null, 'final')}>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                party.current_mode === 'final'
                  ? 'bg-red-100 text-red-800 border border-red-300'
                  : 'border border-red-300 text-red-800 hover:bg-red-50'
              }`}
              type="submit"
            >
              最終投票モード
            </button>
          </form>
          <form action={handleChangeMode.bind(null, 'closed')}>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                party.current_mode === 'closed'
                  ? 'bg-gray-100 text-gray-800 border border-gray-300'
                  : 'border border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
              type="submit"
            >
              クローズ
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button className="px-4 py-2 border-b-2 border-primary-main text-primary-main font-medium">
              中間マッチング
            </button>
            <button className="px-4 py-2 text-gray-500 font-medium">最終マッチング</button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">中間マッチング</h3>

            <div className="mb-4">
              <p className="text-sm mb-1">投票数: {interimVotes.length}</p>
              <p className="text-sm mb-1">マッチング数: {interimMatches.length}</p>
              <p className="text-sm mb-1">席替え: {interimSeatingPlan ? '生成済み' : '未生成'}</p>
            </div>

            <form action={handleGenerateInterimMatches}>
              <button
                className="px-4 py-2 rounded-lg font-medium bg-primary-main text-white hover:bg-primary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={interimVotes.length === 0 || !settings}
              >
                中間マッチングを生成
              </button>
            </form>

            {interimMatches.length > 0 && (
              <div className="mt-6">
                <h4 className="text-base font-medium mb-2">マッチング結果</h4>

                <div className="flex flex-wrap gap-4">
                  {interimMatches.map(match => {
                    const participant1 = participants.find(p => p.id === match.participant1_id);
                    const participant2 = participants.find(p => p.id === match.participant2_id);

                    if (!participant1 || !participant2) return null;

                    return (
                      <div key={match.id} className="w-full sm:w-[45%] md:w-[30%]">
                        <div className="bg-white rounded-lg shadow">
                          <div className="p-4">
                            <h5 className="text-sm font-medium mb-2">
                              テーブル {match.table_number}
                            </h5>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm">
                                {participant1.name} (#{participant1.participant_number})
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  participant1.gender === 'male'
                                    ? 'bg-primary-light text-primary-dark'
                                    : 'bg-secondary-light text-secondary-dark'
                                }`}
                              >
                                {participant1.gender === 'male' ? '男性' : '女性'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                {participant2.name} (#{participant2.participant_number})
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  participant2.gender === 'male'
                                    ? 'bg-primary-light text-primary-dark'
                                    : 'bg-secondary-light text-secondary-dark'
                                }`}
                              >
                                {participant2.gender === 'male' ? '男性' : '女性'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <hr className="my-8 border-gray-200" />

          <div>
            <h3 className="text-lg font-semibold mb-2">最終マッチング</h3>

            <div className="mb-4">
              <p className="text-sm mb-1">投票数: {finalVotes.length}</p>
              <p className="text-sm mb-1">マッチング数: {finalMatches.length}</p>
            </div>

            <form action={handleGenerateFinalMatches}>
              <button
                className="px-4 py-2 rounded-lg font-medium bg-secondary-main text-white hover:bg-secondary-dark transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={finalVotes.length === 0 || !settings}
              >
                最終マッチングを生成
              </button>
            </form>

            {finalMatches.length > 0 && (
              <div className="mt-6">
                <h4 className="text-base font-medium mb-2">マッチング結果</h4>

                <div className="flex flex-wrap gap-4">
                  {finalMatches.map(match => {
                    const participant1 = participants.find(p => p.id === match.participant1_id);
                    const participant2 = participants.find(p => p.id === match.participant2_id);

                    if (!participant1 || !participant2) return null;

                    return (
                      <div key={match.id} className="w-full sm:w-[45%] md:w-[30%]">
                        <div className="bg-white rounded-lg shadow">
                          <div className="p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm">
                                {participant1.name} (#{participant1.participant_number})
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  participant1.gender === 'male'
                                    ? 'bg-primary-light text-primary-dark'
                                    : 'bg-secondary-light text-secondary-dark'
                                }`}
                              >
                                {participant1.gender === 'male' ? '男性' : '女性'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">
                                {participant2.name} (#{participant2.participant_number})
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  participant2.gender === 'male'
                                    ? 'bg-primary-light text-primary-dark'
                                    : 'bg-secondary-light text-secondary-dark'
                                }`}
                              >
                                {participant2.gender === 'male' ? '男性' : '女性'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
