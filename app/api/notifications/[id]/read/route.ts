import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authoptions } from '@/app/lib/auth';

const prisma = new PrismaClient();

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ readId: string }> }
) {
    try {
        const notificationId = (await params).readId;
        const session = await getServerSession(authoptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user by email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // First verify that the notification belongs to the user
        const notification = await prisma.notification.findUnique({
            where: {
                id: notificationId,
                userId: user.id,
            },
        });

        if (!notification) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            );
        }

        // Update the notification
        const updatedNotification = await prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json(updatedNotification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notification as read' },
            { status: 500 }
        );
    }
} 