import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Sheet from '@/models/Sheet';

export async function GET() {
  try {
    await dbConnect();
    
    // Check and create indexes for User collection
    const userIndexes = await User.collection.indexes();
    console.log('Current User indexes:', userIndexes);
    
    // Create proper indexes if they don't exist
    try {
      await User.collection.createIndex({ username: 1 }, { unique: true });
      await User.collection.createIndex({ email: 1 }, { unique: true });
      console.log('User indexes created successfully');
    } catch (indexError) {
      console.log('Index creation result:', indexError);
    }
    
    // Check and create indexes for Sheet collection
    const sheetIndexes = await Sheet.collection.indexes();
    console.log('Current Sheet indexes:', sheetIndexes);
    
    try {
      await Sheet.collection.createIndex({ teacherId: 1 });
      console.log('Sheet indexes created successfully');
    } catch (indexError) {
      console.log('Sheet index creation result:', indexError);
    }
    
    // Return basic info without deprecated stats()
    const userCount = await User.countDocuments();
    const sheetCount = await Sheet.countDocuments();

    return NextResponse.json({
      message: 'Database setup completed',
      userIndexes: userIndexes,
      sheetIndexes: sheetIndexes,
      userStats: {
        count: userCount
      },
      sheetStats: {
        count: sheetCount
      }
    });
  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      error: 'Failed to setup database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}





