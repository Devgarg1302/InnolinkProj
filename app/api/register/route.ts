import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, username, password, role, profileData } = body;

        // Validate inputs
        if (!email || !username || !password || !role) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user and profile in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create base user
            const user = await tx.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    department: profileData?.department || null,
                    role,

                    ...(role === 'STUDENT'
                        ? {
                            student: {
                                create: {
                                    year: profileData?.year || null,
                                    rollNumber: profileData?.rollNumber || null,
                                    skills: []
                                }
                            }
                        }
                        : {
                            teacher: {
                                create: {
                                    designation: profileData?.designation || null,
                                    skills: []
                                }
                            }
                        })
                } as any
            });

            return user;
        });

        return NextResponse.json(
            {
                message: 'User registered successfully',
                user: {
                    id: result.id,
                    email: result.email,
                    username: result.username,
                    role: role
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Failed to register user' },
            { status: 500 }
        );
    }
} 