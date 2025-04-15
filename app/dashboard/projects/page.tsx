'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';

type User = {
  username: string;
  email: string;
  avatarUrl: string | null;
};

type Lead = {
  id: string;
  user: User;
};

type Mentor = {
  id: string;
  user: User;
} | null;

type TeamMember = {
  id: string;
  role: string;
  student: {
    id: string;
    user: User;
  };
};

type Team = {
  id: string;
  members: TeamMember[];
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
};

type Project = {
  id: string;
  title: string;
  description: string;
  type?: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  lead: Lead;
  mentor: Mentor;
  team: Team;
  researchPapers: ResearchPaper[];
  media: Media[];
};

export default function DashboardProjectsPage() {
  const searchParams = useSearchParams();
  
  // Get status filter from URL
  const statusFilter = searchParams.get('status') || 'all';
  const searchTerm = searchParams.get('search') || '';
  const filterType = searchParams.get('filterType') || 'project';
  
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);

  // Fetch projects using React Query
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['projects', statusFilter],
    queryFn: async () => {
      const response = await fetch(`/api/projects?status=${statusFilter}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      return response.json();
    },
    staleTime: Infinity, // Data stays fresh for 5 minutes
    gcTime: Infinity, // Cache persists for 10 minutes
  });

  // Filter projects based on search params
  useEffect(() => {
    if (projects.length === 0) {
      setFilteredProjects([]);
      return;
    }

    if (searchTerm) {
      const filtered = filterProjectsBySearchTerm(projects, searchTerm, filterType);
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchTerm, filterType, projects]);

  // Helper function to filter projects based on search term
  const filterProjectsBySearchTerm = (projectsToFilter: Project[], term: string, type: string) => {
    const searchTermLower = term.toLowerCase();
    
    switch (type) {
      case 'project':
        return projectsToFilter.filter(project => 
          project.title.toLowerCase().includes(searchTermLower) ||
          project.description.toLowerCase().includes(searchTermLower)
        );
      
      case 'teacher':
        return projectsToFilter.filter(project => 
          project.mentor && 
          project.mentor.user.username.toLowerCase().includes(searchTermLower)
        );
      
      case 'leader':
        return projectsToFilter.filter(project => 
          project.lead.user.username.toLowerCase().includes(searchTermLower)
        );
        
      default:
        return projectsToFilter.filter(project => 
          project.title.toLowerCase().includes(searchTermLower)
        );
    }
  };

  const getCategoryLabel = (type: string | undefined) => {
    if (!type) return { label: 'Other', color: 'bg-gray-100 text-gray-800' };
    
    switch (type) {
      case 'CAPSTONE':
        return { label: 'Capstone', color: 'bg-blue-100 text-blue-800' };
      case 'THAPAR':
        return { label: 'Thapar', color: 'bg-indigo-100 text-indigo-800' };
      case 'RESEARCH_DEVELOPMENT':
        return { label: 'Research & Development', color: 'bg-purple-100 text-purple-800' };
      case 'INTERNATIONAL':
        return { label: 'International', color: 'bg-green-100 text-green-800' };
      default:
        return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
      case 'APPROVED':
        return { label: 'Approved', color: 'bg-green-100 text-green-800' };
      case 'ONGOING':
        return { label: 'Ongoing', color: 'bg-blue-100 text-blue-800' };
      case 'COMPLETED':
        return { label: 'Completed', color: 'bg-purple-100 text-purple-800' };
      case 'REJECTED':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Content
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && filteredProjects.length === 0) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error instanceof Error ? error.message : 'An error occurred'}</p>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-gray-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchTerm 
            ? `No projects match your search criteria. Try with different filters.`
            : statusFilter !== 'all' 
              ? `No ${statusFilter} projects found. Try a different status filter.`
              : 'Get started by creating a new project.'}
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="-ml-1 mr-2 h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-lg">
      
      <ul className="divide-y divide-gray-200">
        {filteredProjects.map((project) => {
          const category = getCategoryLabel(project.type);
          const status = getStatusLabel(project.status);
          
          return (
            <li key={project.id} className="p-4 hover:bg-gray-50">
              <Link href={`/dashboard/projects/${project.id}`} className="block">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-blue-600 truncate">{project.title}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {/* Project badges */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.color}`}>
                        {category.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      
                      {/* Show teacher/mentor badge when teacher filter is active */}
                      {(filterType === 'teacher' && project.mentor) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Teacher: {project.mentor.user.username}
                        </span>
                      )}
                      
                      {/* Show leader badge when leader filter is active */}
                      {filterType === 'leader' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Leader: {project.lead.user.username}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-5 flex-shrink-0 text-sm text-gray-500 text-right">
                    <p>Created {formatDate(project.createdAt)}</p>
                    <p className="mt-1">
                      {project.startDate ? `${formatDate(project.startDate)} - ${project.endDate ? formatDate(project.endDate) : 'Ongoing'}` : 'Not started'}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{project.description}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
} 