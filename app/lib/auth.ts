import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { DefaultSession } from "next-auth"
import redis from "@/lib/redis"
import nodemailer from "nodemailer";


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOtpEmail = async (email: string, otp: string) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            secure: true,
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Thapar Project Portal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your OTP Code",
            text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Your OTP Code</h2>
                    <p>Your OTP is: <strong>${otp}</strong></p>
                    <p>This OTP is valid for 5 minutes.</p>
                    <p>If you didn't request this OTP, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error('Failed to send OTP email. Please try again later.');
    }
};


declare module "next-auth" {
    interface User {
        username: string;
        role: string;
    }
    interface Session {
        user: {
            username: string;
            role: string;
        } & DefaultSession["user"]
    }
}

export const authoptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/auth/login',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                otp: { label: "OTP", type: "text", optional: true },
            },
            async authorize(credentials) {
                console.log('Auth attempt:', { email: credentials?.email });
                const { email, password, otp } = credentials ?? {};

                if (!email) {
                    return null;
                }

                const otpRequestKey = `otp_request:${email}`;
                const otpCooldown = await redis.get(otpRequestKey);

                if (!otp && otpCooldown) {
                    throw new Error("Please wait 15 seconds before requesting a new OTP.");
                }


                if (!otp) {
                    if (!password) {
                        return null;
                    }

                    const existingUser = await prisma.user.findUnique({ where: { email } });
                    if (!existingUser) {
                        return null;
                    }

                    const passwordMatch = await bcrypt.compare(password, existingUser.password);
                    if (!passwordMatch) {
                        return null;
                    }

                    const generatedOtp = generateOTP();

                    await redis.set(`otp:${email}`, generatedOtp, { ex: 300 });
                    await redis.set(otpRequestKey, "1", { ex: 15 });

                    // Send OTP
                    await sendOtpEmail(email, generatedOtp);
                    throw new Error("OTP sent. Check your email.");
                }


                // Step 2: Verify OTP from Redis
                const storedOtp = await redis.get(`otp:${email}`);

                if(!storedOtp) {
                    throw new Error("OTP expired. Please request a new one.");
                }

                if (!storedOtp || storedOtp != otp) {
                    throw new Error("Invalid or expired OTP.");
                }



                // Delete OTP from Redis after successful login
                await redis.del(`otp:${email}`);

                const user = await prisma.user.findUnique({
                    where: { email },
                    include: {
                        teacher: true,
                        student: true
                    }
                });

                if (!user) {
                    return null;
                }

                console.log('Auth successful:', {
                    id: user.id,
                    email: user.email,
                    role: user.teacher ? 'TEACHER' : 'STUDENT'
                });

                return {
                    id: `${user.id}`,
                    username: user.username,
                    email: user.email,
                    role: user.teacher ? 'TEACHER' : 'STUDENT'
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                return {
                    ...token,
                    username: user.username,
                    role: user.role
                }
            }
            return token
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    username: token.username,
                    role: token.role
                }
            }
        }
    }
}