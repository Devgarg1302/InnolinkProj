'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';


const baseSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Name must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
});

const studentSchema = baseSchema.extend({
    role: z.literal('STUDENT'),
    profileData: z.object({
        department: z.string().optional(),
        year: z.string().optional().transform(val => val ? parseInt(val) : undefined),
        rollNumber: z.string().optional(),
        designation: z.string().optional(),
    }).optional(),
});

const teacherSchema = baseSchema.extend({
    role: z.literal('TEACHER'),
    profileData: z.object({
        department: z.string().min(1, 'Department is required'),
        designation: z.string().min(1, 'Designation is required'),
    }),
});

const formSchema = z.discriminatedUnion("role", [studentSchema, teacherSchema])
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ["confirmPassword"],
    });

type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useState('STUDENT');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data: session, status } = useSession();



    useEffect(() => {
        if (session && status === 'authenticated') {
            router.replace('/dashboard');
        }
    }, [session]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
    });
    const handleUserTypeChange = (type: string) => {
        setUserType(type);
        setValue('role', type as "STUDENT" | "TEACHER");
    };

    const onSubmit = async (data: FormData) => {
        try {
            setIsLoading(true);
            setError(null);
            console.log(data)
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                setError(result.error || 'Registration failed');
                return;
            }


            router.replace('/auth/login?registered=true');
        } catch (error) {
            setError(`'An error occurred. Please try again.'${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-gradient-to-br from-blue-50 to-indigo-100 justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Join our community
                </h2>
                <p className="mt-2 text-center text-sm text-gray-700 font-medium">
                    Or{' '}
                    <Link href="/auth/login" className="font-medium text-blue-700 hover:text-blue-600 transition-colors">
                        sign in to your existing account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white px-4 py-8 shadow-2xl sm:rounded-lg sm:px-10 border border-gray-100">
                    {/* User type selector */}
                    <div className="flex rounded-md shadow-sm mb-6">
                        <button
                            type="button"
                            onClick={() => handleUserTypeChange('STUDENT')}
                            className={cn(
                                "w-full inline-flex justify-center items-center px-4 py-3 text-sm font-medium rounded-l-md focus:outline-none transition-colors duration-200",
                                userType === 'STUDENT'
                                    ? "bg-blue-700 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                            </svg>
                            Student
                        </button>
                        <button
                            type="button"
                            onClick={() => handleUserTypeChange('TEACHER')}
                            className={cn(
                                "w-full inline-flex justify-center items-center px-4 py-3 text-sm font-medium rounded-r-md focus:outline-none transition-colors duration-200",
                                userType === 'TEACHER'
                                    ? "bg-blue-700 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                            </svg>
                            Teacher
                        </button>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-400">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-red-700 font-medium">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hidden role field */}
                        <input
                            type="hidden"
                            {...register('role')}
                            value={userType}
                        />

                        {/* Common fields */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-800">
                                Full Name
                            </label>
                            <div className="mt-1 relative">
                                <div className="flex">
                                    <div className="flex-shrink-0 z-10">
                                        <div className="h-10 w-10 rounded-l-md border-y border-l border-gray-300 bg-gray-50 flex items-center justify-center">
                                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <input
                                        id="username"
                                        type="text"
                                        autoComplete="name"
                                        className={cn(
                                            "block w-full rounded-r-md border-y border-r border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:z-10 text-gray-900 sm:text-sm",
                                            errors.username
                                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                : "focus:border-blue-500 focus:ring-blue-500"
                                        )}
                                        {...register("username")}
                                    />
                                </div>
                                {errors.username && (
                                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.username.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative flex">
                                <div className="flex-shrink-0 z-10">
                                    <div className="h-10 w-10 rounded-l-md border-y border-l border-gray-300 bg-gray-50 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    className={cn(
                                        "block w-full rounded-r-md border-y border-r border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:z-10 text-gray-900 sm:text-sm",
                                        errors.email
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    )}
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative flex">
                                <div className="flex-shrink-0 z-10">
                                    <div className="h-10 w-10 rounded-l-md border-y border-l border-gray-300 bg-gray-50 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    className={cn(
                                        "block w-full rounded-r-md border-y border-r border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:z-10 text-gray-900 sm:text-sm",
                                        errors.password
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    )}
                                    {...register("password")}
                                />

                                <div className='flex-shrink-0 z-10'>
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                    >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 relative flex">
                                <div className="flex-shrink-0 z-10">
                                    <div className="h-10 w-10 rounded-l-md border-y border-l border-gray-300 bg-gray-50 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 116 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={cn(
                                        "block w-full rounded-r-md border-y border-r border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:z-10 text-gray-900 sm:text-sm",
                                        errors.confirmPassword
                                            ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                            : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    )}
                                    {...register("confirmPassword")}
                                />
                                
                                <div className='flex-shrink-0 z-10'>
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                                    >
                                        {showConfirmPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Conditional fields based on user type */}
                        {userType === 'STUDENT' && (
                            <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-800 mb-3">Student Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                            Department (optional)
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="department"
                                                type="text"
                                                placeholder="e.g. Computer Science"
                                                className="block w-full text-black appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                {...register("profileData.department")}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                                            Year (optional)
                                        </label>
                                        <div className="mt-1">
                                            <select
                                                id="year"
                                                className="block w-full text-black appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                {...register("profileData.year")}
                                            >
                                                <option value="">Select Year</option>
                                                <option value="1">1st Year</option>
                                                <option value="2">2nd Year</option>
                                                <option value="3">3rd Year</option>
                                                <option value="4">4th Year</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="rollNumber" className="block text-sm font-medium text-gray-700">
                                            Roll Number (optional)
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="rollNumber"
                                                type="text"
                                                placeholder="e.g. 102003001"
                                                className="block w-full text-black appearance-none rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                                {...register("profileData.rollNumber")}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {userType === 'TEACHER' && (
                            <div className="rounded-md bg-gray-50 p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-800 mb-3">Teacher Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                                            Department
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="department"
                                                type="text"
                                                placeholder="e.g. Computer Science"
                                                className={cn(
                                                    "block w-full text-black appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm",
                                                    errors.profileData?.department
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                )}
                                                {...register("profileData.department")}
                                            />
                                            {errors.profileData?.department && (
                                                <p className="mt-2 text-sm text-red-600">{errors.profileData.department.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="designation" className="block text-sm font-medium text-gray-700">
                                            Designation
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="designation"
                                                type="text"
                                                placeholder="e.g. Assistant Professor"
                                                className={cn(
                                                    "block w-full text-black appearance-none rounded-md border px-3 py-2 shadow-sm focus:outline-none sm:text-sm",
                                                    errors.profileData?.designation
                                                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                                )}
                                                {...register("profileData.designation")}
                                            />
                                            {errors.profileData?.designation && (
                                                <p className="mt-2 text-sm text-red-600">{errors.profileData.designation.message}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Create account
                                        <span className="absolute right-2 inset-y-0 flex items-center pl-3">
                                            <svg className="h-5 w-5 text-blue-400 group-hover:text-blue-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 