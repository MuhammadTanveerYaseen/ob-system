import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (existingUser) {
      return NextResponse.json({
        message: 'Test user already exists',
        user: {
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role
        }
      });
    }
    
    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      isActive: true
    });
    
    await testUser.save();
    
    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        username: testUser.username,
        email: testUser.email,
        role: testUser.role,
        password: 'password123' // Only for testing purposes
      },
      instructions: {
        login: 'Use username "testuser" and password "password123" to login'
      }
    });
  } catch (error) {
    console.error('Create test user error:', error);
    return NextResponse.json({ 
      error: 'Failed to create test user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
