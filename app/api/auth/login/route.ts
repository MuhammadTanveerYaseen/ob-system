import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started');
    await dbConnect();
    console.log('Database connected successfully');
    
    const body = await request.json();
    console.log('Request body received:', { username: body.username, hasPassword: !!body.password });
    
    const { username, password } = body;
    
    if (!username || !password) {
      console.log('Missing credentials');
      return NextResponse.json({ 
        error: 'Username and password are required' 
      }, { status: 400 });
    }
    
    // Find user by username or email
    console.log('Searching for user with username/email:', username);
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    }).exec();
    
    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    console.log('User found:', { id: user._id, username: user.username, email: user.email, isActive: user.isActive });
    
    if (!user.isActive) {
      console.log('User account is deactivated');
      return NextResponse.json({ 
        error: 'Account is deactivated' 
      }, { status: 401 });
    }
    
    // Check password
    console.log('Checking password...');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('Invalid password for user:', username);
      return NextResponse.json({ 
        error: 'Invalid credentials' 
      }, { status: 401 });
    }
    
    console.log('Password validated successfully');
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken({
      userId: (user._id as unknown as { toString(): string }).toString(),
      username: user.username,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        rollNumber: user.rollNumber,
        department: user.department
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ 
      error: 'Failed to login' 
    }, { status: 500 });
  }
}
