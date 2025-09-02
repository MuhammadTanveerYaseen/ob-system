import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sheet from '@/models/Sheet';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest, ctx: { params?: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const user = (request as unknown as import('@/lib/auth').AuthenticatedRequest).user!;
    const { id } = ctx.params ? await ctx.params : { id: '' };
    if (!id) {
      return NextResponse.json({ error: 'Invalid sheet id' }, { status: 400 });
    }
    
    // Only faculty can submit sheets for approval
    if (user.role !== 'faculty') {
      return NextResponse.json({ error: 'Only faculty can submit assessment sheets' }, { status: 403 });
    }
    
    const sheet = await Sheet.findById(id);
    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }
    
    // Check if the sheet belongs to the faculty
    if (sheet.teacherId.toString() !== user.userId) {
      return NextResponse.json({ error: 'You can only submit your own sheets' }, { status: 403 });
    }
    
    if (sheet.status !== 'draft') {
      return NextResponse.json({ error: 'Only draft sheets can be submitted for approval' }, { status: 400 });
    }
    
    // Update sheet status to pending approval
    sheet.status = 'pending_approval';
    sheet.submittedAt = new Date();
    
    await sheet.save();
    return NextResponse.json(sheet);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit sheet for approval' }, { status: 500 });
  }
});
