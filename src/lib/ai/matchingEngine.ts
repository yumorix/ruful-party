import { Participant, Vote } from '@/lib/db/supabase';

interface MatchingResult {
  pairs: [string, string][]; // Array of [participant1_id, participant2_id] pairs
  unmatched: string[]; // Array of participant IDs that couldn't be matched
  stats: {
    totalParticipants: number;
    totalMatches: number;
    mutualMatches: number;
    maleParticipants: number;
    femaleParticipants: number;
  };
}

/**
 * Generate matches between participants based on votes
 * @param participants List of participants
 * @param votes List of votes
 * @param voteType Type of vote (interim or final)
 * @returns Matching result with pairs and stats
 */
export async function generateMatches(
  participants: Participant[],
  votes: Vote[],
  voteType: 'interim' | 'final'
): Promise<MatchingResult> {
  // Filter participants by gender
  const maleParticipants = participants.filter(p => p.gender === 'male');
  const femaleParticipants = participants.filter(p => p.gender === 'female');
  
  // Create a map of participant IDs to their votes
  const voteMap = new Map<string, string[]>();
  
  for (const vote of votes) {
    if (vote.vote_type !== voteType) continue;
    
    if (!voteMap.has(vote.voter_id)) {
      voteMap.set(vote.voter_id, []);
    }
    
    voteMap.get(vote.voter_id)?.push(vote.voted_id);
  }
  
  // Find mutual matches (where both participants voted for each other)
  const mutualMatches: [string, string][] = [];
  const matchedParticipants = new Set<string>();
  
  // First, try to match participants who mutually voted for each other
  for (const male of maleParticipants) {
    if (matchedParticipants.has(male.id)) continue;
    
    const maleVotes = voteMap.get(male.id) || [];
    
    for (const femaleId of maleVotes) {
      if (matchedParticipants.has(femaleId)) continue;
      
      const female = femaleParticipants.find(p => p.id === femaleId);
      if (!female) continue;
      
      const femaleVotes = voteMap.get(female.id) || [];
      
      if (femaleVotes.includes(male.id)) {
        // Mutual match found
        mutualMatches.push([male.id, female.id]);
        matchedParticipants.add(male.id);
        matchedParticipants.add(female.id);
        break;
      }
    }
  }
  
  // Match remaining participants based on votes
  const remainingMatches: [string, string][] = [];
  
  // Remaining males
  const remainingMales = maleParticipants.filter(p => !matchedParticipants.has(p.id));
  const remainingFemales = femaleParticipants.filter(p => !matchedParticipants.has(p.id));
  
  // Sort remaining participants by number of votes they received
  const femaleVoteCount = new Map<string, number>();
  const maleVoteCount = new Map<string, number>();
  
  for (const vote of votes) {
    if (vote.vote_type !== voteType) continue;
    
    const votedParticipant = participants.find(p => p.id === vote.voted_id);
    if (!votedParticipant) continue;
    
    if (votedParticipant.gender === 'female') {
      femaleVoteCount.set(
        votedParticipant.id, 
        (femaleVoteCount.get(votedParticipant.id) || 0) + 1
      );
    } else {
      maleVoteCount.set(
        votedParticipant.id, 
        (maleVoteCount.get(votedParticipant.id) || 0) + 1
      );
    }
  }
  
  // Sort by vote count (descending)
  remainingMales.sort((a, b) => 
    (maleVoteCount.get(b.id) || 0) - (maleVoteCount.get(a.id) || 0)
  );
  
  remainingFemales.sort((a, b) => 
    (femaleVoteCount.get(b.id) || 0) - (femaleVoteCount.get(a.id) || 0)
  );
  
  // Match remaining participants
  const matchedRemainingParticipants = new Set<string>();
  
  for (const male of remainingMales) {
    if (matchedRemainingParticipants.has(male.id)) continue;
    
    const maleVotes = voteMap.get(male.id) || [];
    let matched = false;
    
    // First try to match with females the male voted for
    for (const femaleId of maleVotes) {
      if (matchedRemainingParticipants.has(femaleId)) continue;
      
      const female = remainingFemales.find(p => p.id === femaleId);
      if (!female) continue;
      
      remainingMatches.push([male.id, female.id]);
      matchedRemainingParticipants.add(male.id);
      matchedRemainingParticipants.add(female.id);
      matched = true;
      break;
    }
    
    // If no match found, match with any available female
    if (!matched) {
      for (const female of remainingFemales) {
        if (matchedRemainingParticipants.has(female.id)) continue;
        
        remainingMatches.push([male.id, female.id]);
        matchedRemainingParticipants.add(male.id);
        matchedRemainingParticipants.add(female.id);
        matched = true;
        break;
      }
    }
  }
  
  // Combine all matches
  const allMatches = [...mutualMatches, ...remainingMatches];
  
  // Find unmatched participants
  const allMatchedParticipants = new Set<string>([
    ...matchedParticipants,
    ...matchedRemainingParticipants
  ]);
  
  const unmatched = participants
    .filter(p => !allMatchedParticipants.has(p.id))
    .map(p => p.id);
  
  return {
    pairs: allMatches,
    unmatched,
    stats: {
      totalParticipants: participants.length,
      totalMatches: allMatches.length,
      mutualMatches: mutualMatches.length,
      maleParticipants: maleParticipants.length,
      femaleParticipants: femaleParticipants.length
    }
  };
}
