import { supabase } from './supabase';
import { Party, Participant, VoteInsert, Match as BaseMatch, SeatingPlan } from './supabase';
import { ulid } from 'ulid';

// Define current_type for use across the application
export type current_type = 'interim' | 'final' | 'final-result' | 'closed';

// Extended Match type to include joined participants data
interface Match extends BaseMatch {
  participants1: {
    id: string;
    name: string;
    gender: string;
  };
  participants2: {
    id: string;
    name: string;
    gender: string;
  };
}

// Participant queries
export async function getParticipantByToken(token: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('id, name, gender, party_id')
    .eq('access_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    console.error('Error fetching participant by token:', error);
    throw error;
  }

  return data as Participant | null;
}

export async function getParticipantsByParty(
  partyId: string,
  gender?: 'male' | 'female'
): Promise<Participant[]> {
  let query = supabase
    .from('participants')
    .select('id, name, gender, participant_number')
    .eq('party_id', partyId)
    .order('participant_number', { ascending: true });

  // Add gender filter if provided
  if (gender) {
    query = query.eq('gender', gender);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching participants by party:', error);
    throw error;
  }

  return (data || []) as Participant[];
}

export async function getAllParticipantsByParty(partyId: string): Promise<Participant[]> {
  return getParticipantsByParty(partyId);
}

// Party queries
export async function getPartyById(partyId: string): Promise<Party | null> {
  const { data, error } = await supabase
    .from('parties')
    .select('id, name, status, current_mode')
    .eq('id', partyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    console.error('Error fetching party:', error);
    throw error;
  }

  return data as Party | null;
}

// Vote queries
export async function checkExistingVotes(
  participantId: string,
  partyId: string,
  voteType: current_type
): Promise<boolean> {
  const { data, error } = await supabase
    .from('votes')
    .select('id')
    .eq('voter_id', participantId)
    .eq('party_id', partyId)
    .eq('vote_type', voteType);

  if (error) {
    console.error('Error checking existing votes:', error);
    throw error;
  }

  return (data && data.length > 0) || false;
}

export async function hasUserVoted(token: string): Promise<boolean> {
  try {
    // Get participant info from token
    const participant = await getParticipantByToken(token);
    if (!participant) {
      return false;
    }

    // Get party info
    const party = await getPartyById(participant.party_id);
    if (!party || party.status !== 'active' || party.current_mode === 'closed') {
      return false;
    }

    // Check if participant has already voted in this round
    return await checkExistingVotes(participant.id, party.id, party.current_mode);
  } catch (error) {
    console.error('Error checking if user has voted:', error);
    return false;
  }
}

export async function submitVotes(
  token: string,
  votes: { voted_id: string; rank: number }[]
): Promise<void> {
  // Get participant info from token
  const participant = await getParticipantByToken(token);
  if (!participant) {
    throw new Error('参加者が見つかりませんでした');
  }

  // Get party info
  const party = await getPartyById(participant.party_id);
  if (!party) {
    throw new Error('パーティが見つかりませんでした');
  }

  // Check if party is active
  if (party.status !== 'active') {
    throw new Error('パーティはまだ開始されていないか、既に終了しています');
  }

  // Check if voting is open
  if (party.current_mode === 'closed') {
    throw new Error('現在投票は受け付けていません');
  }

  // Check if participant has already voted
  const hasVoted = await checkExistingVotes(participant.id, party.id, party.current_mode);
  if (hasVoted) {
    throw new Error('すでに投票済みです');
  }

  // Prepare vote data
  const now = new Date().toISOString();
  const voteData: VoteInsert[] = votes.map(vote => ({
    id: ulid(),
    party_id: party.id,
    voter_id: participant.id,
    voted_id: vote.voted_id,
    vote_type: party.current_mode,
    rank: vote.rank,
    created_at: now,
  }));

  // Insert votes
  const { error } = await supabase.from('votes').insert(voteData);

  if (error) {
    console.error('Error submitting votes:', error);
    throw error;
  }
}

// Match queries
export async function getMatchesByParticipant(
  participantId: string,
  partyId: string,
  matchType?: current_type
): Promise<Match[]> {
  let query = supabase
    .from('matches')
    .select(
      `
      id, 
      match_type, 
      table_number, 
      seat_positions,
      participant1_id, 
      participant2_id,
      participants1:participants!matches_participant1_id_fkey(id, name, gender),
      participants2:participants!matches_participant2_id_fkey(id, name, gender)
    `
    )
    .eq('party_id', partyId)
    .or(`participant1_id.eq.${participantId},participant2_id.eq.${participantId}`);

  if (matchType) {
    query = query.eq('match_type', matchType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching matches by participant:', error);
    throw error;
  }

  return (data || []) as Match[];
}

// Seating plan queries
export async function getSeatingPlan(
  partyId: string,
  planType: current_type
): Promise<SeatingPlan | null> {
  const { data, error } = await supabase
    .from('seating_plans')
    .select('id, layout_data, image_url')
    .eq('party_id', partyId)
    .eq('plan_type', planType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    console.error('Error fetching seating plan:', error);
    throw error;
  }

  return data as SeatingPlan | null;
}
