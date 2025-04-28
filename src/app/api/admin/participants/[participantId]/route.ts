import { NextRequest, NextResponse } from 'next/server';
import { getParticipant, updateParticipant, deleteParticipant } from '@/lib/db/queries';
import { participantSchema } from '@/lib/utils/validation';

interface RouteParams {
  params: Promise<{
    participantId: string;
  }>;
}

export async function GET(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { participantId } = params;
    const participant = await getParticipant(participantId);
    
    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(participant);
  } catch (error) {
    console.error('Error fetching participant:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participant' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { participantId } = params;
    const body = await request.json();
    
    // Check if participant exists
    const existingParticipant = await getParticipant(participantId);
    
    if (!existingParticipant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }
    
    // Validate request body
    const result = participantSchema.safeParse({
      ...body,
      party_id: existingParticipant.party_id // Ensure party_id is included for validation
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const updatedParticipant = await updateParticipant(participantId, body);
    
    return NextResponse.json(updatedParticipant);
  } catch (error) {
    console.error('Error updating participant:', error);
    return NextResponse.json(
      { error: 'Failed to update participant' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { participantId } = params;
    
    // Check if participant exists
    const existingParticipant = await getParticipant(participantId);
    
    if (!existingParticipant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }
    
    await deleteParticipant(participantId);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json(
      { error: 'Failed to delete participant' },
      { status: 500 }
    );
  }
}
