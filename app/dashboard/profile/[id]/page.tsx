import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authoptions } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import BackButton from "./BackButton";

// Add Project interface
interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    type: string | null;
}

export default async function UserProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const id = (await params).id;
    const session = await getServerSession(authoptions);
    if (!session?.user) {
        return notFound();
    }

    // Get the user profile data
    const user = await prisma.user.findUnique({
        where: { id: id },
        include: {
            student: true,
            teacher: true,
        },
    });

    if (!user) {
        return notFound();
    }

    // Helper function to format date
    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Get user's projects (as lead for students, as mentor for teachers)
    const projects = user.student
        ? await prisma.project.findMany({
            where: { leadId: user.student.id },
            include: {
                lead: {
                    include: {
                        user: true,
                    },
                },
                mentor: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { updatedAt: "desc" },
            take: 5,
        })
        : user.teacher
            ? await prisma.project.findMany({
                where: { mentorId: user.teacher.id },
                include: {
                    lead: {
                        include: {
                            user: true,
                        },
                    },
                    mentor: {
                        include: {
                            user: true,
                        },
                    },
                },
                orderBy: { updatedAt: "desc" },
                take: 5,
            })
            : [];

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <BackButton />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
                        <div className="flex flex-col items-center">
                            {user.avatarUrl ? (
                                <Image
                                    src={user.avatarUrl}
                                    alt={user.username}
                                    width={120}
                                    height={120}
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl font-semibold">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <h1 className="mt-4 text-xl font-bold text-gray-900">
                                {user.username}
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 mt-2 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.role}
                            </span>
                            <p className="mt-1 text-sm text-gray-500">{user.email}</p>
                        </div>

                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Contact Information
                            </h2>

                            <div className="mt-4 space-y-3">
                                {user.phoneNumber && (
                                    <div className="flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 text-gray-400 mr-2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                                            />
                                        </svg>
                                        <span className="text-sm text-gray-600">
                                            {user.phoneNumber}
                                        </span>
                                    </div>
                                )}

                                {user.department && (
                                    <div className="flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 text-gray-400 mr-2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                                            />
                                        </svg>
                                        <span className="text-sm text-gray-600">
                                            {user.department}
                                        </span>
                                    </div>
                                )}

                                {user.location && (
                                    <div className="flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 text-gray-400 mr-2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                                            />
                                        </svg>
                                        <span className="text-sm text-gray-600">
                                            {user.location}
                                        </span>
                                    </div>
                                )}

                                {user.website && (
                                    <div className="flex">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-5 h-5 text-gray-400 mr-2"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                                            />
                                        </svg>
                                        <a
                                            href={user.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {user.website}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {user.bio && (
                            <div className="mt-6 border-t border-gray-200 pt-4">
                                <h2 className="text-lg font-medium text-gray-900">Bio</h2>
                                <p className="mt-2 text-sm text-gray-600">{user.bio}</p>
                            </div>
                        )}

                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <h2 className="text-lg font-medium text-gray-900">Account Info</h2>
                            <p className="mt-2 text-sm text-gray-500">
                                Member since {formatDate(user.createdAt)}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Last updated {formatDate(user.updatedAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {user.student
                                    ? "Projects Led"
                                    : user.teacher
                                        ? "Mentored Projects"
                                        : "Projects"}
                            </h2>

                            {projects.length > 0 ? (
                                <div className="space-y-4">
                                    {projects.map((project: Project) => (
                                        <Link
                                            key={project.id}
                                            href={`/dashboard/projects/${project.id}`}
                                            className="block border rounded-lg p-4 hover:bg-gray-50 transition"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {project.title}
                                                    </h3>
                                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                    <div className="mt-2 flex items-center">
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {project.type || "Project"}
                                                        </span>
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {project.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-5 w-5 text-gray-400"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No projects found.</p>
                            )}

                            {/* See All Projects Link */}
                            {projects.length > 0 && (
                                <div className="mt-4 text-center">
                                    <Link
                                        href={`/dashboard/projects?${user.student
                                            ? `leadId=${user.student.id}`
                                            : user.teacher
                                                ? `mentorId=${user.teacher.id}`
                                                : ""
                                            }`}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        See all projects
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
