import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Sheet from '@/models/Sheet';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest, ctx: { params?: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const user = (request as unknown as import('@/lib/auth').AuthenticatedRequest).user!;
    const { id } = ctx.params ? await ctx.params : { id: '' };
    if (!id) {
      return NextResponse.json({ error: 'Invalid sheet id' }, { status: 400 });
    }
    const sheet = await Sheet.findById(id);
    
    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }
    
    // If user is faculty, only allow access to their own sheets
    if (user.role === 'faculty' && sheet.teacherId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    return NextResponse.json(sheet);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sheet' }, { status: 500 });
  }
});

export const PUT = requireAuth(async (request: NextRequest, ctx: { params?: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const user = (request as unknown as import('@/lib/auth').AuthenticatedRequest).user!;
    const body = await request.json();
    
    // Allow faculty, admin, and HOD to update sheets
    if (!['faculty', 'admin', 'hod'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions to update sheets' }, { status: 403 });
    }
    
    const { id } = ctx.params ? await ctx.params : { id: '' };
    if (!id) {
      return NextResponse.json({ error: 'Invalid sheet id' }, { status: 400 });
    }
    const sheet = await Sheet.findById(id);
    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }
    
    // Faculty can only update their own sheets; admin and HOD can update any
    if (user.role === 'faculty' && sheet.teacherId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    const updatedSheet = await Sheet.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    return NextResponse.json(updatedSheet);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update sheet' }, { status: 500 });
  }
});

export const DELETE = requireAuth(async (request: NextRequest, ctx: { params?: Promise<{ id: string }> }) => {
  try {
    await dbConnect();
    const user = (request as unknown as import('@/lib/auth').AuthenticatedRequest).user!;
    const { id } = ctx.params ? await ctx.params : { id: '' };
    if (!id) {
      return NextResponse.json({ error: 'Invalid sheet id' }, { status: 400 });
    }
    
    // Only faculty can delete sheets
    if (user.role !== 'faculty') {
      return NextResponse.json({ error: 'Only faculty can delete assessment sheets' }, { status: 403 });
    }
    
    const sheet = await Sheet.findById(id);
    if (!sheet) {
      return NextResponse.json({ error: 'Sheet not found' }, { status: 404 });
    }
    
    // Faculty can only delete their own sheets
    if (sheet.teacherId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    await Sheet.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Sheet deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete sheet' }, { status: 500 });
  }
});

