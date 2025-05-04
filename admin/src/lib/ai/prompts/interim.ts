import { Party, PartySetting, Vote, SeatingPlan, Participant } from '../../db/supabase';

export const generateInterimSeatingPlanPrompt = (
  party: Party,
  partySetting: PartySetting,
  votes: Vote[],
  seatingPlan: SeatingPlan,
  participants: Participant[] // 参加者情報も必要
) => {
  // 参加者ごとの投票結果を集計
  const votesByVoter: { [voterId: string]: string[] } = {};
  votes
    .filter(vote => vote.vote_type === 'interim') // 中間投票のみを対象とする場合
    .forEach(vote => {
      if (!votesByVoter[vote.voter_id]) {
        votesByVoter[vote.voter_id] = [];
      }
      votesByVoter[vote.voter_id].push(vote.voted_id);
    });

  return `
あなたは婚活パーティーの座席割り当てAIです。以下の情報に基づき、参加者の座席を割り当ててください。

**パーティー情報:**
- パーティーID: ${party.id}
- パーティー名: ${party.name}
- 開催日時: ${party.date}
- 開催場所: ${party.location}

**中間投票結果:**
${Object.entries(votesByVoter)
  .map(
    ([voterId, votedIds]) =>
      `- (参加者ID: ${voterId}, 名前: ${
        participants.find(p => p.id === voterId)?.name || '不明'
      }): [${votedIds
        .map(
          votedId =>
            `参加者ID: ${votedId}, 名前: ${
              participants.find(p => p.id === votedId)?.name || '不明'
            }`
        )
        .join(', ')}]`
  )
  .join('\n')}

**座席レイアウト:**
  - ${JSON.stringify(seatingPlan.layout_data)}

**考慮事項:**
- 中間投票で相互に投票し合った男女の参加者は、可能な限り同じテーブルに配置してください。
- 各テーブルの男女比は可能な限り均等に配置してください。

**出力形式:**
- 次のセッションの座席配置案 (テーブル番号: [参加者IDのリスト])
`;
};
