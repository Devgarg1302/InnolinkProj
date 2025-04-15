'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Current filter states
    const statusFilter = searchParams.get('status') || 'all';
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [filterType, setFilterType] = useState(searchParams.get('filterType') || 'project');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Apply filters and search
    const applyFilters = () => {
        const params = new URLSearchParams(searchParams);

        if (searchTerm) {
            params.set('search', searchTerm);
            params.set('filterType', filterType);
        } else {
            params.delete('search');
            params.delete('filterType');
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    // Handler for filter changes
    const handleFilterChange = (status: string) => {
        const params = new URLSearchParams(searchParams);

        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }

        // Preserve existing search and filterType
        if (searchTerm) {
            params.set('search', searchTerm);
            params.set('filterType', filterType);
        }

        router.push(`${pathname}?${params.toString()}`);
    };

    // Reset filters
    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('project');
        router.push(pathname);
    };

    // Update search term from URL on initial load
    useEffect(() => {
        const urlSearchTerm = searchParams.get('search');
        const urlFilterType = searchParams.get('filterType');

        if (urlSearchTerm) {
            setSearchTerm(urlSearchTerm);
        }

        if (urlFilterType) {
            setFilterType(urlFilterType);
        }
    }, [searchParams]);

    // Fetch suggestions based on search term and filter type
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!searchTerm || searchTerm.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                const response = await fetch(`/api/projects/suggestions?term=${encodeURIComponent(searchTerm)}&type=${filterType}`);
                if (!response.ok) throw new Error('Failed to fetch suggestions');

                const data = await response.json();
                setSuggestions(data);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, filterType]);

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion: string) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Handle input focus/blur
    const handleInputFocus = () => {
        if (suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleInputBlur = () => {
        // Delay hiding suggestions to allow click events to fire
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    return (
        <div className="container text-black mx-auto px-4 py-6">
            {/* Header and Actions */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage all your projects from one place
                    </p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link
                        href="/dashboard/projects/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Create New Project
                    </Link>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Filter Type Selector */}
                        <div className="w-full md:w-1/4">
                            <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
                                Filter By
                            </label>
                            <select
                                id="filterType"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="project">Project Name</option>
                                <option value="teacher">Teacher Name</option>
                                <option value="leader">Team Leader</option>
                            </select>
                        </div>

                        {/* Search Input */}
                        <div className="w-full md:w-2/4">
                            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="search"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    placeholder={`Search by ${filterType === 'project' ? 'project name' : filterType === 'teacher' ? 'teacher name' : 'team leader name'}`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={handleInputFocus}
                                    onBlur={handleInputBlur}
                                />
                                {searchTerm && (
                                    <button
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() => {
                                            setSearchTerm('');
                                            setSuggestions([]);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                {/* Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-10  w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60  overflow-auto">
                                        {suggestions.map((suggestion, index) => (
                                            <button
                                                key={index}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="w-full md:w-1/4 flex items-end gap-2">
                            <button
                                className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={applyFilters}
                            >
                                Apply Filters
                            </button>
                            <button
                                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm || statusFilter !== 'all') && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {statusFilter !== 'all' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                                    <button
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                        onClick={() => handleFilterChange('all')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            )}
                            {searchTerm && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {filterType === 'project' ? 'Project' : filterType === 'teacher' ? 'Teacher' : 'Leader'}: {searchTerm}
                                    <button
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Project Tabs */}
            <div className="bg-white relative z-0 rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex overflow-x-auto">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                                statusFilter === 'all'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            All Projects
                        </button>
                        <button
                            onClick={() => handleFilterChange('my')}
                            className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                                statusFilter === 'my'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            My Projects
                        </button>
                    </nav>
                </div>
            </div>

            {/* Project List - Child Content */}
            {children}
        </div>
    );
}