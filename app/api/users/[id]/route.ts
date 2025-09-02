import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

// PATCH update user (Admin only)
export const PATCH = requireRole(['admin'])(async (
  request: NextRequest,
  ctx: { params?: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = ctx.params ? await ctx.params : { id: '' };
    if (!id) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});

// DELETE user (Admin only)
export const DELETE = requireRole(['admin'])(async (
  request: NextRequest,
  ctx: { params?: Promise<{ id: string }> }
) => {
  try {
    await dbConnect();
    const { id } = ctx.params ? await ctx.params : { id: '' };
    if (!id) {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
});





