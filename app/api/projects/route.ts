import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';
import { sendProjectNotificationEmail } from '@/app/lib/mail';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authoptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get filter parameter (my or all)
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('status') || 'all';
    
    // Get current user with role details
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

    // Base query options
    const queryOptions = {
      include: {
        lead: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        mentor: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                avatarUrl: true
              }
            }
          }
        },
        team: {
          include: {
            members: {
              include: {
                student: {
                  include: {
                    user: {
                      select: {
                        username: true,
                        email: true,
                        avatarUrl: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        researchPapers: true,
        media: true
      },
      orderBy: {
        createdAt: 'desc' as const
      }
    };

    // If filter is 'my', only get projects where user is involved
    if (filter === 'my') {
      // Find all teams where user is a member
      let teamIds: string[] = [];
      
      if (user.student) {
        const teamMemberships = await prisma.teamMember.findMany({
          where: {
            studentId: user.student.id
          },
          select: {
            teamId: true
          }
        });
        
        teamIds = teamMemberships.map(tm => tm.teamId);
      }
      
      // Different query based on user role
      if (user.teacher) {
        // For teachers: projects where they are mentor
        const projects = await prisma.project.findMany({
          ...queryOptions,
          where: {
            OR: [
              { mentorId: user.teacher.id }, // Teacher is mentor
              { teamId: { in: teamIds } }    // Teacher is in the team
            ]
          }
        });
        return NextResponse.json(projects);
      } 
      else if (user.student) {
        // For students: projects where they are lead or in the team
        const projects = await prisma.project.findMany({
          ...queryOptions,
          where: {
            OR: [
              { leadId: user.student.id },  // Student is team lead
              { teamId: { in: teamIds } }   // Student is in the team
            ]
          }
        });
        return NextResponse.json(projects);
      }
      else {
        return NextResponse.json([]);
      }
    } 
    // Default: return all approved/active projects
    else {
      const projects = await prisma.project.findMany({
        ...queryOptions,
        where: {
          status: {
            not: 'PENDING'  // Exclude pending projects
          }
        }
      });
      return NextResponse.json(projects);
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authoptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details
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

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || !body.type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, and type are required' },
        { status: 400 }
      );
    }

    let projectData = {
      title: body.title,
      description: body.description,
      type: body.type,
      githubLink: body.githubLink || null,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
    };

    // Determine if teacher or student is creating the project
    const isTeacherCreating = user.teacher && !!body.teamLeadId;
    const isStudentCreating = user.student && !!body.mentorId;

    if (isTeacherCreating) {
      // Teacher creating a project (must specify a team lead)
      if (!user.teacher) {
        return NextResponse.json(
          { error: 'Only teachers can specify a team lead' },
          { status: 403 }
        );
      }

      const teamLead = await prisma.student.findUnique({
        where: { id: body.teamLeadId },
        include: { user: true }
      });

      if (!teamLead) {
        return NextResponse.json(
          { error: 'Team lead not found' },
          { status: 404 }
        );
      }

      // First create a team for the project
      const team = await prisma.team.create({
        data: {
          name: `${body.title} Team`,
          description: `Team for ${body.title}`,
          members: {
            create: {
              role: 'LEAD',
              studentId: teamLead.id
            }
          }
        }
      });

      // Create project with specified team lead, teacher as mentor, and connect to the team
      const project = await prisma.project.create({
        data: {
          ...projectData,
          status: 'APPROVED',
          leadId: teamLead.id,
          mentorId: user.teacher.id,
          teamId: team.id
        }
      });

      // Create notification for the team lead
      await prisma.notification.create({
        data: {
          type: 'PROJECT_APPROVAL',
          message: `You have been assigned as the team lead for the project: ${project.title}`,
          userId: teamLead.user.id,
          projectId: project.id
        }
      });

      // Send email to team lead
      try {
        if (teamLead.user.email) {
          await sendProjectNotificationEmail({
            to: teamLead.user.email,
            projectTitle: project.title,
            projectType: project.type as string,
            role: 'TEAM_LEAD',
            createdBy: user.username
          });
        }
      } catch (emailError) {
        console.error('Failed to send team lead notification email:', emailError);
      }

      return NextResponse.json(project);
    }
    else if (isStudentCreating) {
      // Student creating a project (automatically becomes team lead)
      if (!user.student) {
        return NextResponse.json(
          { error: 'Student record not found' },
          { status: 404 }
        );
      }

      // Validate mentor ID is provided for student projects
      if (!body.mentorId) {
        return NextResponse.json(
          { error: 'A mentor must be specified for student-created projects' },
          { status: 400 }
        );
      }

      // Verify the mentor exists
      const mentor = await prisma.teacher.findUnique({
        where: { id: body.mentorId },
        include: { user: true }
      });

      if (!mentor) {
        return NextResponse.json(
          { error: 'Mentor not found' },
          { status: 404 }
        );
      }
      
      // First create a team for the project with the student as team lead
      const team = await prisma.team.create({
        data: {
          name: `${body.title} Team`,
          description: `Team for ${body.title}`,
          members: {
            create: {
              role: 'LEAD',
              studentId: user.student.id
            }
          }
        }
      });
      
      // Create project with student as team lead, specified mentor, and connect to the team
      const project = await prisma.project.create({
        data: {
          ...projectData,
          status: 'PENDING' as const, // Projects created by students start as pending
          leadId: user.student.id,
          mentorId: mentor.id,
          teamId: team.id
        }
      });

      // Create notification for the mentor
      await prisma.notification.create({
        data: {
          type: 'PROJECT_APPROVAL',
          message: `You have been assigned as mentor for the project: ${project.title}`,
          userId: mentor.user.id,
          projectId: project.id
        }
      });

      // Send email to mentor
      try {
        if (mentor.user.email) {
          await sendProjectNotificationEmail({
            to: mentor.user.email,
            projectTitle: project.title,
            projectType: project.type as string,
            role: 'MENTOR',
            createdBy: user.username
          });
        }
      } catch (emailError) {
        console.error('Failed to send mentor notification email:', emailError);
        // Don't fail the request if email sending fails
      }

      return NextResponse.json(project);
    }
    else {
      // Handle case where neither condition is met
      if (user.teacher && !body.teamLeadId) {
        return NextResponse.json(
          { error: 'Teacher must specify a team lead for the project' },
          { status: 400 }
        );
      }
      
      if (user.student && !body.mentorId) {
        return NextResponse.json(
          { error: 'Student must specify a mentor for the project' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid project creation request. Could not determine creation mode.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({
      error: 'Failed to create project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

