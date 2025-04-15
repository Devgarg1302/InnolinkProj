'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const teacherProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  bio: z.string().optional(),
  department: z.string().min(2, 'Department must be at least 2 characters'),
  designation: z.string().min(2, 'Designation must be at least 2 characters'),
  skills: z.array(z.string()).optional().default([]),
  experiences: z
    .array(
      z.object({
        position: z.string().min(2, 'Position must be at least 2 characters'),
        company: z.string().min(2, 'Company must be at least 2 characters'),
        location: z.string().optional(),
    startDate: z.string(),
        endDate: z.string().optional().nullable(),
    description: z.string().optional(),
        current: z.boolean().optional().default(false),
      })
    )
    .optional()
    .default([]),
  certifications: z
    .array(
      z.object({
        title: z.string().min(2, 'Title must be at least 2 characters'),
        issuer: z.string().min(2, 'Issuer must be at least 2 characters'),
    issueDate: z.string(),
        expiryDate: z.string().optional().nullable(),
    credentialId: z.string().optional(),
        credentialUrl: z.string().optional().nullable(),
      })
    )
    .optional()
    .default([]),
});

type TeacherProfileForm = z.infer<typeof teacherProfileSchema>;

export default function TeacherProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ title: string; description: string; variant?: 'destructive' } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<TeacherProfileForm>({
    resolver: zodResolver(teacherProfileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        
        Object.entries(data).forEach(([key, value]) => {
          const fieldKey = key as keyof TeacherProfileForm;
          
          // Type check and correct assignment based on field type
          if (fieldKey === 'skills' && Array.isArray(value)) {
            setValue(fieldKey, value as string[]);
          } else if (fieldKey === 'experiences' && Array.isArray(value)) {
            setValue(fieldKey, value);
          } else if (fieldKey === 'certifications' && Array.isArray(value)) {
            setValue(fieldKey, value);
          } else if (fieldKey === 'name' && typeof value === 'string') {
            setValue(fieldKey, value);
          } else if (fieldKey === 'email' && typeof value === 'string') {
            setValue(fieldKey, value);
          } else if (fieldKey === 'bio' && (typeof value === 'string' || value === null)) {
            setValue(fieldKey, value === null ? undefined : value);
          } else if (fieldKey === 'department' && typeof value === 'string') {
            setValue(fieldKey, value);
          } else if (fieldKey === 'designation' && typeof value === 'string') {
            setValue(fieldKey, value);
          }
        });
      } catch (error) {
        setToast({
          title: 'Error',
          description: 'Failed to load profile data' + (error instanceof Error ? error.message : ''),
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [setValue]);

  const onSubmit = async (data: TeacherProfileForm) => {
    try {
    console.log(data);
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      setToast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
      setIsEditing(false);
    } catch (error) {
      setToast({
        title: 'Error',
        description: 'Failed to update profile' + (error instanceof Error ? error.message : ''),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-6xl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-xl z-50 transition-all duration-300 transform ${
          toast.variant === 'destructive' ? 'bg-red-100 text-red-800 border-l-4 border-red-500' : 'bg-green-100 text-green-800 border-l-4 border-green-500'
        }`}>
          <div className="flex items-center">
            <div className={`flex-shrink-0 mr-3 ${toast.variant === 'destructive' ? 'text-red-500' : 'text-green-500'}`}>
              {toast.variant === 'destructive' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <h4 className="font-semibold">{toast.title}</h4>
              <p className="text-sm">{toast.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Teacher Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              isEditing 
                ? 'bg-white text-indigo-600 hover:bg-gray-100' 
                : 'bg-indigo-500 text-white hover:bg-indigo-400 border border-white'
            }`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-5 bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Personal Information</h3>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                    id="name"
                    {...register('name')}
                    disabled={!isEditing}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18.664a1 1 0 01-1-1v-5.426l3.16 1.356a1 1 0 00.787 0l7-3A1 1 0 0016 9.74c0 1.836-2.165 3.414-4.648 4.09C9.958 14.423 8 16.07 8 18.664a1 1 0 01-2 0z" />
                      </svg>
                    </div>
                    <input
                    id="department"
                    {...register('department')}
                    disabled={!isEditing}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  </div>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-500">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="designation" className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.504 1.132a1 1 0 01.992 0l1.75 1a1 1 0 11-.992 1.736L10 3.152l-1.254.716a1 1 0 11-.992-1.736l1.75-1zM5.618 4.504a1 1 0 01-.372 1.364L5.016 6l.23.132a1 1 0 11-.992 1.736L4 7.723V8a1 1 0 01-2 0V6a.996.996 0 01.52-.878l1.734-.99a1 1 0 011.364.372zm8.764 0a1 1 0 011.364-.372l1.733.99A1.002 1.002 0 0118 6v2a1 1 0 11-2 0v-.277l-.254.145a1 1 0 11-.992-1.736l.23-.132-.23-.132a1 1 0 01-.372-1.364zm-7 4a1 1 0 011.364-.372L10 8.848l1.254-.716a1 1 0 11.992 1.736L11 10.58V12a1 1 0 11-2 0v-1.42l-1.246-.712a1 1 0 01-.372-1.364zM3 11a1 1 0 011 1v1.42l1.246.712a1 1 0 11-.992 1.736l-1.75-1A1 1 0 012 14v-2a1 1 0 011-1zm14 0a1 1 0 011 1v2a1 1 0 01-.504.868l-1.75 1a1 1 0 11-.992-1.736L16 13.42V12a1 1 0 011-1zm-9.618 5.504a1 1 0 011.364-.372l.254.145V16a1 1 0 112 0v.277l.254-.145a1 1 0 11.992 1.736l-1.735.992a.995.995 0 01-1.022 0l-1.735-.992a1 1 0 01-.372-1.364z" />
                      </svg>
                    </div>
                    <input
                    id="designation"
                    {...register('designation')}
                    disabled={!isEditing}
                      className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  </div>
                  {errors.designation && (
                    <p className="mt-1 text-sm text-red-500">{errors.designation.message}</p>
                  )}
                </div>
              </div>

              {/* Bio and Skills */}
              <div className="space-y-5 bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Bio & Skills</h3>
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    {...register('bio')}
                    disabled={!isEditing}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder={isEditing ? "Write a short bio about yourself..." : ""}
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills
                  </label>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2 min-h-[40px] bg-white p-2 rounded-md border border-gray-200">
                      {watch('skills')?.map((skill, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 shadow-sm"
                        >
                          {skill}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const currentSkills = watch('skills') || [];
                                setValue('skills', currentSkills.filter((_, i) => i !== index));
                              }}
                              className="ml-2 text-indigo-600 hover:text-indigo-800"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="newSkill"
                            placeholder="Add a skill"
                            className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                e.preventDefault();
                                const currentSkills = watch('skills') || [];
                                setValue('skills', [e.currentTarget.value.trim(), ...currentSkills]);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('newSkill') as HTMLInputElement;
                            if (input.value.trim()) {
                              const currentSkills = watch('skills') || [];
                              setValue('skills', [input.value.trim(), ...currentSkills]);
                              input.value = '';
                            }
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.skills && (
                    <p className="mt-1 text-sm text-red-500">{errors.skills.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Experiences Section */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentExperiences = watch('experiences') || [];
                      setValue('experiences', [
                        {
                          position: '',
                          company: '',
                          location: '',
                          startDate: '',
                          endDate: null,
                          description: '',
                          current: false,
                        },
                        ...currentExperiences,
                      ]);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Experience
                  </button>
                )}
              </div>

              {watch('experiences')?.length === 0 ? (
                <div className="text-center py-8 bg-gray-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No work experience added yet</p>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue('experiences', [
                          {
                            position: '',
                            company: '',
                            location: '',
                            startDate: '',
                            endDate: null,
                            description: '',
                            current: false,
                          },
                        ]);
                      }}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Your First Experience
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {watch('experiences')?.map((experience, index) => (
                    <div key={index} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm relative">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentExperiences = watch('experiences') || [];
                            setValue(
                              'experiences',
                              currentExperiences.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                          <label htmlFor={`experiences.${index}.position`} className="block text-sm font-medium text-gray-700 mb-1">
                            Job Title
                          </label>
                          <input
                            id={`experiences.${index}.position`}
                      {...register(`experiences.${index}.position`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                          <label htmlFor={`experiences.${index}.company`} className="block text-sm font-medium text-gray-700 mb-1">
                            Company
                          </label>
                          <input
                            id={`experiences.${index}.company`}
                      {...register(`experiences.${index}.company`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div>
                          <label htmlFor={`experiences.${index}.location`} className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                          </label>
                          <input
                            id={`experiences.${index}.location`}
                            {...register(`experiences.${index}.location`)}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor={`experiences.${index}.current`} className="block text-sm font-medium text-gray-700">
                              Current Position
                            </label>
                            <div className="flex items-center">
                              <input
                                id={`experiences.${index}.current`}
                                type="checkbox"
                                {...register(`experiences.${index}.current`)}
                                disabled={!isEditing}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                  <div>
                              <label htmlFor={`experiences.${index}.startDate`} className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                              </label>
                              <input
                                id={`experiences.${index}.startDate`}
                      type="date"
                      {...register(`experiences.${index}.startDate`)}
                      disabled={!isEditing}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <div>
                              <label htmlFor={`experiences.${index}.endDate`} className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                id={`experiences.${index}.endDate`}
                      type="date"
                      {...register(`experiences.${index}.endDate`)}
                                disabled={!isEditing || watch(`experiences.${index}.current`)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <label htmlFor={`experiences.${index}.description`} className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id={`experiences.${index}.description`}
                      {...register(`experiences.${index}.description`)}
                      disabled={!isEditing}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                          placeholder={isEditing ? "Describe your role and responsibilities..." : ""}
                    />
                  </div>
                </div>
              ))}
            </div>
              )}
            </div>

            {/* Certifications Section */}
            <div className="mt-8 bg-gray-50 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      const currentCertifications = watch('certifications') || [];
                      setValue('certifications', [
                        {
                          title: '',
                          issuer: '',
                          issueDate: '',
                          expiryDate: null,
                          credentialId: '',
                          credentialUrl: '',
                        },
                        ...currentCertifications,
                      ]);
                    }}
                    className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Certification
                  </button>
                )}
              </div>

              {watch('certifications')?.length === 0 ? (
                <div className="text-center py-8 bg-gray-100 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No certifications added yet</p>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setValue('certifications', [
                          {
                            title: '',
                            issuer: '',
                            issueDate: '',
                            expiryDate: null,
                            credentialId: '',
                            credentialUrl: '',
                          },
                        ]);
                      }}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Your First Certification
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {watch('certifications')?.map((certification, index) => (
                    <div key={index} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm relative">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const currentCertifications = watch('certifications') || [];
                            setValue(
                              'certifications',
                              currentCertifications.filter((_, i) => i !== index)
                            );
                          }}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                          <label htmlFor={`certifications.${index}.title`} className="block text-sm font-medium text-gray-700 mb-1">
                            Certification Name
                          </label>
                          <input
                            id={`certifications.${index}.title`}
                      {...register(`certifications.${index}.title`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                          <label htmlFor={`certifications.${index}.issuer`} className="block text-sm font-medium text-gray-700 mb-1">
                            Issuing Organization
                          </label>
                          <input
                            id={`certifications.${index}.issuer`}
                      {...register(`certifications.${index}.issuer`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                          <label htmlFor={`certifications.${index}.issueDate`} className="block text-sm font-medium text-gray-700 mb-1">
                            Issue Date
                          </label>
                          <input
                            id={`certifications.${index}.issueDate`}
                      type="date"
                      {...register(`certifications.${index}.issueDate`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                          <label htmlFor={`certifications.${index}.expiryDate`} className="block text-sm font-medium text-gray-700 mb-1">
                            Expiration Date (Optional)
                          </label>
                          <input
                            id={`certifications.${index}.expiryDate`}
                      type="date"
                      {...register(`certifications.${index}.expiryDate`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                          <label htmlFor={`certifications.${index}.credentialId`} className="block text-sm font-medium text-gray-700 mb-1">
                            Credential ID
                          </label>
                          <input
                            id={`certifications.${index}.credentialId`}
                      {...register(`certifications.${index}.credentialId`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  <div>
                          <label htmlFor={`certifications.${index}.credentialUrl`} className="block text-sm font-medium text-gray-700 mb-1">
                            Credential URL
                          </label>
                          <input
                            id={`certifications.${index}.credentialUrl`}
                            type="url"
                      {...register(`certifications.${index}.credentialUrl`)}
                      disabled={!isEditing}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Submission */}
            {isEditing && (
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      name: '',
                      email: '',
                      bio: '',
                      department: '',
                      designation: '',
                      skills: [],
                      experiences: [],
                      certifications: [],
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 text-red-500 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  DELETE ALL
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                >
                {isSubmitting ? (
                  <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 