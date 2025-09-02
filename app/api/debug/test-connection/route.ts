import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    const connection = await dbConnect();
    
    // Get connection info
    const conn = connection.connection;
    const dbName = conn?.db?.databaseName ?? 'unknown';
    const host = conn?.host ?? 'unknown';
    const port = conn?.port ?? 0;
    const readyState = conn?.readyState ?? 0;
    
    // Test a simple query
    const collections = conn?.db ? await conn.db.listCollections().toArray() : [];
    
    return NextResponse.json({
      message: 'Database connection test successful',
      connection: {
        database: dbName,
        host: host,
        port: port,
        readyState: readyState,
        status: readyState === 1 ? 'Connected' : 'Not connected'
      },
      collections: collections.map(col => col.name),
      environment: {
        mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV || 'Not set'
      }
    });
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json({ 
      error: 'Database connection test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV || 'Not set'
      }
    }, { status: 500 });
  }
}





