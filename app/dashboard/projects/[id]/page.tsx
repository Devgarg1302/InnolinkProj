import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authoptions } from "@/app/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProjectStatus, type Project } from "@prisma/client"
import Link from "next/link"
import ProjectApproval from "./ProjectApproval"
import DeleteButton from "./DeleteButton"
import ManageTeam from "./ManageTeam"
import BackButton from "../../profile/[id]/BackButton"

type User = {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
};

type Lead = {
    id: string;
    user: User;
};

type Student = {
    id: string;
    user: User;
};

type TeamMember = {
    id: string;
    role: string;
    student: Student;
    joinedAt: Date;
    leftAt: Date | null;
};

type Team = {
    id: string;
    members: TeamMember[];
} | null;

type Mentor = {
    id: string;
    user: User;
} | null;

type ResearchPaper = {
    id: string;
    title: string;
    url: string;
};

type Media = {
    id: string;
    url: string;
    type: string;
    description: string | null;
};

type ProjectWithRelations = Project & {
    lead: Lead;
    mentor: Mentor;
    team: Team;
    researchPapers: ResearchPaper[];
    media: Media[];
};



export default async function ProjectDetailsPage({
    params,
}: {
    params: { id: string }
}) {
    const session = await getServerSession(authoptions)
    if (!session?.user) {
        return notFound()
    }

    // Get user with teacher details
    const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
        include: {
            teacher: true,
            student: true
        }
    });

    if (!user) {
        return notFound();
    }

    const prismaid = await params.id;
    const project = await prisma.project.findUnique({
        where: { id: prismaid },
        include: {
            lead: {
                include: {
                    user: {
                        select: {
                            id: true,
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
                            id: true,
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
                                            id: true,
                                            username: true,
                                            email: true,
                                            avatarUrl: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
            },
            researchPapers: true,
            media: true,
        },
    }) as ProjectWithRelations | null

    if (!project) {
        return notFound()
    }

    // Helper function to format date
    const formatDate = (dateString: Date | null) => {
        if (!dateString) return "Not set";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Helper function to get status badge color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED':
                return 'bg-green-100 text-green-800';
            case 'ONGOING':
                return 'bg-blue-100 text-blue-800';
            case 'COMPLETED':
                return 'bg-purple-100 text-purple-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Check if user can manage the project (is project lead or mentor)
    const isProjectLead = user.student?.id === project.leadId;
    const isProjectMentor = user.teacher?.id === project.mentorId;
    const isProjectApproved = project.status === ProjectStatus.APPROVED;
    // const canManageProject = (isProjectLead || isProjectMentor) && isProjectApproved;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 flex justify-between items-center">
                <BackButton />

                {/* Management buttons */}
                {(isProjectLead || isProjectMentor) && (
                    <div className="flex space-x-2">
                        {isProjectApproved ? (
                            <>
                                <Link
                                    href={`/dashboard/projects/${project.id}/edit`}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none text-sm"
                                >
                                    Edit Project
                                </Link>
                                <DeleteButton projectId={project.id} />
                            </>
                        ) : (
                            <div className="text-sm text-amber-600 italic">
                                Project must be approved to edit or delete
                            </div>
                        )}
                    </div>
                )}
            </div>
            <div className="space-y-6">
                {/* Project Overview */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                                <p className="mt-1 text-sm text-gray-500">Project Overview</p>
                            </div>
                            <div className="mt-2 md:mt-0 flex space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                    {project.status}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Description</h3>
                                <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Timeline</h3>
                                <div className="mt-1 text-sm text-gray-600">
                                    <p>Start Date: {formatDate(project.startDate)}</p>
                                    {project.endDate && (
                                        <p>End Date: {formatDate(project.endDate)}</p>
                                    )}
                                </div>
                            </div>

                            {project.githubLink && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-900">GitHub Repository</h3>
                                    <a
                                        href={project.githubLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 text-sm text-blue-600 hover:underline"
                                    >
                                        {project.githubLink}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Team Information */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                        <p className="mt-1 text-sm text-gray-500">Project Team</p>

                        <div className="mt-4 space-y-3">
                            {/* Project Leader
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                {project.lead.user.id ? (
                                    <Link href={`/dashboard/profile/${project.lead.user.id}`} className="hover:underline">
                                        <div>
                                            <p className="font-medium text-gray-900">{project.lead.user.username}</p>
                                            <p className="text-sm text-gray-500">
                                                {project.lead.user.email}
                                            </p>
                                        </div>
                                    </Link>
                                ) : (
                                    <div>
                                        <p className="font-medium text-gray-900">{project.lead.user.username}</p>
                                        <p className="text-sm text-gray-500">
                                            {project.lead.user.email}
                                        </p>
                                    </div>
                                )}
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Project Leader
                                </span>
                            </div> */}

                            {/* Team Members */}
                            {project.team && project.team.members && project.team.members
                                .filter(member => !member.leftAt)
                                .map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    {member.student.user.id ? (
                                        <Link href={`/dashboard/profile/${member.student.user.id}`} className="hover:underline">
                                            <div>
                                                <p className="font-medium text-gray-900">{member.student.user.username}</p>
                                                <p className="text-sm text-gray-500">
                                                    {member.student.user.email}
                                                </p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div>
                                            <p className="font-medium text-gray-900">{member.student.user.username}</p>
                                            <p className="text-sm text-gray-500">
                                                {member.student.user.email}
                                            </p>
                                        </div>
                                    )}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                        {member.role}
                                    </span>
                                </div>
                            ))}

                            {/* Mentor */}
                            {project.mentor && (
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                    {project.mentor.user.id ? (
                                        <Link href={`/dashboard/profile/${project.mentor.user.id}`} className="hover:underline">
                                            <div>
                                                <p className="font-medium text-gray-900">{project.mentor.user.username}</p>
                                                <p className="text-sm text-gray-500">
                                                    {project.mentor.user.email}
                                                </p>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div>
                                            <p className="font-medium text-gray-900">{project.mentor.user.username}</p>
                                            <p className="text-sm text-gray-500">
                                                {project.mentor.user.email}
                                            </p>
                                        </div>
                                    )}
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        Project Mentor
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Add Team Management Component */}
                        {(isProjectLead || isProjectMentor) && (
                            <>
                                {isProjectApproved ? (
                                    <ManageTeam
                                        projectId={project.id}
                                        currentTeam={project.team?.members || []}
                                        canManage={true}
                                    />
                                ) : (
                                    <div className="mt-4 text-sm text-amber-600 italic">
                                        Project must be approved to manage team members
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Research Papers */}
                {project.researchPapers && project.researchPapers.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900">Research Papers</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Published research papers related to this project
                            </p>

                            <div className="mt-4 space-y-3">
                                {project.researchPapers.map((paper) => (
                                    <div
                                        key={paper.id}
                                        className="p-3 border rounded-lg"
                                    >
                                        <h3 className="font-medium text-gray-900">{paper.title}</h3>
                                        <a
                                            href={paper.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
                                        >
                                            View Paper
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Project Media */}
                {project.media && project.media.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-lg font-medium text-gray-900">Project Resources</h2>
                            <p className="mt-1 text-sm text-gray-500">
                                Additional resources and materials
                            </p>

                            <div className="mt-4 space-y-3">
                                {project.media.map((resource) => (
                                    <div
                                        key={resource.id}
                                        className="p-3 border rounded-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                {resource.description && (
                                                    <p className="text-sm text-gray-500">
                                                        {resource.description}
                                                    </p>
                                                )}
                                                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {resource.type}
                                                </span>
                                            </div>
                                            <a
                                                href={resource.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                View Resource
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Project Approval Component */}
            <ProjectApproval
                projectId={project.id}
                projectStatus={project.status}
                isMentor={user.role === 'TEACHER' && project.mentorId === user.teacher?.id}
            />
        </div>
    )
}
