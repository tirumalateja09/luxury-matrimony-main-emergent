import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { role } = await request.json();

    let email, password;
    if (role === 'super_admin') {
      email = process.env.SUPER_ADMIN_EMAIL;
      password = process.env.SUPER_ADMIN_PASSWORD;
    } else if (role === 'admin') {
      email = process.env.ADMIN_EMAIL;
      password = process.env.ADMIN_PASSWORD;
    } else {
      return NextResponse.json({ message: 'Invalid role selected' }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json(
        { message: `Role credentials not set. Please configure ${role.toUpperCase()}_EMAIL and ${role.toUpperCase()}_PASSWORD in .env.local` },
        { status: 500 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    const res = await fetch(`${apiUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: 'Login failed: ' + error.message },
      { status: 500 }
    );
  }
}
