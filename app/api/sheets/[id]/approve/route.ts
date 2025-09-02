import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sheet from '@/models/Sheet';
import User from '@/models/User';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest, ctx: { params?: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const user = (request as unknown as import('@/lib/auth').AuthenticatedRequest).user!;
    const body = await request.json();
    const { id } = ctx.params ? await ctx.params : { id: '' };
    if (!id) {
      return NextResponse.json({ error: 'Invalid sheet id' }, { status: 400 });
    }
    
    // Only HODs can approve/reject sheets
    if (user.role !== 'hod') {
      return NextResponse.json({ error: 'Only HODs can approve assessment sheets' }, { status: 403 });
    }
    
    const sheet = await Sheet.findById(id);
    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }
    
    if (sheet.status !== 'pending_approval') {
      return NextResponse.json({ error: 'Sheet is not pending approval' }, { status: 400 });
    }

    // Ensure the sheet was created by a faculty member only
    const teacher = await User.findById(sheet.teacherId).select('role');
    if (!teacher || teacher.role !== 'faculty') {
      return NextResponse.json({ error: 'Only sheets created by faculty can be approved by HOD' }, { status: 400 });
    }
    
    const { action, rejectionReason } = body;
    
    if (action === 'approve') {
      sheet.status = 'approved';
      sheet.approvedAt = new Date();
      sheet.approvedBy = user.userId;
      sheet.approvedByName = `${user.firstName} ${user.lastName}`;
    } else if (action === 'reject') {
      sheet.status = 'rejected';
      sheet.rejectionReason = rejectionReason || 'Rejected by HOD';
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    await sheet.save();
    return NextResponse.json(sheet);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
  }
});
