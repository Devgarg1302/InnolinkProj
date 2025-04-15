import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

// Define interface for student search results
interface StudentResult {
  id: string;
  username: string;
  email: string;
  department: string | null;
  student: {
    id: string;
    rollNumber: string | null;
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

    // Search for students based on username or student.rollNumber
    const students = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { 
            student: {
              rollNumber: { contains: query, mode: 'insensitive' }
            }
          }
        ],
        student: {
          isNot: null // Ensure we're only fetching students
        }
      },
      select: {
        id: true,
        username: true,
        email: true,
        department: true,
        student: {
          select: {
            id: true,
            rollNumber: true
          }
        }
      },
      take: 10, // Limit results
    });

    // Format the response to use student.id as the main id field
    const formattedStudents = students.map((student: StudentResult) => ({
      id: student.student?.id || '', // Use student.id as main ID for referencing
      userId: student.id, // Keep user.id as reference
      username: student.username,
      email: student.email,
      rollNumber: student.student?.rollNumber || null,
      department: student.department
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error('Error searching students:', error);
    return NextResponse.json({ error: 'Failed to search students' }, { status: 500 });
  }
} 