import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';

export async function GET(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await getServerSession(authoptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const project = await prisma.project.findUnique({
            where: { id: params.projectId },
            include: {
                lead: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true,
                                avatarUrl: true
                            }
                        },
                    },
                },
                mentor: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                email: true,
                                avatarUrl: true
                            }
                        },
                    },
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
                media: true,
            },
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error fetching project details:', error);
        return NextResponse.json(
            { error: 'Failed to fetch project details' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await getServerSession(authoptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user with role details
        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            include: {
                teacher: true,
                student: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get the project with its details
        const project = await prisma.project.findUnique({
            where: { id: params.projectId },
            include: {
                lead: true,
                mentor: true,
                researchPapers: true,
                media: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check if user is authorized to update the project (mentor or lead)
        const isMentor = project.mentorId === user.teacher?.id;
        const isTeamLead = project.leadId === user.student?.id;

        if (!isMentor && !isTeamLead) {
            return NextResponse.json({
                error: 'Only the project mentor or lead can update the project'
            }, { status: 403 });
        }

        const body = await request.json();

        // Basic validation
        if (body.title && typeof body.title !== 'string') {
            return NextResponse.json({ error: 'Title must be a string' }, { status: 400 });
        }

        if (body.description && typeof body.description !== 'string') {
            return NextResponse.json({ error: 'Description must be a string' }, { status: 400 });
        }

        // Create transaction to handle all updates
        const updatedProject = await prisma.$transaction(async (tx) => {
            // 1. Update basic project info
            const projectUpdate = await tx.project.update({
                where: { id: params.projectId },
                data: {
                    title: body.title,
                    description: body.description,
                    githubLink: body.githubLink,
                    startDate: body.startDate ? new Date(body.startDate) : undefined,
                    endDate: body.endDate ? new Date(body.endDate) : undefined,
                    type: body.type
                },
                include: {
                    researchPapers: true,
                    media: true
                }
            });

            // 2. Handle research papers updates if provided
            if (body.researchPapers) {
                // Validate research papers
                if (!Array.isArray(body.researchPapers)) {
                    throw new Error('Research papers must be an array');
                }

                // Process research papers to add/update
                for (const paper of body.researchPapers) {
                    if (paper.id) {
                        // Update existing paper
                        await tx.researchPaper.update({
                            where: { 
                                id: paper.id,
                                projectId: params.projectId // Ensure paper belongs to this project
                            },
                            data: {
                                title: paper.title,
                                authors: paper.authors,
                                abstract: paper.abstract,
                                url: paper.url,
                                publishedAt: paper.publishedAt ? new Date(paper.publishedAt) : null
                            }
                        });
                    } else {
                        // Create new paper
                        await tx.researchPaper.create({
                            data: {
                                title: paper.title,
                                authors: paper.authors || [],
                                abstract: paper.abstract,
                                url: paper.url,
                                publishedAt: paper.publishedAt ? new Date(paper.publishedAt) : null,
                                projectId: params.projectId
                            }
                        });
                    }
                }

                // Delete papers that were removed (if papersToDelete provided)
                if (body.papersToDelete && Array.isArray(body.papersToDelete)) {
                    for (const paperId of body.papersToDelete) {
                        await tx.researchPaper.deleteMany({
                            where: {
                                id: paperId,
                                projectId: params.projectId // Security: Ensure paper belongs to this project
                            }
                        });
                    }
                }
            }

            // 3. Handle media updates if provided
            if (body.media) {
                // Validate media
                if (!Array.isArray(body.media)) {
                    throw new Error('Media must be an array');
                }

                // Process media to add/update
                for (const item of body.media) {
                    if (item.id) {
                        // Update existing media
                        await tx.media.update({
                            where: { 
                                id: item.id,
                                projectId: params.projectId // Ensure media belongs to this project
                            },
                            data: {
                                title: item.title,
                                type: item.type,
                                url: item.url,
                                description: item.description
                            }
                        });
                    } else {
                        // Create new media
                        await tx.media.create({
                            data: {
                                title: item.title,
                                type: item.type,
                                url: item.url,
                                description: item.description,
                                projectId: params.projectId
                            }
                        });
                    }
                }

                // Delete media that were removed (if mediaToDelete provided)
                if (body.mediaToDelete && Array.isArray(body.mediaToDelete)) {
                    for (const mediaId of body.mediaToDelete) {
                        await tx.media.deleteMany({
                            where: {
                                id: mediaId,
                                projectId: params.projectId // Security: Ensure media belongs to this project
                            }
                        });
                    }
                }
            }

            // Fetch the updated project with all its relations
            return await tx.project.findUnique({
                where: { id: params.projectId },
                include: {
                    lead: {
                        include: {
                            user: {
                                select: {
                                    username: true,
                                    email: true,
                                    avatarUrl: true
                                }
                            },
                        },
                    },
                    mentor: {
                        include: {
                            user: {
                                select: {
                                    username: true,
                                    email: true,
                                    avatarUrl: true
                                }
                            },
                        },
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
                    media: true,
                }
            });
        });

        // Create notification for the project team about the update
        if (updatedProject?.team?.members) {
            // Get all students with their full user records to access the id field
            const memberIds = updatedProject.team.members
                .filter(member => !member.leftAt)
                .map(member => member.studentId);
            
            if (memberIds.length > 0) {
                // Fetch full user records for all team members
                const teamMembers = await prisma.student.findMany({
                    where: { id: { in: memberIds } },
                    include: { user: true }
                });
                
                // Create notifications for all active team members
                for (const member of teamMembers) {
                    await prisma.notification.create({
                        data: {
                            type: 'PROJECT_UPDATE',
                            message: `The project "${updatedProject.title}" has been updated`,
                            userId: member.user.id,
                            projectId: updatedProject.id
                        }
                    });
                }
            }
        }

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        return NextResponse.json({
            error: 'Failed to update project',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await getServerSession(authoptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the user with their role details
        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            include: {
                teacher: true,
                student: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get the project with its lead and mentor details
        const project = await prisma.project.findUnique({
            where: { id: params.projectId },
            include: {
                lead: true,
                mentor: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Authorization: Only the project mentor, team lead, or a teacher can delete a project
        const isTeacher = !!user.teacher;
        const isMentor = project.mentorId === user.teacher?.id;
        const isTeamLead = project.leadId === user.student?.id;

        if (!isTeacher && !isMentor && !isTeamLead) {
            return NextResponse.json({ 
                error: 'Only the project mentor, team lead, or a teacher can delete this project' 
            }, { status: 403 });
        }

        // Delete project and all related records (Prisma cascades the deletion for relations with onDelete: Cascade)
        await prisma.project.delete({
            where: { id: params.projectId }
        });

        return NextResponse.json({ message: 'Project deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting project:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
} 