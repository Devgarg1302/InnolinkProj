import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authoptions } from "@/app/lib/auth";
import { prisma } from "@/lib/prisma";
import ProjectEditForm from "../ProjectEditForm";
import BackButton from "../../../profile/[id]/BackButton"

export default async function EditProjectPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await getServerSession(authoptions);
    if (!session?.user) {
        return notFound();
    }

    // Get user with their role details
    const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
        include: {
            teacher: true,
            student: true,
        },
    });

    if (!user) {
        return notFound();
    }

    // Get the project with all its details
    const project = await prisma.project.findUnique({
        where: { id: params.id },
        include: {
            lead: {
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true,
                        },
                    },
                },
            },
            mentor: {
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true,
                        },
                    },
                },
            },
            researchPapers: true,
            media: true,
        },
    });

    if (!project) {
        return notFound();
    }

    // Check if user is authorized to edit the project (mentor or lead)
    const isMentor = project.mentorId === user.teacher?.id;
    const isTeamLead = project.leadId === user.student?.id;
    const isProjectApproved = project.status === "APPROVED";

    if (!isMentor && !isTeamLead || !isProjectApproved) {
        return redirect(`/dashboard/projects/${params.id}`);
    }

    // Format dates for client component
    const formattedProject = {
        ...project,
        startDate: project.startDate ? project.startDate.toISOString() : null,
        endDate: project.endDate ? project.endDate.toISOString() : null,
        researchPapers: project.researchPapers.map(paper => ({
            ...paper,
            publishedAt: paper.publishedAt ? paper.publishedAt.toISOString() : null
        }))
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <BackButton />
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    Edit Project: {project.title}
                </h1>

                <ProjectEditForm project={formattedProject} />
            </div>
        </div>
    );
} 