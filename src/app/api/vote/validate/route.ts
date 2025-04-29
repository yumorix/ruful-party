import { NextRequest, NextResponse } from 'next/server';
import { getParticipantByToken, getParty, getVotes } from '@/lib/db/queries';
import { isValidTokenFormat } from '@/lib/utils/token';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    // Validate token format
    if (!isValidTokenFormat(token)) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      );
    }
    
    // Get participant by token
    const participant = await getParticipantByToken(token);
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Invalid token' },
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
        {
          valid: false,
          error: 'Party is not active',
          party: {
            id: party.id,
            name: party.name,
            status: party.status
          },
          participant: {
            id: participant.id,
            name: participant.name,
            gender: participant.gender,
            participant_number: participant.participant_number
          }
        },
        { status: 200 }
      );
    }
    
    // Check if voting is open
    if (party.current_mode === 'closed') {
      return NextResponse.json(
        {
          valid: false,
          error: 'Voting is closed',
          party: {
            id: party.id,
            name: party.name,
            status: party.status,
            current_mode: party.current_mode
          },
          participant: {
            id: participant.id,
            name: participant.name,
            gender: participant.gender,
            participant_number: participant.participant_number
          }
        },
        { status: 200 }
      );
    }
    
    // Check if participant has already voted
    const existingVotes = await getVotes(party.id, party.current_mode);
    const hasVoted = existingVotes.some(vote => vote.voter_id === participant.id);
    
    if (hasVoted) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Already voted',
          party: {
            id: party.id,
            name: party.name,
            status: party.status,
            current_mode: party.current_mode
          },
          participant: {
            id: participant.id,
            name: participant.name,
            gender: participant.gender,
            participant_number: participant.participant_number
          },
          votes: existingVotes.filter(vote => vote.voter_id === participant.id)
        },
        { status: 200 }
      );
    }
    
    // Get eligible participants to vote for (opposite gender)
    // const eligibleParticipants = await getParticipantByToken(token);
    
    return NextResponse.json({
      valid: true,
      party: {
        id: party.id,
        name: party.name,
        status: party.status,
        current_mode: party.current_mode
      },
      participant: {
        id: participant.id,
        name: participant.name,
        gender: participant.gender,
        participant_number: participant.participant_number
      }
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
