import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';
import { sendProjectNotificationEmail } from '@/app/lib/mail';

export async function POST(
    request: NextRequest,
    { params }: { params: { projectId: string } }
) {
    try {
        const session = await getServerSession(authoptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get the current user with their role details
        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string },
            include: {
                teacher: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user is a teacher
        if (!user.teacher) {
            return NextResponse.json(
                { error: 'Only teachers can approve or reject projects' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status, comment } = body;

        // Validate status
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be either APPROVED or REJECTED' },
                { status: 400 }
            );
        }

        // Get the project with its lead and mentor details
        const project = await prisma.project.findUnique({
            where: { id: params.projectId },
            include: {
                lead: {
                    include: {
                        user: true
                    }
                },
                mentor: {
                    include: {
                        user: true
                    }
                }
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check if the teacher is the project's mentor
        if (project.mentorId !== user.teacher.id) {
            return NextResponse.json(
                { error: 'Only the project mentor can approve or reject the project' },
                { status: 403 }
            );
        }

        // Update project status
        const updatedProject = await prisma.project.update({
            where: { id: params.projectId },
            data: {
                status: status as 'APPROVED' | 'REJECTED',
            }
        });

        // Create approval record
        await prisma.approval.create({
            data: {
                status: status,
                comment: comment,
                projectId: project.id,
                mentorId: user.teacher.id
            }
        });

        // Create notification for the project lead
        await prisma.notification.create({
            data: {
                type: status === 'APPROVED' ? 'PROJECT_APPROVAL' : 'PROJECT_UPDATE',
                message: status === 'APPROVED'
                    ? `Your project "${project.title}" has been approved by ${user.username}`
                    : `Your project "${project.title}" has been rejected by ${user.username}`,
                userId: project.lead.user.id,
                projectId: project.id
            }
        });

        // Send email notification to the project lead
        try {
            if (project.lead.user.email) {
                await sendProjectNotificationEmail({
                    to: project.lead.user.email,
                    projectTitle: project.title,
                    projectType: project.type as string,
                    role: 'PROJECT_LEAD',
                    status: status,
                    createdBy: user.username,
                    comment: comment
                });
            }
        } catch (emailError) {
            console.error('Failed to send notification email:', emailError);
        }

        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Error handling project approval:', error);
        return NextResponse.json(
            { error: 'Failed to process project approval' },
            { status: 500 }
        );
    }
} 