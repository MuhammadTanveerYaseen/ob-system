import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sheet from '@/models/Sheet';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    await dbConnect();
    const user = (request as unknown as import('@/lib/auth').AuthenticatedRequest).user!;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = {};
    
    // Filter by user role
    if (user.role === 'faculty') {
      query = { teacherId: user.userId };
    } else if (user.role === 'hod') {
      // HODs can see all sheets in their department (for now, all sheets)
      // In a real system, you'd filter by department
      query = {};
    } else if (user.role === 'student') {
      // Students can only see approved sheets
      query = { status: 'approved' };
    }
    // Admin can see all sheets
    
    // Filter by status if provided
    if (status) {
      query = { ...query, status };
    }
    
    const sheets = await Sheet.find(query).sort({ createdAt: -1 });
    return NextResponse.json(sheets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sheets' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    await dbConnect();
    const body = await request.json();
    const user = (request as unknown as import('@/lib/auth').AuthenticatedRequest).user!;
    
    // Only faculty can create sheets
    if (user.role !== 'faculty') {
      return NextResponse.json({ error: 'Only faculty can create assessment sheets' }, { status: 403 });
    }
    
    const sheet = new Sheet({
      name: body.name,
      teacherId: user.userId,
      teacherName: `${user.firstName} ${user.lastName}`,
      questions: body.questions || [],
      clos: body.clos || [],
      plos: body.plos || [],
      students: body.students || [],
      totalPossibleMarks: typeof body.totalPossibleMarks === 'number' ? body.totalPossibleMarks : 0,
      status: 'draft' // New sheets start as drafts
    });
    
    await sheet.save();
    return NextResponse.json(sheet, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create sheet' }, { status: 500 });
  }
});

