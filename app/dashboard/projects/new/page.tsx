'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { debounce } from 'lodash';

interface User {
    id: string;
    username: string;
    email: string;
    rollNumber?: string;
    designation?: string;
}

export default function CreateProjectPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'STUDENT' | 'TEACHER' | null>(null);

    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'CAPSTONE',
        githubLink: '',
        startDate: '',
        endDate: '',
        teamLeadId: '',
        mentorId: '',
    });

    useEffect(() => {
        // Set user role from session
        if (session?.user?.role) {
            setUserRole(session.user.role as 'STUDENT' | 'TEACHER');

            // If user is a student, they are automatically the team lead
            if (session.user.role === 'STUDENT') {
                // Fetch the student ID from API
                const fetchStudentId = async () => {
                    try {
                        const response = await fetch('/api/me');
                        if (response.ok) {
                            const userData = await response.json();
                            if (userData.student?.id) {
                                setFormData(prev => ({
                                    ...prev,
                                    teamLeadId: userData.student.id
                                }));
                            }
                        }
                    } catch (error) {
                        console.error('Failed to fetch user data', error);
                    }
                };

                fetchStudentId();
            }
        }
    }, [session]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            setFormData({
                ...formData,
                [name]: (e.target as HTMLInputElement).checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // Debounced search function
    const debouncedSearch = debounce(async (query: string, searchType: 'student' | 'teacher') => {
        if (query.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        try {
            // In a real implementation, this would be an API call
            // For example: `/api/search/${searchType}?query=${query}`
            const response = await fetch(`/api/search/${searchType}?query=${query}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (err) {
            console.error('Search error:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, 300);

    const handleSearch = (query: string, searchType: 'student' | 'teacher') => {
        setSearchQuery(query);
        debouncedSearch(query, searchType);
    };

    const selectUser = (user: User, role: 'teamLead' | 'mentor') => {
        console.log('Selected user:', user);
        
        if (role === 'teamLead') {
            setFormData(prevData => {
                const updatedData = {
                    ...prevData,
                    teamLeadId: user.id
                };
                console.log('Updated formData (teamLead):', updatedData);
                return updatedData;
            });
        } else {
            setFormData(prevData => {
                const updatedData = {
                    ...prevData,
                    mentorId: user.id
                };
                console.log('Updated formData (mentor):', updatedData);
                return updatedData;
            });
        }

        setSearchResults([]);
        setSearchQuery('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Submitting form data:', formData); // Log form data before submission
        setLoading(true);
        setError(null);

        // Validate required fields based on role
        if (userRole === 'TEACHER' && !formData.teamLeadId) {
            setError('You must select a team lead for the project');
            setLoading(false);
            return;
        }

        // For students, mentorId is required
        if (userRole === 'STUDENT' && !formData.mentorId) {
            setError('You must select a mentor for the project');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create project');
            }

            const project = await response.json();
            console.log('Project created:', project);

            // Show success message
            alert('Project created successfully! Notifications have been sent to all relevant parties.');

            // Redirect to the project details page
            router.push('/dashboard/projects');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error creating project:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <Link href="/dashboard/projects" className="text-blue-600 hover:text-blue-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Projects
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h1>

                {error && (
                    <div className="bg-red-50 p-4 rounded-md mb-6 border-l-4 border-red-400">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Project Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-800">
                            Project Title*
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                placeholder="Enter project title"
                            />
                        </div>
                    </div>

                    {/* Project Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-800">
                            Project Description*
                        </label>
                        <div className="mt-1">
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={5}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                placeholder="Describe your project in detail"
                            />
                        </div>
                    </div>

                    {/* Project Type */}
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-800">
                            Project Type*
                        </label>
                        <div className="mt-1">
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                            >
                                <option value="CAPSTONE">Capstone</option>
                                <option value="THAPAR">Thapar</option>
                                <option value="R_D">Research & Development</option>
                                <option value="INTERNATIONAL">International</option>
                                <option value="RESEARCH">Research</option>
                            </select>
                        </div>
                    </div>

                    {/* GitHub Link */}
                    <div>
                        <label htmlFor="githubLink" className="block text-sm font-medium text-gray-800">
                            GitHub Repository URL (Optional)
                        </label>
                        <div className="mt-1">
                            <input
                                type="url"
                                id="githubLink"
                                name="githubLink"
                                value={formData.githubLink}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                placeholder="https://github.com/username/repository"
                            />
                        </div>
                    </div>

                    {/* Project Dates */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-800">
                                Start Date
                            </label>
                            <div className="mt-1">
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-800">
                                Expected End Date
                            </label>
                            <div className="mt-1">
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Team Lead Selection (For TEACHER users) */}
                    {userRole === 'TEACHER' && (
                        <div>
                            <label htmlFor="teamLeadSearch" className="block text-sm font-medium text-gray-800">
                                Team Lead (Student)*
                            </label>
                            <div className="mt-1 relative">
                                <div className="flex">
                                    <div className="flex-shrink-0 z-10">
                                        <div className="h-10 w-10 rounded-l-md border-y border-l border-gray-300 bg-gray-50 flex items-center justify-center">
                                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        id="teamLeadSearch"
                                        placeholder="Search by roll number or name"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value, 'student')}
                                        className="block w-full rounded-r-md border-y border-r border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                    />
                                </div>

                                {/* Selected Team Lead */}
                                {formData.teamLeadId && (
                                    <div className="mt-2 flex items-center bg-blue-50 p-2 rounded-md">
                                        <div className="bg-blue-100 rounded-full p-1 mr-2">
                                            <svg className="h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-blue-800">Team Lead Selected</span>
                                        <button
                                            type="button"
                                            className="ml-auto text-blue-700 hover:text-blue-900"
                                            onClick={() => setFormData({ ...formData, teamLeadId: '' })}
                                        >
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* Search Results */}
                                {searchResults.length > 0 && !formData.teamLeadId && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
                                        <ul className="py-1">
                                            {searchResults.map((student) => (
                                                <li
                                                    key={student.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                    onClick={() => selectUser(student, 'teamLead')}
                                                >
                                                    <div className="bg-gray-200 rounded-full p-1 mr-2">
                                                        <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{student.username}</p>
                                                        <p className="text-xs text-gray-600">
                                                            {student.rollNumber && `Roll: ${student.rollNumber}`}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {searchQuery && isSearching && (
                                    <p className="mt-2 text-sm text-gray-600">Searching...</p>
                                )}

                                {searchQuery && !isSearching && searchResults.length === 0 && (
                                    <p className="mt-2 text-sm text-gray-600">No students found.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Mentor Selection (For STUDENT users) */}
                    {userRole === 'STUDENT' && (
                        <div>
                            <label htmlFor="mentorSearch" className="block text-sm font-medium text-gray-800">
                                Mentor (Teacher)*
                            </label>
                            <div className="mt-1 relative">
                                <div className="flex">
                                    <div className="flex-shrink-0 z-10">
                                        <div className="h-10 w-10 rounded-l-md border-y border-l border-gray-300 bg-gray-50 flex items-center justify-center">
                                            <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        id="mentorSearch"
                                        placeholder="Search by name or department"
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value, 'teacher')}
                                        className="block w-full rounded-r-md border-y border-r border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                                    />
                                </div>

                                {/* Selected Mentor */}
                                {formData.mentorId && (
                                    <div className="mt-2 flex items-center bg-green-50 p-2 rounded-md">
                                        <div className="bg-green-100 rounded-full p-1 mr-2">
                                            <svg className="h-5 w-5 text-green-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm text-green-800">Mentor Selected</span>
                                        <button
                                            type="button"
                                            className="ml-auto text-green-700 hover:text-green-900"
                                            onClick={() => setFormData({ ...formData, mentorId: '' })}
                                        >
                                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                {/* Search Results */}
                                {searchResults.length > 0 && !formData.mentorId && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
                                        <ul className="py-1">
                                            {searchResults.map((teacher) => (
                                                <li
                                                    key={teacher.id}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                                                    onClick={() => selectUser(teacher, 'mentor')}
                                                >
                                                    <div className="bg-gray-200 rounded-full p-1 mr-2">
                                                        <svg className="h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-800">{teacher.username}</p>
                                                        <p className="text-xs text-gray-600">
                                                            {teacher.designation && `${teacher.designation}`}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {searchQuery && isSearching && (
                                    <p className="mt-2 text-sm text-gray-600">Searching...</p>
                                )}

                                {searchQuery && !isSearching && searchResults.length === 0 && (
                                    <p className="mt-2 text-sm text-gray-600">No teachers found.</p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-6">
                        <Link
                            href="/dashboard/projects"
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 