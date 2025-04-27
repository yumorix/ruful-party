import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByToken, getParty, createVote, getVotes } from '@/lib/db/queries';
import { voteSchema } from '@/lib/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate access token
    if (!body.token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }
    
    // Get participant by token
    const participant = await getParticipantByToken(body.token);
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }
    
    // Get party
    const party = await getParty(participant.party_id);
    
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }
    
    // Check if party is active
    if (party.status !== 'active') {
      return NextResponse.json(
        { error: 'Party is not active' },
        { status: 403 }
      );
    }
    
    // Check if voting is open
    if (party.current_mode === 'closed') {
      return NextResponse.json(
        { error: 'Voting is closed' },
        { status: 403 }
      );
    }
    
    // Check if participant has already voted
    const existingVotes = await getVotes(party.id, party.current_mode);
    const hasVoted = existingVotes.some(vote => vote.voter_id === participant.id);
    
    if (hasVoted) {
      return NextResponse.json(
        { error: 'You have already voted' },
        { status: 403 }
      );
    }
    
    // Validate vote data
    if (!Array.isArray(body.voted_ids) || body.voted_ids.length === 0 || body.voted_ids.length > 3) {
      return NextResponse.json(
        { error: 'You must vote for 1-3 participants' },
        { status: 400 }
      );
    }
    
    // Create votes
    const votes = [];
    
    for (let i = 0; i < body.voted_ids.length; i++) {
      const votedId = body.voted_ids[i];
      
      // Create vote
      const vote = await createVote({
        party_id: party.id,
        voter_id: participant.id,
        voted_id: votedId,
        vote_type: party.current_mode,
        rank: i + 1
      });
      
      votes.push(vote);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vote submitted successfully',
      votes
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}
