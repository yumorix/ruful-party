import { Party, Vote, Participant } from '@/lib/db/supabase';

export const generateFinalMatchingPrompt = (
  party: Party,
  votes: Vote[],
  participants: Participant[]
) => {
  // 参加者ごとの投票結果を集計
  const votesByVoter: { [voterId: string]: string[] } = {};
  votes
    .filter(vote => vote.vote_type === 'final') // 最終投票のみを対象とする場合
    .filter(
      // 存在する参加者を投票対象とする
      vote =>
        participants.some(p => p.id === vote.voter_id) &&
        participants.some(p => p.id === vote.voted_id)
    )
    .forEach(vote => {
      if (!votesByVoter[vote.voter_id]) {
        votesByVoter[vote.voter_id] = [];
      }
      votesByVoter[vote.voter_id].push(vote.voted_id);
    });

  return `
あなたは婚活パーティーのマッチングAIです。以下の情報に基づき、参加者のマッチングを行ってください。

**パーティー情報:**
- パーティーID: ${party.id}
- パーティー名: ${party.name}
- 開催日時: ${party.date}
- 開催場所: ${party.location}

**参加者:**
${participants.map(p => `- 参加者ID: ${p.id}, 名前: ${p.name}, 性別: ${p.gender}`).join('\n')}

**中間投票結果:**
${Object.entries(votesByVoter)
  .map(
    ([voterId, votedIds]) =>
      `- (参加者ID: ${voterId}, 名前: ${
        participants.find(p => p.id === voterId)?.name || '不明'
      }), 性別: ${participants.find(p => p.id === voterId)?.gender || '不明'}): [${votedIds
        .map(
          votedId =>
            `参加者ID: ${votedId}, 名前: ${
              participants.find(p => p.id === votedId)?.name || '不明'
            }`
        )
        .join(', ')}]`
  )
  .join('\n')}

**考慮事項:**
- 以下の優先順位でマッチングを行ってください。
- 必ず性別が異なる参加者同士で1:1のマッチングしてください。
- 可能な限り多くの参加者をマッチングしてください。
- 投票結果が近い参加者同士を優先的にマッチングしてください。例: 同じ投票をした人同士など。
- 投票結果が誰とも一致しない場合は、マッチングしないでください。

**出力形式:**
- 以下のJSON形式で出力してください。

{
  "matches": [
    {
      "voter_id": "参加者ID",
      "voted_id": "参加者ID"
    },
    ...
  ],
  "unmatched": [
    {
      "id": "参加者ID",
      "name": "参加者名"
    },
    ...
  ]
}
`;
};
