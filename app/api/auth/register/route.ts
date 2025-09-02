import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { username, email, password, firstName, lastName, role, rollNumber, department } = body;
    
    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 });
    }
    
    // Debug logging
    console.log('Registration attempt:', { username, email, role });
    
    // Check if user already exists using the static method
    const existingUser = await User.findByUsernameOrEmail(username, email);
    
    console.log('Existing user check result:', existingUser ? 'User found' : 'No existing user');
    
    if (existingUser) {
      console.log('Duplicate user details:', {
        existingUsername: existingUser.username,
        existingEmail: existingUser.email,
        newUsername: username,
        newEmail: email,
        existingUserId: existingUser._id
      });
      
      // Check which field is duplicate
      let duplicateField = '';
      if (existingUser.username === username) {
        duplicateField = 'username';
      } else if (existingUser.email === email) {
        duplicateField = 'email';
      }
      
      return NextResponse.json({ 
        error: `${duplicateField.charAt(0).toUpperCase() + duplicateField.slice(1)} already exists`,
        duplicateField: duplicateField
      }, { status: 409 });
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
    
    console.log('Attempting to save user:', { username, email, role });
    
    try {
      await user.save();
      console.log('User saved successfully with ID:', user._id);
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      if (saveError instanceof Error && saveError.message.includes('duplicate key')) {
        return NextResponse.json({ 
          error: 'Username or email already exists (duplicate key error)' 
        }, { status: 409 });
      }
      throw saveError;
    }
    
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
      message: 'User registered successfully',
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
    }, { status: 201 });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ 
      error: 'Failed to register user' 
    }, { status: 500 });
  }
}
