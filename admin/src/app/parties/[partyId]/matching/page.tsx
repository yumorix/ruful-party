import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import SeatingPlanViewer from '@/components/admin/SeatingPlanViewer';
import GenerateSeatingPlanButton from '@/components/admin/GenerateSeatingPlanButton';
import GenerateFinalMatchingButton from '@/components/admin/GenerateFinalMatchingButton';
import { PartyCurrentMode } from '@/lib/utils/validation';
import {
  getParty,
  getParticipants,
  getVotes,
  getPartySetting,
  getMatches,
  getSeatingPlan,
  createOrUpdateSeatingPlan,
  updateParty,
  createMatches,
} from '@/lib/db/queries';
import {
  generateSeatingPlan as generateGeminiSeatingPlan,
  generateFinalMatching as generateGeminiFinalMatching,
} from '@/lib/ai/gemini';

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

  async function handleGenerateAISeatingPlan() {
    'use server';

    if (!settings) {
      throw new Error('パーティの設定が見つかりません');
    }

    const party = await getParty(partyId);
    if (!party) {
      throw new Error('パーティが見つかりません');
    }

    // Generate seating plan using Gemini AI
    const geminiResult = await generateGeminiSeatingPlan(
      party,
      settings,
      participants,
      interimVotes
    );

    if (!geminiResult) {
      throw new Error('座席レイアウトの生成に失敗しました');
    }

    try {
      const markdownRemoved = geminiResult.replace(/^```(json)?\n/, '').replace(/\n```$/, '');
      // Parse the JSON from the Gemini response
      const resultJson = JSON.parse(markdownRemoved);

      // Save the seating plan to the database
      await createOrUpdateSeatingPlan({
        party_id: partyId,
        plan_type: 'interim',
        layout_data: resultJson,
        image_url: '',
      });
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('座席レイアウトの解析に失敗しました');
    }

    redirect(`/parties/${partyId}/matching`);
  }

  async function handleGenerateAIFinalMatching() {
    'use server';

    const party = await getParty(partyId);
    if (!party) {
      throw new Error('パーティが見つかりません');
    }

    const participants = await getParticipants(partyId);
    const finalVotes = await getVotes(partyId, 'final');

    if (finalVotes.length === 0) {
      throw new Error('最終投票がありません');
    }

    try {
      // Generate final matching using Gemini AI
      const { matches } = await generateGeminiFinalMatching(party, participants, finalVotes);
      if (matches && matches.length !== 0) {
        // Save the final matches to the database
        await createMatches(
          partyId,
          matches.map(match => ({
            ...match,
          }))
        );
      }
    } catch (error) {
      console.error('Error generating final matching:', error);
      throw error;
    }

    redirect(`/parties/${partyId}/matching`);
  }

  async function handleChangeMode(mode: PartyCurrentMode) {
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
              party.current_mode === 'pre-voting'
                ? 'bg-green-100 text-green-800'
                : party.current_mode === 'interim'
                  ? 'bg-blue-100 text-blue-800'
                  : party.current_mode === 'final'
                    ? 'bg-red-100 text-red-800'
                    : party.current_mode === 'final-result'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-800'
            }
          `}
          >
            {party.current_mode === 'pre-voting'
              ? '投票前'
              : party.current_mode === 'interim'
                ? '中間投票'
                : party.current_mode === 'final'
                  ? '最終投票'
                  : party.current_mode === 'final-result'
                    ? '最終結果発表'
                    : 'クローズ'}
          </span>
        </h2>

        <div className="flex gap-4 mt-4">
          <form action={handleChangeMode.bind(null, 'pre-voting')}>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                party.current_mode === 'pre-voting'
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'border border-green-300 text-green-800 hover:bg-green-50'
              }`}
              type="submit"
            >
              投票前
            </button>
          </form>
          <form action={handleChangeMode.bind(null, 'interim')}>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                party.current_mode === 'interim'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'border border-blue-300 text-blue-800 hover:bg-blue-50'
              }`}
              type="submit"
            >
              中間投票
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
              最終投票
            </button>
          </form>
          <form action={handleChangeMode.bind(null, 'final-result')}>
            <button
              className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                party.current_mode === 'final-result'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'border border-amber-300 text-amber-800 hover:bg-amber-50'
              }`}
              type="submit"
            >
              最終結果発表
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

            <div className="flex gap-4">
              <GenerateSeatingPlanButton
                onGenerate={handleGenerateAISeatingPlan}
                disabled={interimVotes.length === 0 || !settings}
                hasExistingPlan={!!interimSeatingPlan}
              />
            </div>

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

            {interimSeatingPlan && (
              <div className="mt-8 border-t pt-6">
                <h4 className="text-base font-medium mb-4">席替え結果</h4>

                {interimSeatingPlan.layout_data &&
                typeof interimSeatingPlan.layout_data === 'object' &&
                'seatingArrangement' in interimSeatingPlan.layout_data &&
                Array.isArray(
                  (interimSeatingPlan.layout_data as { seatingArrangement: unknown })
                    .seatingArrangement
                ) ? (
                  <SeatingPlanViewer
                    seatingPlan={
                      interimSeatingPlan.layout_data as {
                        seatingArrangement: Array<{
                          tableNumber: number;
                          participants: Array<{
                            participantId: string;
                            name: string;
                            gender: string;
                          }>;
                        }>;
                      }
                    }
                    participants={participants}
                  />
                ) : (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500">
                      席替え結果の表示に対応していないフォーマットです。
                    </p>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-[200px]">
                      {JSON.stringify(interimSeatingPlan.layout_data, null, 2)}
                    </pre>
                  </div>
                )}
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

            <div className="flex gap-4">
              <GenerateFinalMatchingButton
                onGenerate={handleGenerateAIFinalMatching}
                disabled={finalVotes.length === 0}
                hasExistingMatches={finalMatches.length > 0}
              />
            </div>

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
                            <div
                              className={`flex justify-between items-center mb-2 ${
                                participant1.gender === 'male'
                                  ? 'bg-primary-light text-blue-400'
                                  : 'bg-secondary-light text-pink-400'
                              }`}
                            >
                              <span className="text-sm">
                                {participant1.participant_number}番 ({participant1.name})
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  participant1.gender === 'male'
                                    ? 'bg-primary-light text-blue-400'
                                    : 'bg-secondary-light text-pink-400'
                                }`}
                              >
                                {participant1.gender === 'male' ? '男性' : '女性'}
                              </span>
                            </div>
                            <div
                              className={`flex justify-between items-center mb-2 ${
                                participant2.gender === 'male'
                                  ? 'bg-primary-light text-blue-400'
                                  : 'bg-secondary-light text-pink-400'
                              }`}
                            >
                              <span className="text-sm">
                                {participant2.participant_number}番 ({participant2.name})
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  participant2.gender === 'male'
                                    ? 'bg-primary-light text-blue-400'
                                    : 'bg-secondary-light text-pink-400'
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
