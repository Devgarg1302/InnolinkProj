import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authoptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search query parameter
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json([]);
    }

    // Search for students by user properties (username, email) or rollNumber
    const students = await prisma.student.findMany({
      where: {
        OR: [
          {
            user: {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
              ]
            }
          },
          { rollNumber: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      take: 10 // Limit results to prevent performance issues
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    return NextResponse.json(
      { error: 'Failed to search students' },
      { status: 500 }
    );
  }
} 