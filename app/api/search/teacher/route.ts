import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

// Define interface for teacher search results
interface TeacherResult {
  id: string;
  username: string;
  email: string;
  department: string | null;
  teacher: {
    id: string;
    designation: string | null;
  } | null;
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authoptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search for teachers based on username or department
    const teachers = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { department: { contains: query, mode: 'insensitive' } }
        ],
        teacher: {
          isNot: null // Ensure we're only fetching teachers
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        department: true,
        teacher: {
          select: {
            id: true,
            designation: true
          }
        }
      },
      take: 10, // Limit results
    });

    // Format the response to use teacher.id as the main id field
    const formattedTeachers = teachers.map((teacher: TeacherResult) => ({
      id: teacher.teacher?.id || '', // Use teacher.id as main ID for referencing
      userId: teacher.id, // Keep user.id as reference
      username: teacher.username,
      email: teacher.email,
      department: teacher.department,
      designation: teacher.teacher?.designation || undefined
    }));

    return NextResponse.json(formattedTeachers);
  } catch (error) {
    console.error('Error searching teachers:', error);
    return NextResponse.json({ error: 'Failed to search teachers' }, { status: 500 });
  }
} 