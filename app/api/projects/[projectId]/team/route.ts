import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';

// Add a team member to a project
export async function POST(
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

        // Get the project with its team, lead and mentor details
        const project = await prisma.project.findUnique({
            where: { id: params.projectId },
            include: {
                lead: true,
                mentor: true,
                team: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Authorization: Only the project mentor or lead can add team members
        const isMentor = project.mentorId === user.teacher?.id;
        const isTeamLead = project.leadId === user.student?.id;

        if (!isMentor && !isTeamLead) {
            return NextResponse.json({ 
                error: 'Only the project mentor or lead can manage team members' 
            }, { status: 403 });
        }

        // Use the existing team - we don't need to create a new one since
        // teams are now created when the project is created
        const teamId = project.teamId;
        
        if (!teamId) {
            return NextResponse.json(
                { error: 'Project does not have a team' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { studentId, role = 'MEMBER' } = body;

        if (!studentId) {
            return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
        }

        // Check if student exists
        const student = await prisma.student.findUnique({
            where: { id: studentId }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }


        // Check if the student is already in the team
        const existingMember = await prisma.teamMember.findUnique({
            where: {
                studentId_teamId: {
                    studentId: studentId,
                    teamId: teamId
                }
            }
        });

        if (existingMember) {
            // If the member was previously removed (has leftAt), update to add them back
            if (existingMember.leftAt) {
                const updatedMember = await prisma.teamMember.update({
                    where: { id: existingMember.id },
                    data: {
                        role: role,
                        leftAt: null,
                        joinedAt: new Date()
                    }
                });
                return NextResponse.json(updatedMember);
            }
            
            return NextResponse.json(
                { error: 'Student is already a member of this team' }, 
                { status: 400 }
            );
        }

        // Add the student to the team
        const teamMember = await prisma.teamMember.create({
            data: {
                role: role,
                teamId: teamId,
                studentId: studentId
            }
        });

        return NextResponse.json(teamMember);

    } catch (error) {
        console.error('Error adding team member:', error);
        return NextResponse.json(
            { error: 'Failed to add team member' },
            { status: 500 }
        );
    }
}

// Remove a team member from a project
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

        // Get the project with its team, lead and mentor details
        const project = await prisma.project.findUnique({
            where: { id: params.projectId },
            include: {
                lead: true,
                mentor: true,
                team: true
            }
        });

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Authorization: Only the project mentor or lead can remove team members
        const isMentor = project.mentorId === user.teacher?.id;
        const isTeamLead = project.leadId === user.student?.id;

        if (!isMentor && !isTeamLead) {
            return NextResponse.json({ 
                error: 'Only the project mentor or lead can manage team members' 
            }, { status: 403 });
        }

        // Get teamMemberId from query parameters
        const searchParams = request.nextUrl.searchParams;
        const teamMemberId = searchParams.get('teamMemberId');

        if (!teamMemberId) {
            return NextResponse.json({ error: 'Team member ID is required' }, { status: 400 });
        }

        // Find the team member
        const teamMember = await prisma.teamMember.findUnique({
            where: { id: teamMemberId },
            include: { team: true }
        });

        if (!teamMember) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        // Check if the team member belongs to this project's team
        if (teamMember.team.id !== project.teamId) {
            return NextResponse.json({ 
                error: 'Team member does not belong to this project' 
            }, { status: 400 });
        }

        // Don't allow removing the project lead
        if (teamMember.studentId === project.leadId) {
            return NextResponse.json({ 
                error: 'Cannot remove the project lead from the team' 
            }, { status: 400 });
        }

        // Soft delete by setting leftAt instead of actually deleting
        const updatedMember = await prisma.teamMember.update({
            where: { id: teamMemberId },
            data: { leftAt: new Date() }
        });

        return NextResponse.json({ 
            message: 'Team member removed successfully',
            teamMember: updatedMember
        });

    } catch (error) {
        console.error('Error removing team member:', error);
        return NextResponse.json(
            { error: 'Failed to remove team member' },
            { status: 500 }
        );
    }
} 