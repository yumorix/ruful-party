import { supabase } from './supabase';
import {
  Party,
  PartyInsert,
  PartyUpdate,
  Participant,
  ParticipantInsert,
  ParticipantUpdate,
  Vote,
  VoteInsert,
  PartySetting,
  PartySettingInsert,
  Match,
  MatchInsert,
  SeatingPlan,
  SeatingPlanInsert,
} from './supabase';
import { ulid } from 'ulid';
import { PartyFormData, ParticipantFormData, VoteFormData } from '@/lib/utils/validation';

// Party queries
export async function getParties(): Promise<Party[]> {
  const { data, error } = await supabase
    .from('parties')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching parties:', error);
    throw error;
  }

  return (data || []) as Party[];
}

export async function getParty(id: string): Promise<Party | null> {
  const { data, error } = await supabase.from('parties').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      // PGRST116 means no rows returned
      return null;
    }

    console.error('Error fetching party:', error);
    throw error;
  }

  return data as Party | null;
}

export async function createParty(party: PartyFormData): Promise<Party> {
  const id = ulid();
  const now = new Date().toISOString();

  const partyData: PartyInsert = {
    id,
    ...party,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase.from('parties').insert(partyData).select().single();

  if (error) {
    console.error('Error creating party:', error);
    throw error;
  }

  return data as Party;
}

export async function updateParty(id: string, party: Partial<PartyFormData>): Promise<Party> {
  const now = new Date().toISOString();

  const partyData: PartyUpdate = {
    ...party,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('parties')
    .update(partyData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating party:', error);
    throw error;
  }

  return data as Party;
}

export async function deleteParty(id: string): Promise<void> {
  const { error } = await supabase.from('parties').delete().eq('id', id);

  if (error) {
    console.error('Error deleting party:', error);
    throw error;
  }
}

// Participant queries
export async function getParticipants(partyId: string): Promise<Participant[]> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
    .eq('party_id', partyId)
    .order('participant_number', { ascending: true });

  if (error) {
    console.error('Error fetching participants:', error);
    throw error;
  }

  return (data || []) as Participant[];
}

export async function getParticipant(id: string): Promise<Participant | null> {
  const { data, error } = await supabase.from('participants').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    console.error('Error fetching participant:', error);
    throw error;
  }

  return data as Participant | null;
}

export async function getParticipantByToken(token: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('participants')
    .select('*')
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

export async function createParticipant(
  participant: ParticipantFormData & { access_token?: string }
): Promise<Participant> {
  const id = ulid();
  const now = new Date().toISOString();

  // Ensure access_token is not undefined
  const participantData: ParticipantInsert = {
    id,
    ...participant,
    access_token: participant.access_token || '',
    created_at: now,
  };

  const { data, error } = await supabase
    .from('participants')
    .insert(participantData)
    .select()
    .single();

  if (error) {
    console.error('Error creating participant:', error);
    throw error;
  }

  return data as Participant;
}

export async function updateParticipant(
  id: string,
  participant: Partial<ParticipantFormData>
): Promise<Participant> {
  const participantData: ParticipantUpdate = {
    ...participant,
  };

  const { data, error } = await supabase
    .from('participants')
    .update(participantData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating participant:', error);
    throw error;
  }

  return data as Participant;
}

export async function deleteParticipant(id: string): Promise<void> {
  const { error } = await supabase.from('participants').delete().eq('id', id);

  if (error) {
    console.error('Error deleting participant:', error);
    throw error;
  }
}

// Vote queries
export async function getVotes(partyId: string, voteType: 'interim' | 'final'): Promise<Vote[]> {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('party_id', partyId)
    .eq('vote_type', voteType)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching votes:', error);
    throw error;
  }

  return (data || []) as Vote[];
}

export async function createVote(vote: VoteFormData): Promise<Vote> {
  const id = ulid();
  const now = new Date().toISOString();

  const voteData: VoteInsert = {
    id,
    ...vote,
    created_at: now,
  };

  const { data, error } = await supabase.from('votes').insert(voteData).select().single();

  if (error) {
    console.error('Error creating vote:', error);
    throw error;
  }

  return data as Vote;
}

// Party settings queries
export async function getPartySetting(partyId: string): Promise<PartySetting | null> {
  const { data, error } = await supabase
    .from('party_settings')
    .select('*')
    .eq('party_id', partyId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }

    console.error('Error fetching party setting:', error);
    throw error;
  }

  return data as PartySetting | null;
}

export async function createOrUpdatePartySetting(
  setting: Omit<PartySetting, 'id' | 'updated_at'>
): Promise<PartySetting> {
  const now = new Date().toISOString();

  // Check if setting exists
  const existingSetting = await getPartySetting(setting.party_id);

  if (existingSetting) {
    // Update
    const updateData = {
      ...setting,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('party_settings')
      .update(updateData)
      .eq('id', existingSetting.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating party setting:', error);
      throw error;
    }

    return data as PartySetting;
  } else {
    // Create
    const id = ulid();

    const insertData: PartySettingInsert = {
      id,
      ...setting,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('party_settings')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating party setting:', error);
      throw error;
    }

    return data as PartySetting;
  }
}

// Match queries
export async function getMatches(
  partyId: string,
  matchType: 'interim' | 'final'
): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('party_id', partyId)
    .eq('match_type', matchType)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }

  return (data || []) as Match[];
}

export async function createMatches(matches: Omit<Match, 'id' | 'created_at'>[]): Promise<Match[]> {
  if (matches.length === 0) {
    return [];
  }

  const now = new Date().toISOString();

  // Delete existing matches for this party and match type
  const { error: deleteError } = await supabase
    .from('matches')
    .delete()
    .eq('party_id', matches[0].party_id)
    .eq('match_type', matches[0].match_type);

  if (deleteError) {
    console.error('Error deleting existing matches:', deleteError);
    throw deleteError;
  }

  // Create new matches
  const matchesWithIds: MatchInsert[] = matches.map(match => ({
    id: ulid(),
    ...match,
    created_at: now,
  }));

  const { data, error } = await supabase.from('matches').insert(matchesWithIds).select();

  if (error) {
    console.error('Error creating matches:', error);
    throw error;
  }

  return (data || []) as Match[];
}

// Seating plan queries
export async function getSeatingPlan(
  partyId: string,
  planType: 'interim' | 'final'
): Promise<SeatingPlan | null> {
  const { data, error } = await supabase
    .from('seating_plans')
    .select('*')
    .eq('party_id', partyId)
    .eq('plan_type', planType)
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

export async function createOrUpdateSeatingPlan(
  plan: Omit<SeatingPlan, 'id' | 'created_at'>
): Promise<SeatingPlan> {
  const now = new Date().toISOString();

  // Check if plan exists
  const existingPlan = await getSeatingPlan(plan.party_id, plan.plan_type);

  if (existingPlan) {
    // Update
    const updateData = {
      ...plan,
      created_at: now,
    };

    const { data, error } = await supabase
      .from('seating_plans')
      .update(updateData)
      .eq('id', existingPlan.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating seating plan:', error);
      throw error;
    }

    return data as SeatingPlan;
  } else {
    // Create
    const id = ulid();

    const insertData: SeatingPlanInsert = {
      id,
      ...plan,
      created_at: now,
    };

    const { data, error } = await supabase
      .from('seating_plans')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating seating plan:', error);
      throw error;
    }

    return data as SeatingPlan;
  }
}
