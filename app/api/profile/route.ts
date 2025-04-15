import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authoptions } from '@/app/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authoptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                student: true,
                teacher: true,
                experiences: true,
                certifications: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Transform the data based on user role
        const profileData = {
            name: user.username,
            email: user.email,
            bio: user.bio,
            department: user.department,
            ...(user.student ? {
                year: user.student.year,
                rollNumber: user.student.rollNumber,
                skills: user.student.skills,
            } : {
                designation: user.teacher?.designation,
                skills: user.teacher?.skills,
            }),
            experiences: user.experiences.map(exp => ({
                position: exp.position,
                company: exp.company,
                startDate: exp.startDate.toISOString().split('T')[0],
                endDate: exp.endDate?.toISOString().split('T')[0],
                description: exp.description,
            })),
            certifications: user.certifications.map(cert => ({
                title: cert.title,
                issuer: cert.issuer,
                issueDate: cert.issueDate.toISOString().split('T')[0],
                expiryDate: cert.expiryDate?.toISOString().split('T')[0],
                credentialId: cert.credentialId,
                credentialUrl: cert.credentialUrl,
            })),
        };

        return NextResponse.json(profileData);
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authoptions);
        
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                student: true,
                teacher: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Update user data
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                username: data.name,
                bio: data.bio,
                department: data.department,
            }
        });

        // Update role-specific data
        if (user.student) {
            await prisma.student.update({
                where: { userId: user.id },
                data: {
                    year: data.year,
                    rollNumber: data.rollNumber,
                    skills: data.skills,
                }
            });
        } else if (user.teacher) {
            await prisma.teacher.update({
                where: { userId: user.id },
                data: {
                    designation: data.designation,
                    skills: data.skills,
                }
            });
        }

        // Update experiences
        if (data.experiences) {
            // Delete existing experiences
            await prisma.experience.deleteMany({
                where: { userId: user.id }
            });

            // Create new experiences
            await prisma.experience.createMany({
                data: data.experiences.map((exp: any) => ({
                    userId: user.id,
                    position: exp.position,
                    company: exp.company,
                    startDate: new Date(exp.startDate),
                    endDate: exp.endDate ? new Date(exp.endDate) : null,
                    description: exp.description,
                }))
            });
        }

        // Update certifications
        if (data.certifications) {
            // Delete existing certifications
            await prisma.certification.deleteMany({
                where: { userId: user.id }
            });

            // Create new certifications
            await prisma.certification.createMany({
                data: data.certifications.map((cert: any) => ({
                    userId: user.id,
                    title: cert.title,
                    issuer: cert.issuer,
                    issueDate: new Date(cert.issueDate),
                    expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
                    credentialId: cert.credentialId,
                    credentialUrl: cert.credentialUrl,
                }))
            });
        }

        return NextResponse.json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
