'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';


type FormData = {
    email: string,
    password: string,
};

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resetSuccess = searchParams.get('reset') === 'success';
    const registeredSuccess = searchParams.get('registered') === 'true';
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { data: session, status } = useSession();
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === 2 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }

        if (countdown === 0) {
            setCanResend(true);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [countdown, step]);

    useEffect(() => {
        if (session && status === 'authenticated') {
            router.replace('/dashboard');
        }
    }, [session]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();

    const onSubmit = async (data: FormData) => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await signIn('credentials', {
                redirect: false,
                email: email,
                password: password,
            });

            if (result?.error) {
                if (result.error === "OTP sent. Check your email.") {
                    setStep(2);
                }
                else {

                    setError('Invalid email or password');
                    return;
                }
            }

        } catch (error) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        console.log(otp)

        try {
            const response = await signIn("credentials", {
                email,
                otp,
                redirect: false,
            });

            if (response?.error) {
                setError(response.error);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Invalid OTP!");
        }

        setIsLoading(false);
    };

    const handleResendOtp = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await signIn('credentials', {
                redirect: false,
                email: email,
                password: password,
                resendOtp: true,
            });

            if (result?.error && result.error !== "OTP sent. Check your email.") {
                setError(result.error);
            } else {
                setCountdown(120);
                setCanResend(false);
                setError(null);
            }
        } catch (error) {
            setError('Failed to resend OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-8 h-8 text-white">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-gray-700 font-medium">
                    Or{' '}
                    <Link href="/auth/register" className="font-medium text-blue-700 hover:text-blue-600 transition-colors">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-gray-100">
                    {resetSuccess && (
                        <div className="rounded-md bg-green-50 p-4 border-l-4 border-green-400 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700 font-medium">
                                        Your password has been reset successfully!
                                    </p>
                                    <p className="mt-1 text-sm text-green-600">
                                        Please log in with your new password.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {registeredSuccess && (
                        <div className="rounded-md bg-green-50 p-4 border-l-4 border-green-400 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-700 font-medium">
                                        Account created successfully!
                                    </p>
                                    <p className="mt-1 text-sm text-green-600">
                                        Please log in with your credentials.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step == 1 ? (
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            {error && (
                                <div className="rounded-md bg-red-50 p-4 border-l-4 border-red-400">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700 font-medium">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-800">
                                    Email address
                                </label>
                                <div className="mt-1 relative">
                                    <div className="flex">
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
                                                    : "focus:border-blue-500 focus:ring-blue-500"
                                            )}
                                            {...register("email", {
                                                required: "Email is required",
                                                pattern: {
                                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                    message: "Invalid email address",
                                                },
                                                onChange: (e) => setEmail(e.target.value)
                                            })}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.email.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-800">
                                    Password
                                </label>
                                <div className="mt-1 relative">
                                    <div className="flex">
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
                                            autoComplete="current-password"
                                            className={cn(
                                                "block w-full rounded-r-md border-y border-r border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:z-10 text-gray-900 sm:text-sm",
                                                errors.password
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                                    : "focus:border-blue-500 focus:ring-blue-500"
                                            )}
                                            {...register("password", {
                                                required: "Password is required",
                                                minLength: {
                                                    value: 6,
                                                    message: "Password must be at least 6 characters",
                                                },
                                                onChange: (e) => setPassword(e.target.value)
                                            })}
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
                                    {errors.password && (
                                        <p className="mt-2 text-sm text-red-600 font-medium">{errors.password.message}</p>
                                    )}
                                </div>
                                <div className="flex items-center justify-end mt-2">
                                    <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                        Forgot your password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending OTP...
                                        </>
                                    ) : (
                                        'Sign in'
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (

                        <form className="space-y-6" onSubmit={handleOtpSubmit}>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="mb-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Back to Login
                            </button>
                            <div className="rounded-md bg-blue-50 p-4 mb-6 border-l-4 border-blue-400">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1">
                                        <p className="text-sm text-blue-800 font-medium">We've sent a verification code to your email.</p>
                                    </div>
                                </div>
                            </div>

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

                            <div>
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-800">
                                    Enter verification code
                                </label>
                                <div className="mt-1 relative">
                                    <div className="flex">
                                        <div className="flex-shrink-0 z-10">
                                            <div className="h-10 w-10 rounded-l-md border-y border-l border-gray-300 bg-gray-50 flex items-center justify-center">
                                                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1.586l-1.293-1.293a1 1 0 10-1.414 1.414L8.586 7H7a1 1 0 000 2h1.586l-2.293 2.293a1 1 0 101.414 1.414L10 10.414l2.293 2.293a1 1 0 001.414-1.414L11.414 9H13a1 1 0 100-2h-1.586l2.293-2.293a1 1 0 00-1.414-1.414L10 5.586V4a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                        <input
                                            id="otp"
                                            type="text"
                                            required
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            placeholder="e.g. 123456"
                                            className="block w-full rounded-r-md border-y border-r border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:z-10 text-gray-900 sm:text-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-700 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify OTP'
                                    )}
                                </button>
                            </div>
                            <div className="flex flex-col items-center justify-center space-y-2 text-sm">
                                <div className="text-gray-600">
                                    {countdown > 0 ? (
                                        <p>Resend OTP available in {Math.floor(countdown / 60)}:{countdown % 60 < 10 ? `0${countdown % 60}` : countdown % 60}</p>
                                    ) : (
                                        <p>Didn't receive the code?</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={!canResend || isLoading}
                                    className={`font-medium ${canResend ? 'text-blue-600 hover:text-blue-500 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                                >
                                    Resend verification code
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
} 