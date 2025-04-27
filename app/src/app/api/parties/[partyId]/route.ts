import { NextRequest, NextResponse } from 'next/server';
import { getParty, updateParty, deleteParty } from '@/lib/db/queries';
import { partySchema } from '@/lib/utils/validation';

interface RouteParams {
  params: {
    partyId: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { partyId } = params;
    const party = await getParty(partyId);
    
    if (!party) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(party);
  } catch (error) {
    console.error('Error fetching party:', error);
    return NextResponse.json(
      { error: 'Failed to fetch party' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { partyId } = params;
    const body = await request.json();
    
    // Check if party exists
    const existingParty = await getParty(partyId);
    
    if (!existingParty) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }
    
    // Validate request body
    const result = partySchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }
    
    const updatedParty = await updateParty(partyId, result.data);
    
    return NextResponse.json(updatedParty);
  } catch (error) {
    console.error('Error updating party:', error);
    return NextResponse.json(
      { error: 'Failed to update party' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { partyId } = params;
    
    // Check if party exists
    const existingParty = await getParty(partyId);
    
    if (!existingParty) {
      return NextResponse.json(
        { error: 'Party not found' },
        { status: 404 }
      );
    }
    
    await deleteParty(partyId);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting party:', error);
    return NextResponse.json(
      { error: 'Failed to delete party' },
      { status: 500 }
    );
  }
}
