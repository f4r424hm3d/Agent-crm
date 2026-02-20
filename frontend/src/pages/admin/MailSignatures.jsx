import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertCircle } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useToast } from '../../components/ui/toast';
import mailSignatureService from '../../services/mailSignatureService';
import PageHeader from '../../components/layout/PageHeader';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "../../components/ui/alert-dialog";

const MailSignatures = () => {
    const [signatures, setSignatures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedSignature, setSelectedSignature] = useState(null);
    const [formData, setFormData] = useState({ name: '', signatureContent: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toast = useToast();

    useEffect(() => {
        fetchSignatures();
    }, []);

    const fetchSignatures = async () => {
        try {
            setLoading(true);
            const response = await mailSignatureService.getSignatures();
            setSignatures(response.data || []);
        } catch (error) {
            console.error('Failed to fetch signatures:', error);
            toast.error('Failed to load mail signatures.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (signature = null) => {
        if (signature) {
            setFormData({
                name: signature.name,
                signatureContent: signature.signatureContent
            });
            setSelectedSignature(signature);
        } else {
            setFormData({ name: '', signatureContent: '' });
            setSelectedSignature(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSignature(null);
        setFormData({ name: '', signatureContent: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.signatureContent.trim() || formData.signatureContent === '<p><br></p>') {
            return toast.warning('Name and signature content are required.');
        }

        try {
            setIsSubmitting(true);
            if (selectedSignature) {
                await mailSignatureService.updateSignature(selectedSignature._id, formData);
                toast.success('Signature updated successfully');
            } else {
                await mailSignatureService.createSignature(formData);
                toast.success('Signature created successfully');
            }
            handleCloseModal();
            fetchSignatures();
        } catch (error) {
            console.error('Save error:', error);
            toast.error(error.response?.data?.message || 'Failed to save signature.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (signature) => {
        setSelectedSignature(signature);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!selectedSignature) return;
        try {
            await mailSignatureService.deleteSignature(selectedSignature._id);
            toast.success('Signature deleted successfully');
            setIsDeleteDialogOpen(false);
            setSelectedSignature(null);
            fetchSignatures();
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete signature.');
        }
    };

    const modules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <PageHeader
                breadcrumbs={[
                    { label: 'Dashboard', link: '/dashboard' },
                    { label: 'Mail Signatures' }
                ]}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mail Signatures</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage email signatures used in the CRM.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Create Signature
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
                </div>
            ) : signatures.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No Signatures Found</h3>
                    <p className="text-gray-500 mb-6">Create your first mail signature to get started.</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="inline-flex items-center gap-2 text-primary-600 font-medium hover:text-primary-700 hover:underline"
                    >
                        <Plus className="w-4 h-4" /> Add Signature
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {signatures.map((sig) => (
                        <div key={sig._id} className="bg-white rounded-2xl border-2 transition-all shadow-sm flex flex-col overflow-hidden border-gray-200 hover:border-primary-300">
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="font-bold text-gray-900 text-lg truncate pr-2" title={sig.name}>{sig.name}</h3>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100 p-4 relative group">
                                    <div
                                        className="text-sm text-gray-800 max-h-48 overflow-y-auto custom-scrollbar [&_p]:m-0 [&_a]:text-primary-600 hover:[&_a]:underline [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4"
                                        dangerouslySetInnerHTML={{ __html: sig.signatureContent || '<span class="text-gray-400 italic">No content</span>' }}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl" />
                                </div>
                            </div>

                            <div className="border-t border-gray-100 p-4 bg-gray-50/80 flex justify-end gap-2 shrink-0">
                                <button
                                    onClick={() => handleOpenModal(sig)}
                                    className="cursor-pointer flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-700 bg-white hover:bg-primary-50 rounded-lg transition-colors border border-gray-200 hover:border-primary-200 shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(sig)}
                                    className="cursor-pointer flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors border border-gray-200 hover:border-red-200 shadow-sm"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedSignature ? 'Edit Signature' : 'Create New Signature'}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form id="signatureForm" onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                        Signature Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                        placeholder="e.g. Default Admin Signature"
                                    />
                                </div>

                                <div className="pb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2 whitespace-nowrap">
                                        Signature Content <span className="text-red-500">*</span>
                                    </label>
                                    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
                                        <ReactQuill
                                            theme="snow"
                                            value={formData.signatureContent}
                                            onChange={(content) => setFormData({ ...formData, signatureContent: content })}
                                            modules={modules}
                                            className="bg-white h-[200px]"
                                            placeholder="Write your email signature here..."
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Available formatting: Bold, Italic, Underline, Lists, and Links.</p>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="signatureForm"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                        Saving...
                                    </span>
                                ) : (
                                    'Save Signature'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Signature</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the signature "{selectedSignature?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MailSignatures;
