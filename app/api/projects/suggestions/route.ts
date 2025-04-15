import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term') || '';
    const type = searchParams.get('type') || 'project';

    if (!term || term.length < 2) {
      return NextResponse.json([]);
    }

    const searchTerm = term.toLowerCase();

    switch (type) {
      case 'project':
        const projects = await prisma.project.findMany({
          where: {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } }
            ]
          },
          select: {
            title: true
          },
          take: 5
        });
        return NextResponse.json(projects.map(p => p.title));

      case 'teacher':
        const teachers = await prisma.teacher.findMany({
          where: {
            user: {
              username: { contains: searchTerm, mode: 'insensitive' }
            }
          },
          select: {
            user: {
              select: {
                username: true
              }
            }
          },
          take: 5
        });
        return NextResponse.json(teachers.map(t => t.user.username));

      case 'leader':
        const leaders = await prisma.student.findMany({
          where: {
            user: {
              username: { contains: searchTerm, mode: 'insensitive' }
            }
          },
          select: {
            user: {
              select: {
                username: true
              }
            }
          },
          take: 5
        });
        return NextResponse.json(leaders.map((l: { user: { username: string } }) => l.user.username));

      default:
        return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
} 