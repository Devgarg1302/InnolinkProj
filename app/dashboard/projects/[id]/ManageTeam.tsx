'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface Student {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface TeamMember {
  id: string;
  role: string;
  student: Student;
  joinedAt: Date;
  leftAt: Date | null;
}

interface ManageTeamProps {
  projectId: string;
  currentTeam: TeamMember[];
  canManage: boolean;
}

export default function ManageTeam({ projectId, currentTeam, canManage }: ManageTeamProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Search for students
  const searchStudents = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/students/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search students');
      }
      const data = await response.json();
      // Filter out students who are already team members
      const currentStudentIds = currentTeam
        .filter(member => !member.leftAt)
        .map(member => member.student.id);

      setSearchResults(data.filter((student: Student) =>
        !currentStudentIds.includes(student.id)
      ));
    } catch (error) {
      console.error('Error searching students:', error);
      toast.error('Failed to search students');
    } finally {
      setSearching(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      searchStudents(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Add student to team
  const addToTeam = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          role: role
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add team member');
      }

      toast.success('Team member added successfully');
      // Reset form and close modal
      setSelectedStudent(null);
      setSearchQuery('');
      setRole('MEMBER');
      setShowAddModal(false);
      // Refresh the page to show updated team
      window.location.reload();
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add team member');
    } finally {
      setLoading(false);
    }
  };

  // Remove student from team
  const removeFromTeam = async (teamMemberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/team?teamMemberId=${teamMemberId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove team member');
      }

      toast.success('Team member removed successfully');
      // Refresh the page to show updated team
      window.location.reload();
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove team member');
    } finally {
      setLoading(false);
    }
  };

  // If user can't manage team, don't show management UI
  if (!canManage) return null;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Manage Team Members</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
        >
          Add Team Member
        </button>
      </div>

      {/* Team member list with remove buttons */}
      <div className="mt-2">
        {currentTeam.filter(member => !member.leftAt).length === 0 ? (
          <p className="text-gray-500 text-sm mt-2">No team members yet. Add some to get started!</p>
        ) : (
          <div className="space-y-2 mt-2">
            {currentTeam
              .filter(member => !member.leftAt)
              .map(member => (
                <div key={member.id} className="flex items-center justify-between p-2 border rounded-lg">
                  {member.student.user.id ? (
                    <Link href={`/dashboard/profile/${member.student.user.id}`} className="hover:underline">
                      <div>
                        <p className="font-medium">{member.student.user.username}</p>
                        <p className="text-sm text-gray-500">{member.student.user.email}</p>
                      </div>
                    </Link>
                  ) : (
                    <div>
                      <p className="font-medium">{member.student.user.username}</p>
                      <p className="text-sm text-gray-500">{member.student.user.email}</p>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {member.role}
                    </span>
                    <button
                      onClick={() => removeFromTeam(member.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            }
          </div>
        )}
      </div>

      {/* Add team member modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(55, 65, 81, 0.5)' }}>
          <div className="relative flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>

              <div className="space-y-4">
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search for Student
                  </label>
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter student name or email"
                  />
                </div>

                {/* Search results */}
                {searching ? (
                  <p className="text-gray-500 text-sm">Searching...</p>
                ) : (
                  searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md">
                      {searchResults.map(student => (
                        <div
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedStudent?.id === student.id ? 'bg-blue-50' : ''
                            }`}
                        >
                          <p className="font-medium">{student.user.username}</p>
                          <p className="text-sm text-gray-500">{student.user.email}</p>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Selected student */}
                {selectedStudent && (
                  <div className="border rounded-md p-3 bg-blue-50">
                    <p className="font-medium">Selected: {selectedStudent.user.username}</p>
                    <p className="text-sm text-gray-500">{selectedStudent.user.email}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="DEVELOPER">Developer</option>
                    <option value="RESEARCHER">Researcher</option>
                    <option value="DESIGNER">Designer</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedStudent(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={addToTeam}
                  disabled={!selectedStudent || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add to Team'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 