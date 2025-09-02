import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Sheet from '@/models/Sheet';

export async function POST() {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'This endpoint is not available in production' }, { status: 403 });
    }
    
    await dbConnect();
    
    // Clear all collections
    await User.deleteMany({});
    await Sheet.deleteMany({});
    
    console.log('Database cleared successfully');
    
    return NextResponse.json({
      message: 'Database cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Clear database error:', error);
    return NextResponse.json({ 
      error: 'Failed to clear database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}





