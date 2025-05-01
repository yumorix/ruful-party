import { Participant, Vote, PartySetting } from '../db/supabase';

interface SeatingPlanResult {
  layoutData: {
    tables: Table[];
    unassignedParticipants: string[];
  };
  stats: {
    totalParticipants: number;
    assignedParticipants: number;
    unassignedParticipants: number;
    tables: number;
    seatsPerTable: number;
  };
}

interface Table {
  id: number;
  seats: Seat[];
}

interface Seat {
  position: number;
  participantId: string | null;
  gender: 'male' | 'female' | null;
}

/**
 * Generate a seating plan for a party
 * @param participants List of participants
 * @param votes List of votes
 * @param settings Party settings
 * @returns Seating plan result
 */
export async function generateSeatingPlan(
  participants: Participant[],
  votes: Vote[],
  settings: PartySetting
): Promise<SeatingPlanResult> {
  const { tableCount, seatsPerTable } = settings.seating_layout;
  const { requireMixedGender, alternateSeating } = settings.gender_rules;
  
  // Filter participants by gender
  const maleParticipants = participants.filter(p => p.gender === 'male');
  const femaleParticipants = participants.filter(p => p.gender === 'female');
  
  // Create a map of participant IDs to their votes
  const voteMap = new Map<string, string[]>();
  
  for (const vote of votes) {
    if (!voteMap.has(vote.voter_id)) {
      voteMap.set(vote.voter_id, []);
    }
    
    voteMap.get(vote.voter_id)?.push(vote.voted_id);
  }
  
  // Create tables
  const tables: Table[] = [];
  
  for (let i = 0; i < tableCount; i++) {
    const seats: Seat[] = [];
    
    for (let j = 0; j < seatsPerTable; j++) {
      seats.push({
        position: j,
        participantId: null,
        gender: null
      });
    }
    
    tables.push({
      id: i + 1,
      seats
    });
  }
  
  // Assign participants to seats
  const assignedParticipants = new Set<string>();
  
  // First, try to seat participants next to people they voted for
  for (const [voterId, votedIds] of voteMap.entries()) {
    if (assignedParticipants.has(voterId)) continue;
    
    const voter = participants.find(p => p.id === voterId);
    if (!voter) continue;
    
    for (const votedId of votedIds) {
      if (assignedParticipants.has(votedId)) continue;
      
      const voted = participants.find(p => p.id === votedId);
      if (!voted) continue;
      
      // Skip if same gender and mixed gender is required
      if (requireMixedGender && voter.gender === voted.gender) continue;
      
      // Try to find a table with two adjacent empty seats
      let seated = false;
      
      for (const table of tables) {
        for (let i = 0; i < table.seats.length - 1; i++) {
          const seat1 = table.seats[i];
          const seat2 = table.seats[i + 1];
          
          if (seat1.participantId === null && seat2.participantId === null) {
            // Assign voter and voted to adjacent seats
            seat1.participantId = voterId;
            seat1.gender = voter.gender;
            
            seat2.participantId = votedId;
            seat2.gender = voted.gender;
            
            assignedParticipants.add(voterId);
            assignedParticipants.add(votedId);
            
            seated = true;
            break;
          }
        }
        
        if (seated) break;
      }
    }
  }
  
  // Assign remaining participants
  const remainingMales = maleParticipants.filter(p => !assignedParticipants.has(p.id));
  const remainingFemales = femaleParticipants.filter(p => !assignedParticipants.has(p.id));
  
  if (alternateSeating) {
    // Alternate male and female participants
    for (const table of tables) {
      for (let i = 0; i < table.seats.length; i++) {
        const seat = table.seats[i];
        
        if (seat.participantId !== null) continue;
        
        // Determine gender based on position
        const gender = i % 2 === 0 ? 'male' : 'female';
        const participants = gender === 'male' ? remainingMales : remainingFemales;
        
        if (participants.length > 0) {
          const participant = participants.shift()!;
          seat.participantId = participant.id;
          seat.gender = participant.gender;
          assignedParticipants.add(participant.id);
        }
      }
    }
  } else {
    // Fill remaining seats without alternating
    const remainingParticipants = [...remainingMales, ...remainingFemales];
    
    for (const table of tables) {
      for (const seat of table.seats) {
        if (seat.participantId !== null) continue;
        
        if (remainingParticipants.length > 0) {
          const participant = remainingParticipants.shift()!;
          seat.participantId = participant.id;
          seat.gender = participant.gender;
          assignedParticipants.add(participant.id);
        }
      }
    }
  }
  
  // Find unassigned participants
  const unassignedParticipants = participants
    .filter(p => !assignedParticipants.has(p.id))
    .map(p => p.id);
  
  return {
    layoutData: {
      tables,
      unassignedParticipants
    },
    stats: {
      totalParticipants: participants.length,
      assignedParticipants: assignedParticipants.size,
      unassignedParticipants: unassignedParticipants.length,
      tables: tableCount,
      seatsPerTable
    }
  };
}
