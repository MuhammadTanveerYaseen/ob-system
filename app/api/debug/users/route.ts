import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all users (for debugging purposes)
    const users = await User.find({}).select('username email role createdAt');
    
    return NextResponse.json({
      message: 'Debug: Current users in database',
      count: users.length,
      users: users
    });
  } catch (error) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}





