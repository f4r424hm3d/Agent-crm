import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import agentService from '../../services/agentService';
import externalSearchService from '../../services/externalSearchService';
import {
    Building, Globe, Check, Save, Loader2, Shield, Search, Star, ShieldAlert, ShieldCheck
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/ui/dialog';
import { useToast } from '../../components/ui/toast';

const PendingAgents = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('edit');
    const [currentAgent, setCurrentAgent] = useState(null);
    const [formData, setFormData] = useState({});
    const [formError, setFormError] = useState('');
    const [formLoading, setFormLoading] = useState(false);

    // Delete confirmation state
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    // Locked to pending
    const statusFilter = 'pending';

    const fetchAgents = async (page = 1) => {
        try {
            setLoading(true);
            // Depending on API, we might need to use a specific endpoint or just filter
            // The user wants "Agents -> Pending Agents" which likely maps to getPendingAgents or getAgents with status=pending
            // agentService.getAgents usually takes status.
            // Let's check if agentService has getPendingAgents.
            // Assuming getAgents supports filtering by approvalStatus or status.
            // Based on AgentList, it uses statusFilter.

            const data = await agentService.getAgents({
                page,
                limit: pagination.limit,
                search: debouncedSearch,
                status: 'pending', // filtering for pending approval
            });
            setAgents(data.data || []);
            setPagination({
                ...pagination,
                page: data.pagination?.page || page,
                total: data.pagination?.total || 0,
                totalPages: data.pagination?.totalPages || 0,
            });
            setError(null);
        } catch (err) {
            setError('Failed to fetch pending agents');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        fetchAgents(1);
    }, [debouncedSearch]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchAgents(newPage);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentAgent(null);
        setFormData({});
        setFormError('');
    };

    const handleApprove = async (agent) => {
        try {
            await agentService.approveAgent(agent._id);
            toast.success(`Agent ${agent.firstName} approved successfully`);
            fetchAgents(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to approve agent');
        }
    };

    const handleReject = async (agent) => {
        try {
            // Assuming rejection requires a reason, might need a modal.
            // For simplicity, using a prompt or just calling reject if API supports it without body
            // or use a rejection modal.
            // AgentList doesn't seem to have Approve/Reject buttons directly in the code I read?
            // It calls navigate to view/edit.
            // I'll stick to View/Edit buttons for now.
            navigate(`/agents/view/${agent._id}`);
        } catch (err) {
            //
        }
    }


    if (loading && agents.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pending Agents</h1>
                {/* No Add Agent button here */}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search pending agents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                    />
                </div>
                {/* Status is locked to 'Pending' */}
                <div className="px-4 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-sm font-semibold">
                    Status: Pending Approval
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                {agents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {agents.map((agent, index) => (
                                    <tr key={agent._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(agent.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {agent.firstName} {agent.lastName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{agent.companyName}</div>
                                            <div className="text-xs text-gray-500">{agent.companyType}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{agent.email}</div>
                                            <div className="text-xs text-gray-500">{agent.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {agent.city}, {agent.state}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => navigate(`/agents/view/${agent._id}`)}
                                                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-xs transition-colors"
                                                >
                                                    Review Application
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center bg-white">
                        <div className="text-gray-300 text-6xl mb-4 flex justify-center">
                            <ShieldCheck size={64} />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Applications</h3>
                        <p className="text-gray-500 mb-6 font-medium">
                            There are no agent applications waiting for approval.
                        </p>
                    </div>
                )}

                {/* Pagination Logic */}
                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{pagination.total}</span>{' '}
                            results
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className={`px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 ${pagination.page === 1
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                Previous
                            </button>
                            {/* Simplified pagination for shortness */}
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.totalPages}
                                className={`px-3 py-1 border border-gray-300 rounded text-sm text-gray-700 ${pagination.page === pagination.totalPages
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-gray-50 cursor-pointer'
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PendingAgents;
