import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
import { setLoading, setStudents, setError } from '../../store/slices/studentSlice';
import studentService from '../../services/studentService';
import agentService from '../../services/agentService';
import { useToast } from '../../components/ui/toast';

const StudentList = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const { user } = useSelector((state) => state.auth);
    const { students, loading, error } = useSelector((state) => state.student);

    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');
    const [linkCopied, setLinkCopied] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
    });

    // Fetch students on component mount
    useEffect(() => {
        fetchStudentsData();
    }, []);

    const fetchStudentsData = async () => {
        try {
            dispatch(setLoading(true));
            const response = await studentService.getStudents({
                page: pagination.page,
                limit: pagination.limit
            });

            dispatch(setStudents({
                students: response.data || [],
                pagination: {
                    page: response.pagination?.page || 1,
                    limit: response.pagination?.limit || 10,
                    total: response.pagination?.totalItems || 0
                }
            }));

            setPagination({
                page: response.pagination?.page || 1,
                limit: response.pagination?.limit || 10,
                totalItems: response.pagination?.totalItems || 0,
                totalPages: response.pagination?.totalPages || 0,
            });
        } catch (err) {
            console.error('Error fetching students:', err);
            dispatch(setError(err.response?.data?.message || 'Failed to fetch students'));
        }
    };


    // Filter students based on search term
    const filteredStudents = students.filter(student => {
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const fullName = `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        return (
            fullName.includes(searchLower) ||
            student.firstName?.toLowerCase().includes(searchLower) ||
            student.lastName?.toLowerCase().includes(searchLower) ||
            student.email?.toLowerCase().includes(searchLower) ||
            student.mobile?.includes(searchTerm) ||
            student.studentId?.toLowerCase().includes(searchLower)
        );
    });

    const handleShareLink = () => {
        const referralCode = user?.id || user?._id || 'ADMIN123';
        const baseUrl = window.location.origin;
        const registrationUrl = `${baseUrl}/student-registration?ref=${referralCode}`;

        setGeneratedLink(registrationUrl);
        setShowAddModal(false);
        setShowLinkDialog(true);
        setLinkCopied(false);
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleCreateManually = () => {
        setShowAddModal(false);
        navigate('/students/create');
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            // Note: Delete API might not be implemented in backend yet
            // await studentService.deleteStudent(deleteConfirm._id);
            toast.success(`Student deleted successfully`);
            setDeleteConfirm(null);
            fetchStudentsData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete student');
            setDeleteConfirm(null);
        }
    };

    return (
        <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Students Management</h1>
                    <p className="text-gray-600">Manage and monitor all registered students</p>
                </div>
                <button
                    className="bg-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg"
                    onClick={() => setShowAddModal(true)}
                >
                    <Plus size={20} />
                    Add Student
                </button>
            </div>

            {/* Add Student Dialog */}
            <AlertDialog open={showAddModal} onOpenChange={setShowAddModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Add New Student</AlertDialogTitle>
                        <AlertDialogDescription>
                            Choose how you would like to add a new student to the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleShareLink}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            Share Link
                        </AlertDialogAction>
                        <AlertDialogAction
                            onClick={handleCreateManually}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            Create Manually
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Share Link Dialog */}
            <AlertDialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Student Registration Link</AlertDialogTitle>
                        <AlertDialogDescription>
                            Share this linkwith the student to register. Their registration will be automatically tracked to your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="my-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                        <p className="text-sm text-gray-700 break-all font-mono">{generatedLink}</p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowLinkDialog(false)}>Close</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCopyLink}
                            className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                        >
                            {linkCopied ? (
                                <>
                                    <Check size={18} />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy size={18} />
                                    Copy Link
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative flex items-center max-w-2xl">
                    <Search size={20} className="absolute left-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, mobile, or student ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="bg-white rounded-2xl shadow-md p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="text-gray-600 mt-4">Loading students...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                    <p className="text-red-700 font-medium">Error: {error}</p>
                    <button
                        onClick={fetchStudentsData}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredStudents.length === 0 && (
                <div className="bg-white rounded-2xl shadow-md p-12 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Students Found</h3>
                    <p className="text-gray-500 mb-6">
                        {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first student'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                        >
                            Add First Student
                        </button>
                    )}
                </div>
            )}

            {/* Students Table */}
            {!loading && !error && filteredStudents.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-300">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">S.No.</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Name</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Contact</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Gender</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Nationality</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Country</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Referred By</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Registered On</th>
                                    <th className="p-4 text-left font-semibold text-xs uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => (
                                    <tr key={student._id || student.id} className="border-b border-gray-300 hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <span className="font-semibold text-indigo-600">
                                                #{(pagination.page - 1) * pagination.limit + index + 1}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-semibold text-gray-800">
                                                {student.firstName && student.lastName
                                                    ? `${student.firstName} ${student.lastName}`
                                                    : student.name || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <a href={`mailto:${student.email}`} className="text-gray-700 text-sm hover:text-indigo-600">
                                                    {student.email || 'N/A'}
                                                </a>
                                                <a href={`tel:${student.mobile}`} className="text-gray-500 text-xs hover:text-indigo-600">
                                                    {student.mobile || 'N/A'}
                                                </a>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-600">{student.gender || 'N/A'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-600">{student.nationality || 'N/A'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-600">{student.country || 'N/A'}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-600">
                                                {student.referredByName || 'Direct'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-gray-600">
                                                {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/students/${student._id || student.id}`)}
                                                    className="px-3 py-1.5 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-600 hover:text-white transition-all"
                                                    title="View Details"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/students/${student._id || student.id}/edit`)}
                                                    className="px-3 py-1.5 border border-green-300 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-600 hover:text-white transition-all"
                                                    title="Edit"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(student)}
                                                    className="px-3 py-1.5 border border-red-300 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-600 hover:text-white transition-all"
                                                    title="Delete"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && !error && filteredStudents.length > 0 && (
                <div className="flex justify-between items-center bg-white px-6 py-5 rounded-2xl shadow-md border border-gray-300 mt-6">
                    <div className="text-gray-600 text-sm">
                        Showing <strong className="text-gray-800 font-semibold">{filteredStudents.length}</strong> of <strong className="text-gray-800 font-semibold">{students.length}</strong> students
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            Previous
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation AlertDialog */}
            <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the student{' '}
                            <strong>
                                {deleteConfirm?.firstName} {deleteConfirm?.lastName}
                            </strong>{' '}
                            and their associated record. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default StudentList;
