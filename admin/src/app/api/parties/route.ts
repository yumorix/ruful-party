import { NextRequest, NextResponse } from 'next/server';
import { getParties, createParty } from '../../../lib/db/queries';
import { partySchema } from '../../../lib/utils/validation';

export async function GET() {
  try {
    const parties = await getParties();
    return NextResponse.json(parties);
  } catch (error) {
    console.error('Error fetching parties:', error);
    return NextResponse.json({ error: 'Failed to fetch parties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const result = partySchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.format() },
        { status: 400 }
      );
    }

    const newParty = await createParty(result.data);

    return NextResponse.json(newParty, { status: 201 });
  } catch (error) {
    console.error('Error creating party:', error);
    return NextResponse.json({ error: 'Failed to create party' }, { status: 500 });
  }
}
