import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { requireRole } from '@/lib/auth';

// GET all users (Admin only)
export const GET = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    await dbConnect();
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

// POST create new user (Admin only)
export const POST = requireRole(['admin'])(async (request: NextRequest) => {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { username, email, password, firstName, lastName, role, rollNumber, department } = body;
    
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 409 });
    }
    
    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      rollNumber: role === 'student' ? rollNumber : undefined,
      department
    });
    
    await user.save();
    
    const userResponse = user.toJSON();
    return NextResponse.json(userResponse, { status: 201 });
    
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});





