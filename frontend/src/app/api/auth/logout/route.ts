import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Create a response object
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });

    // Clear the authentication cookie on the response
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
      maxAge: -1, // Expire the cookie immediately
      path: '/', // Ensure the path matches the one used during login
      sameSite: 'lax', // Or 'strict' depending on your requirements
    });

    return response; // Return the response with the cookie cleared
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}