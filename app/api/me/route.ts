import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authoptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details with role-specific information
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
      include: {
        student: true,
        teacher: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data without sensitive information
    return NextResponse.json({
      id: user.id,
      email: user.email,
      username: user.username,
      department: user.department,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: session.user.role,
      student: user.student ? {
        id: user.student.id,
        year: user.student.year,
        rollNumber: user.student.rollNumber,
        skills: user.student.skills,
      } : null,
      teacher: user.teacher ? {
        id: user.teacher.id,
        designation: user.teacher.designation,
        skills: user.teacher.skills,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
} 