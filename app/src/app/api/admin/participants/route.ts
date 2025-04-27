import { NextRequest, NextResponse } from 'next/server';
import { getParticipants, createParticipant } from '@/lib/db/queries';
import { participantSchema } from '@/lib/utils/validation';
import { generateAccessToken } from '@/lib/utils/token';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId');
    
    if (!partyId) {
      return NextResponse.json(
        { error: 'Party ID is required' },
        { status: 400 }
      );
    }
    
    const participants = await getParticipants(partyId);
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const result = participantSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Generate access token if not provided
    if (!body.access_token) {
      body.access_token = generateAccessToken(body.party_id, body.name);
    }
    
    const newParticipant = await createParticipant(body);
    
    return NextResponse.json(newParticipant, { status: 201 });
  } catch (error) {
    console.error('Error creating participant:', error);
    return NextResponse.json(
      { error: 'Failed to create participant' },
      { status: 500 }
    );
  }
}
