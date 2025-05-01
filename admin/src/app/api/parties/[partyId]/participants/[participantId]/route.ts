import { NextRequest, NextResponse } from 'next/server';
import { getParticipant, deleteParticipant } from '../../../../../../lib/db/queries';

interface RouteParams {
  params: Promise<{
    partyId: string;
    participantId: string;
  }>;
}

export async function DELETE(request: NextRequest, props: RouteParams) {
  const params = await props.params;
  try {
    const { participantId } = params;

    // Check if participant exists
    const existingParticipant = await getParticipant(participantId);

    if (!existingParticipant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    await deleteParticipant(participantId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting participant:', error);
    return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 });
  }
}
