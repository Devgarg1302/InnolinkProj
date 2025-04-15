'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ApprovalFormData {
    status: 'APPROVED' | 'REJECTED';
    comment: string;
}

interface ProjectApprovalProps {
    projectId: string;
    projectStatus: string;
    isMentor: boolean;
}

export default function ProjectApproval({ projectId, projectStatus, isMentor }: ProjectApprovalProps) {
    const [showApprovalModal, setShowApprovalModal] = useState(false);
    const [approvalFormData, setApprovalFormData] = useState<ApprovalFormData>({
        status: 'APPROVED',
        comment: ''
    });
    const [loading, setLoading] = useState(false);

    const handleProjectApproval = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`/api/projects/${projectId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(approvalFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process project approval');
            }

            setShowApprovalModal(false);
            setApprovalFormData({ status: 'APPROVED', comment: '' });
            
            toast.success(
                `Project ${approvalFormData.status.toLowerCase()} successfully!`
            );
            window.location.reload();
        } catch (err) {
            toast.error('Failed to process project approval');
        } finally {
            setLoading(false);
        }
    };

    if (projectStatus !== 'PENDING' || !isMentor) return null;

    return (
        <>
            <div className="flex space-x-3 mt-4">
                <button
                    onClick={() => {
                        setApprovalFormData({ status: 'APPROVED', comment: '' });
                        setShowApprovalModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Approve Project
                </button>
                <button
                    onClick={() => {
                        setApprovalFormData({ status: 'REJECTED', comment: '' });
                        setShowApprovalModal(true);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    Reject Project
                </button>
            </div>

            {showApprovalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">
                            {approvalFormData.status === 'APPROVED' ? 'Approve' : 'Reject'} Project
                        </h3>
                        <form onSubmit={handleProjectApproval}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Comment
                                </label>
                                <textarea
                                    value={approvalFormData.comment}
                                    onChange={(e) => setApprovalFormData(prev => ({
                                        ...prev,
                                        comment: e.target.value
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    placeholder={`Enter your ${approvalFormData.status.toLowerCase()} comment...`}
                                />
                            </div>
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowApprovalModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                        approvalFormData.status === 'APPROVED'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                >
                                    {loading ? 'Processing...' : approvalFormData.status}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
} 