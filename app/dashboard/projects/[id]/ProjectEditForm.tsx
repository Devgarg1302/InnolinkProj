'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ProjectType } from '@prisma/client';

// Types
interface User {
  username: string;
  email: string;
}

interface Lead {
  id: string;
  user: User;
}

interface Mentor {
  id: string;
  user: User;
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  abstract: string | null;
  url: string;
  publishedAt: string | null;
}

interface Media {
  id: string;
  title: string | null;
  type: string;
  url: string;
  description: string | null;
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  type: ProjectType | null;
  githubLink: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  lead: Lead;
  mentor: Mentor | null;
  researchPapers: ResearchPaper[];
  media: Media[];
}

export default function ProjectEditForm({ project }: { project: Project }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    githubLink: project.githubLink || '',
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    type: project.type || undefined
  });
  
  // State for research papers
  const [researchPapers, setResearchPapers] = useState<ResearchPaper[]>(
    project.researchPapers.map(paper => ({
      ...paper,
      publishedAt: paper.publishedAt ? new Date(paper.publishedAt).toISOString().split('T')[0] : null
    }))
  );
  const [papersToDelete, setPapersToDelete] = useState<string[]>([]);
  
  // State for media
  const [media, setMedia] = useState<Media[]>(project.media);
  const [mediaToDelete, setMediaToDelete] = useState<string[]>([]);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle research paper changes
  const handlePaperChange = (index: number, field: keyof ResearchPaper, value: any) => {
    const updatedPapers = [...researchPapers];
    
    if (field === 'authors' && typeof value === 'string') {
      // Convert comma-separated string to array for authors
      updatedPapers[index][field] = value.split(',').map(a => a.trim());
    } else {
      (updatedPapers[index] as any)[field] = value;
    }
    
    setResearchPapers(updatedPapers);
  };
  
  // Add a new research paper
  const addResearchPaper = () => {
    setResearchPapers([
      ...researchPapers,
      {
        id: '', // Empty string indicates a new paper
        title: '',
        authors: [],
        abstract: '',
        url: '',
        publishedAt: null
      }
    ]);
  };
  
  // Remove a research paper
  const removeResearchPaper = (index: number) => {
    const paper = researchPapers[index];
    if (paper.id) {
      // If it's an existing paper, mark for deletion
      setPapersToDelete([...papersToDelete, paper.id]);
    }
    setResearchPapers(researchPapers.filter((_, i) => i !== index));
  };
  
  // Handle media changes
  const handleMediaChange = (index: number, field: keyof Media, value: any) => {
    const updatedMedia = [...media];
    (updatedMedia[index] as any)[field] = value;
    setMedia(updatedMedia);
  };
  
  // Add a new media item
  const addMedia = () => {
    setMedia([
      ...media,
      {
        id: '', // Empty string indicates a new media item
        title: '',
        type: 'IMAGE',
        url: '',
        description: ''
      }
    ]);
  };
  
  // Remove a media item
  const removeMedia = (index: number) => {
    const item = media[index];
    if (item.id) {
      // If it's an existing media, mark for deletion
      setMediaToDelete([...mediaToDelete, item.id]);
    }
    setMedia(media.filter((_, i) => i !== index));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          researchPapers,
          media,
          papersToDelete,
          mediaToDelete
        })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update project');
      }
      
      toast.success('Project updated successfully');
      router.push(`/dashboard/projects/${project.id}`);
      router.refresh(); // Refresh the page data
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Project Information */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Basic Information</h2>
        
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          {/* Project Title */}
          <div className="sm:col-span-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Project Title *
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="title"
                id="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Project Type */}
          <div className="sm:col-span-2">
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Project Type
            </label>
            <div className="mt-1">
              <select
                id="type"
                name="type"
                value={formData.type || ''}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
                <option value="">Select Type</option>
                <option value="CAPSTONE">Capstone</option>
                <option value="THAPAR">Thapar</option>
                <option value="R_D">R&D</option>
                <option value="INTERNATIONAL">International</option>
                <option value="RESEARCH">Research</option>
              </select>
            </div>
          </div>
          
          {/* Project Description */}
          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description *
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* GitHub Link */}
          <div className="sm:col-span-6">
            <label htmlFor="githubLink" className="block text-sm font-medium text-gray-700">
              GitHub Repository Link
            </label>
            <div className="mt-1">
              <input
                type="url"
                name="githubLink"
                id="githubLink"
                value={formData.githubLink}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          {/* Project Dates */}
          <div className="sm:col-span-3">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="startDate"
                id="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="sm:col-span-3">
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="endDate"
                id="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Research Papers */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Research Papers</h2>
          <button
            type="button"
            onClick={addResearchPaper}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Paper
          </button>
        </div>
        
        {researchPapers.length === 0 ? (
          <p className="text-sm text-gray-500">No research papers added yet.</p>
        ) : (
          <div className="space-y-4">
            {researchPapers.map((paper, index) => (
              <div key={paper.id || index} className="border border-gray-200 rounded-md p-4 space-y-3">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Paper {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeResearchPaper(index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  {/* Paper Title */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-medium text-gray-700">
                      Title *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={paper.title}
                        onChange={(e) => handlePaperChange(index, 'title', e.target.value)}
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Authors */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-medium text-gray-700">
                      Authors (comma separated) *
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={paper.authors.join(', ')}
                        onChange={(e) => handlePaperChange(index, 'authors', e.target.value)}
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Abstract */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-medium text-gray-700">
                      Abstract
                    </label>
                    <div className="mt-1">
                      <textarea
                        rows={2}
                        value={paper.abstract || ''}
                        onChange={(e) => handlePaperChange(index, 'abstract', e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* URL */}
                  <div className="sm:col-span-4">
                    <label className="block text-xs font-medium text-gray-700">
                      URL *
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        value={paper.url}
                        onChange={(e) => handlePaperChange(index, 'url', e.target.value)}
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Published Date */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Published Date
                    </label>
                    <div className="mt-1">
                      <input
                        type="date"
                        value={paper.publishedAt || ''}
                        onChange={(e) => handlePaperChange(index, 'publishedAt', e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Media */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Media & Resources</h2>
          <button
            type="button"
            onClick={addMedia}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Media
          </button>
        </div>
        
        {media.length === 0 ? (
          <p className="text-sm text-gray-500">No media added yet.</p>
        ) : (
          <div className="space-y-4">
            {media.map((item, index) => (
              <div key={item.id || index} className="border border-gray-200 rounded-md p-4 space-y-3">
                <div className="flex justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Media {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-6">
                  {/* Media Title */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-gray-700">
                      Title
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleMediaChange(index, 'title', e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Media Type */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-gray-700">
                      Type *
                    </label>
                    <div className="mt-1">
                      <select
                        value={item.type}
                        onChange={(e) => handleMediaChange(index, 'type', e.target.value)}
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                        <option value="IMAGE">Image</option>
                        <option value="VIDEO">Video</option>
                        <option value="DOCUMENT">Document</option>
                        <option value="LINK">Link</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* URL */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-medium text-gray-700">
                      URL *
                    </label>
                    <div className="mt-1">
                      <input
                        type="url"
                        value={item.url}
                        onChange={(e) => handleMediaChange(index, 'url', e.target.value)}
                        required
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div className="sm:col-span-6">
                    <label className="block text-xs font-medium text-gray-700">
                      Description
                    </label>
                    <div className="mt-1">
                      <textarea
                        rows={2}
                        value={item.description || ''}
                        onChange={(e) => handleMediaChange(index, 'description', e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Submit Button */}
      <div className="flex justify-end pt-5 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading}
          className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Project'}
        </button>
      </div>
    </form>
  );
} 