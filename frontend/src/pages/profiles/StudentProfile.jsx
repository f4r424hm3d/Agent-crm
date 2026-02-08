import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { User, UserCircle2, Home, GraduationCap, MessageSquare, Lock, ChevronLeft, ChevronDown, ChevronUp, Globe, MapPin, Phone, Mail, Calendar, FileText, CheckCircle2, Award, LogOut, Trash2, Plus, X, Eye, EyeOff } from 'lucide-react';
import apiClient from '../../services/apiClient';
import authService from '../../services/authService';

/**
 * StudentProfile Component
 * Balanced Premium Design: Polished but not "excessive".
 * Maintains full-width sidebar card and reduced outer padding as requested.
 */

// --- Helper Components (Must be outside to prevent re-creation) ---
const Toggle = ({ checked, onChange, label, disabled }) => (
    <div
        onClick={() => !disabled && onChange(!checked)}
        className={`flex items-center justify-between group cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span className="text-xs font-black text-[#002855] group-hover:text-blue-600 transition-colors">{label}</span>
        <button
            type="button"
            className={`relative inline-flex h-6 w-12 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-[#004a99]' : 'bg-gray-200'}`}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-6' : 'translate-x-0'}`}
            />
        </button>
    </div>
);

const ScoreRankField = ({ label, score, rank, onScoreChange, onRankChange, isEditing, className = "" }) => (
    <div className={`space-y-1 ${className}`}>
        <span className="text-xs font-semibold text-gray-700 ml-1">{label}</span>
        <div className="flex gap-2 w-full">
            <input
                type="text"
                value={score || ''}
                onChange={(e) => isEditing && onScoreChange(e.target.value)}
                placeholder="Score"
                disabled={!isEditing}
                className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            />
            <input
                type="text"
                value={rank || ''}
                onChange={(e) => isEditing && onRankChange(e.target.value)}
                placeholder="Rank"
                disabled={!isEditing}
                className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
            />
        </div>
    </div>
);

const SectionFooter = ({ onSave, onCancel }) => (
    <div className="flex justify-end gap-3 pt-8 border-t border-gray-50 mt-8">
        <button onClick={onCancel} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">
            Cancel
        </button>
        <button onClick={onSave} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-100">
            Save Changes
        </button>
    </div>
);

const SectionHeader = ({ title, icon: Icon, isEditing, onEdit }) => (
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Icon className="text-blue-600 w-5 h-5" />
            {title}
        </h3>
        {!isEditing && onEdit && (
            <button onClick={onEdit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
                Edit
            </button>
        )}
    </div>
);

const DataField = ({ label, value, isEditing, onChange, type = "text", placeholder, options, icon: Icon, mono = false, disabled = false, maxHint }) => (
    <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-700 ml-1">
            {label}
        </label>
        {isEditing && !disabled ? (
            options ? (
                <select
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : type === 'textarea' ? (
                <div className="relative">
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                        className={`w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${mono ? 'font-mono' : ''}`}
                    />
                    {maxHint && <span className="absolute right-3 bottom-3 text-xs text-gray-400">max {maxHint}</span>}
                </div>
            ) : (
                <div className="relative">
                    <input
                        type={type}
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className={`w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors ${mono ? 'font-mono' : ''}`}
                    />
                    {maxHint && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">max {maxHint}</span>}
                </div>
            )
        ) : (
            <div className={`bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 w-full flex items-center ${mono ? 'font-mono' : ''} ${disabled ? 'opacity-60' : ''} ${type === 'textarea' ? 'min-h-[100px] items-start whitespace-pre-wrap' : ''}`}>
                {value || <span className="text-gray-400 italic">Not Provided</span>}
            </div>
        )}
    </div>
);

const StudentProfile = () => {
    const navigate = useNavigate();

    // --- State Management ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("general");

    // Document Upload States
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [documentForm, setDocumentForm] = useState({ documentName: '', selectedFile: null });

    // Core Data States
    const [studentData, setStudentData] = useState(null);
    const [editMode, setEditMode] = useState({
        general: false,
        education: false,
        testScores: false,
        background: false
    });
    const [editData, setEditData] = useState({});

    // --- Refs for Smooth Scrolling ---
    const profileRef = useRef(null);
    const generalRef = useRef(null);
    const educationRef = useRef(null);
    const testScoresRef = useRef(null);
    const backgroundRef = useRef(null);
    const uploadRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- Data Fetching ---
    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/students/me');
            const data = response?.data?.data?.student || response?.data;
            if (data) {
                const formattedData = {
                    ...data,
                    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : "",
                    passportExpiry: data.passportExpiry ? new Date(data.passportExpiry).toISOString().split('T')[0] : "",
                    examDate: data.examDate ? new Date(data.examDate).toISOString().split('T')[0] : "",
                    additionalQualifications: {
                        gre: data.additionalQualifications?.gre || { hasExam: false, examDate: "", verbalScore: "", verbalRank: "", quantScore: "", quantRank: "", writingScore: "", writingRank: "" },
                        gmat: data.additionalQualifications?.gmat || { hasExam: false, examDate: "", verbalScore: "", verbalRank: "", quantScore: "", quantRank: "", writingScore: "", writingRank: "", irScore: "", irRank: "", totalScore: "", totalRank: "" },
                        sat: data.additionalQualifications?.sat || { hasExam: false, examDate: "", reasoningPoint: "", subjectTestPoint: "" }
                    }
                };
                setStudentData(formattedData);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile data.');
        } finally {
            setLoading(false);
        }
    };

    // --- Handlers ---
    const handleTabClick = (tab, ref) => {
        setActiveTab(tab);
        ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleEditToggle = (section) => {
        setEditMode(prev => ({ ...prev, [section]: true }));
        const currentData = { ...studentData };

        // Ensure nested objects exist for test scores
        if (section === 'testScores') {
            currentData.additionalQualifications = currentData.additionalQualifications || {};
            currentData.additionalQualifications.gre = currentData.additionalQualifications.gre || { hasExam: false };
            currentData.additionalQualifications.gmat = currentData.additionalQualifications.gmat || { hasExam: false };
            currentData.additionalQualifications.sat = currentData.additionalQualifications.sat || { hasExam: false };
        }

        setEditData(currentData);
    };

    const handleCancelEdit = (section) => {
        setEditMode(prev => ({ ...prev, [section]: false }));
        setEditData({});
    };

    const handleFieldChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleExamToggle = (examType, checked) => {
        setEditData(prev => {
            const currentExam = prev.additionalQualifications?.[examType] || {};
            const newState = {
                ...prev,
                additionalQualifications: {
                    ...prev.additionalQualifications,
                    [examType]: {
                        ...currentExam,
                        hasExam: checked
                    }
                }
            };
            return newState;
        });
    };

    const handleSaveEdit = async (section) => {
        try {
            setLoading(true);
            const response = await apiClient.put('/students/me', editData);
            if (response.data.success) {
                setStudentData(editData);
                setEditMode(prev => ({ ...prev, [section]: false }));
                setEditData({});
                setUploadSuccess('Profile updated successfully!');
                setTimeout(() => setUploadSuccess(false), 3000);
            }
        } catch (err) {
            setUploadError(err.response?.data?.message || 'Update failed');
            setTimeout(() => setUploadError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleClearExam = (examType) => {
        setClearExamType(examType);
    };

    const confirmClearExam = async () => {
        if (!clearExamType) return;
        const examType = clearExamType;

        try {
            setLoading(true);
            const updatedData = {
                ...editData,
                additionalQualifications: {
                    ...editData.additionalQualifications,
                    [examType]: { hasExam: false }
                }
            };

            // Update local edit state first to reflect changes immediately in UI if we were to stay in edit mode
            setEditData(updatedData);

            const response = await apiClient.put('/students/me', updatedData);
            if (response.data.success) {
                // Manually update studentData to reflect the change
                setStudentData(prev => ({
                    ...prev,
                    additionalQualifications: {
                        ...prev.additionalQualifications,
                        [examType]: { hasExam: false }
                    }
                }));

                setUploadSuccess(`${examType.toUpperCase()} record cleared!`);
                setClearExamType(null);
                setTimeout(() => setUploadSuccess(null), 3000);
            }
        } catch (err) {
            console.error('Error clearing exam:', err);
            setUploadError('Failed to clear record.');
            setClearExamType(null);
            setTimeout(() => setUploadError(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    // --- Document Handlers ---
    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) setDocumentForm(prev => ({ ...prev, selectedFile: file }));
    };

    const handleUploadSubmit = async () => {
        if (!documentForm.documentName.trim() || !documentForm.selectedFile) return;
        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('document', documentForm.selectedFile);
            formData.append('document_type', documentForm.documentName.trim());
            const response = await apiClient.post('/students/me/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setUploadSuccess(true);
                fetchProfile();
                setDocumentForm({ documentName: '', selectedFile: null });
                if (fileInputRef.current) fileInputRef.current.value = '';
                setTimeout(() => setUploadSuccess(false), 3000);
            }
        } catch (err) {
            setUploadError('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const [deleteId, setDeleteId] = useState(null);
    const [clearExamType, setClearExamType] = useState(null);

    const handleDeleteDocument = (documentId, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setDeleteId(documentId);
    };

    const confirmDelete = async () => {
        const documentId = deleteId;
        if (!deleteId) return;

        console.log("Confirming delete for:", deleteId);

        try {
            const token = localStorage.getItem('token');
            console.log("Token present:", !!token);

            // Assuming the logged-in user is the student
            const response = await apiClient.delete(`/students/me/documents/${documentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log("Delete response:", response);

            // Update local state by filtering out the deleted document
            setStudentData(prev => ({
                ...prev,
                documents: prev.documents.filter(doc => doc._id !== documentId)
            }));

            setUploadSuccess('Document deleted successfully');
            setDeleteId(null);
            setTimeout(() => setUploadSuccess(null), 3000);

        } catch (error) {
            console.error("Delete error details:", error);
            setUploadError(error.response?.data?.message || 'Failed to delete document');
            setDeleteId(null);
            setTimeout(() => setUploadError(null), 3000);
        }
    };

    // --- Render Helpers ---

    if (loading && !studentData) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-6 text-center">
            <h2 className="text-2xl font-black text-gray-900 mb-2">{error}</h2>
            <button onClick={() => navigate('/dashboard')} className="mt-4 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-100 transition-all">
                Return to Dashboard
            </button>
        </div>
    );

    return (
        <div className="max-w-[1500px] mx-auto space-y-10">

            {/* --- Top Bar --- */}
            <div className="flex items-center justify-between pb-2">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 px-6 py-3 bg-white text-gray-700 rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all font-black text-sm"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Back to Dashboard
                </button>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</span>
                    <span className="text-green-600 font-black text-sm uppercase">Active Profile</span>
                </div>
            </div>

            {/* --- Sticky Navigation --- */}
            <div className="sticky top-0 z-40 -mx-4 px-4 py-2 bg-gray-50/80 backdrop-blur-xl border-b border-gray-200/50">
                <div className="bg-white/90 p-1.5 rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 max-w-4xl mx-auto flex overflow-x-auto no-scrollbar gap-1">
                    {[
                        { id: "profile", label: "Overview", ref: profileRef },
                        { id: "general", label: "Personal", ref: generalRef },
                        { id: "education", label: "Academic", ref: educationRef },
                        { id: "testScores", label: "Tests", ref: testScoresRef },
                        { id: "backgroundInfo", label: "Background", ref: backgroundRef },
                        { id: "uploadDocs", label: "Docs", ref: uploadRef },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id, tab.ref)}
                            className={`whitespace-nowrap flex-1 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                                : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* --- Sidebar: Profile Card --- */}
                <div ref={profileRef} className="lg:col-span-4 sticky top-20 w-full">
                    <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden w-full">
                        <div className="h-28 bg-gradient-to-br from-blue-600 to-indigo-700"></div>
                        <div className="px-8 pb-10">
                            <div className="relative flex justify-center -mt-12 mb-6">
                                <div className="p-2 bg-white rounded-2xl shadow-2xl">
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <UserCircle2 className="w-20 h-20 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {studentData.firstName} {studentData.lastName}
                                </h2>
                                <p className="text-gray-400 font-bold text-xs lowercase">{studentData.email}</p>
                            </div>

                            <div className="mt-2 space-y-6 border-t border-gray-50 pt-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Phone className="w-3 h-3 text-blue-500" /> Contact Number
                                    </span>
                                    <p className="text-gray-900 font-black text-lg">+{studentData.countryCode} {studentData.phone}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gender</span>
                                        <p className="text-gray-900 font-black text-sm">{studentData.gender}</p>
                                    </div>
                                    <div className="space-y-1 text-right">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</span>
                                        <p className="text-gray-900 font-black text-sm">Standard</p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/change-password')}
                                className="mt-2 w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 text-gray-700 rounded-2xl font-black hover:bg-gray-100 transition-all border border-gray-200 text-sm"
                            >
                                <Lock className="w-5 h-5 text-blue-600" /> Change Password
                            </button>
                            <button onClick={() => navigate('/dashboard')} className="mt-2 w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-50 text-gray-700 rounded-2xl font-black hover:bg-gray-100 transition-all border border-gray-200 text-sm">
                                <LogOut className="w-5 h-5" /> Sign Out Portal
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Main Content --- */}
                <div className="lg:col-span-8 flex flex-col gap-12">

                    {/* General Information */}
                    <section ref={generalRef} className="scroll-mt-32">
                        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
                            <SectionHeader
                                title="Personal Profile"
                                icon={User}
                                isEditing={editMode.general}
                                onEdit={() => handleEditToggle('general')}
                                onSave={() => handleSaveEdit('general')}
                                onCancel={() => handleCancelEdit('general')}
                            />
                            <div className="p-6 md:p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <DataField label="First Name" value={editMode.general ? editData.firstName : studentData.firstName} isEditing={editMode.general} onChange={(v) => handleFieldChange('firstName', v)} />
                                    <DataField label="Last Name" value={editMode.general ? editData.lastName : studentData.lastName} isEditing={editMode.general} onChange={(v) => handleFieldChange('lastName', v)} />
                                    <DataField label="Email Address" value={studentData.email} disabled={true} icon={Mail} />
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="col-span-1">
                                            <DataField label="Code" value={editMode.general ? editData.countryCode : studentData.countryCode} isEditing={editMode.general} onChange={(v) => handleFieldChange('countryCode', v)} />
                                        </div>
                                        <div className="col-span-3">
                                            <DataField label="Phone Number" value={editMode.general ? editData.phone : studentData.phone} isEditing={editMode.general} onChange={(v) => handleFieldChange('phone', v)} mono={true} />
                                        </div>
                                    </div>
                                    <DataField label="Father Name" value={editMode.general ? editData.fatherName : studentData.fatherName} isEditing={editMode.general} onChange={(v) => handleFieldChange('fatherName', v)} />
                                    <DataField label="Mother Name" value={editMode.general ? editData.motherName : studentData.motherName} isEditing={editMode.general} onChange={(v) => handleFieldChange('motherName', v)} />
                                    <DataField label="Nationality" value={editMode.general ? editData.nationality : studentData.nationality} options={["INDIA", "USA", "UK", "CANADA"]} isEditing={editMode.general} onChange={(v) => handleFieldChange('nationality', v)} />
                                    <DataField label="Gender" value={editMode.general ? editData.gender : studentData.gender} options={["Male", "Female", "Other"]} isEditing={editMode.general} onChange={(v) => handleFieldChange('gender', v)} />
                                </div>
                                <div className="pt-10 border-t border-gray-50 transition-all">
                                    <h4 className="flex items-center gap-3 text-lg font-black text-gray-900 mb-8">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                        Passport & Address Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <DataField label="Passport Number" value={editMode.general ? editData.passportNumber : studentData.passportNumber} isEditing={editMode.general} onChange={(v) => handleFieldChange('passportNumber', v)} mono={true} />
                                        <DataField label="Passport Expiry" value={editMode.general ? editData.passportExpiry : studentData.passportExpiry} isEditing={editMode.general} onChange={(v) => handleFieldChange('passportExpiry', v)} type="date" />
                                        <DataField label="City" value={editMode.general ? editData.city : studentData.city} isEditing={editMode.general} onChange={(v) => handleFieldChange('city', v)} />
                                    </div>
                                    <div className="mt-8">
                                        <DataField label="Full Home Address" value={editMode.general ? editData.address : studentData.address} isEditing={editMode.general} onChange={(v) => handleFieldChange('address', v)} icon={MapPin} />
                                    </div>

                                    {editMode.general && (
                                        <SectionFooter onSave={() => handleSaveEdit('general')} onCancel={() => handleCancelEdit('general')} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Academic Section */}
                    <section ref={educationRef} className="scroll-mt-32">
                        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-50 overflow-hidden">
                            <SectionHeader
                                title="Academic Background"
                                icon={GraduationCap}
                                isEditing={editMode.education}
                                onEdit={() => handleEditToggle('education')}
                                onSave={() => handleSaveEdit('education')}
                                onCancel={() => handleCancelEdit('education')}
                            />
                            <div className="p-6 md:p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <DataField label="Academic Level" value={editMode.education ? editData.academicLevel : studentData.academicLevel} options={["High School", "Diploma", "Under-Graduate", "Post-Graduate"]} isEditing={editMode.education} onChange={(v) => handleFieldChange('academicLevel', v)} />
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Grade Average / Score</label>
                                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between">
                                            <span className="text-xl font-black text-indigo-700 font-mono tracking-tighter">
                                                {editMode.education ? (
                                                    <input type="text" value={editData.gradeAverage} onChange={(e) => handleFieldChange('gradeAverage', e.target.value)} className="bg-transparent border-none text-right outline-none w-20" />
                                                ) : (studentData.gradeAverage || "0.0")}
                                            </span>
                                            <Award className="w-5 h-5 text-indigo-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-10 border-t border-gray-50">
                                    <div className="flex items-center justify-between mb-8">
                                        <h4 className="flex items-center gap-3 text-lg font-black text-gray-900">
                                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                            Institutions Attended
                                        </h4>
                                        <button onClick={() => {
                                            if (!editMode.education) {
                                                setEditMode(p => ({ ...p, education: true }));
                                                setEditData({
                                                    ...studentData,
                                                    schoolsAttended: [...(studentData.schoolsAttended || []), { institutionName: '', degreeName: '', fromMonthYear: '', toMonthYear: '' }]
                                                });
                                            } else {
                                                setEditData(p => ({ ...p, schoolsAttended: [...(p.schoolsAttended || []), { institutionName: '', degreeName: '', fromMonthYear: '', toMonthYear: '' }] }));
                                            }
                                        }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg shadow-indigo-100">+ Add Institution</button>
                                    </div>
                                    <div className="space-y-6">
                                        {(editMode.education ? editData.schoolsAttended : studentData.schoolsAttended)?.map((school, idx) => (
                                            <div key={idx} className="bg-gray-50 border border-gray-100 rounded-2xl p-8 relative flex flex-col md:flex-row gap-8 hover:bg-white hover:shadow-xl transition-all duration-300">
                                                <div className="w-16 h-16 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                                                    <GraduationCap className="w-8 h-8" />
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <DataField label="Institution" value={school.institutionName} isEditing={editMode.education} onChange={(v) => { const u = [...editData.schoolsAttended]; u[idx].institutionName = v; handleFieldChange('schoolsAttended', u); }} />
                                                    <DataField label="Degree/Course" value={school.degreeName} isEditing={editMode.education} onChange={(v) => { const u = [...editData.schoolsAttended]; u[idx].degreeName = v; handleFieldChange('schoolsAttended', u); }} />
                                                    <DataField label="From (MM/YY)" value={school.fromMonthYear} isEditing={editMode.education} onChange={(v) => { const u = [...editData.schoolsAttended]; u[idx].fromMonthYear = v; handleFieldChange('schoolsAttended', u); }} mono={true} />
                                                    <DataField label="To (MM/YY)" value={school.toMonthYear} isEditing={editMode.education} onChange={(v) => { const u = [...editData.schoolsAttended]; u[idx].toMonthYear = v; handleFieldChange('schoolsAttended', u); }} mono={true} />
                                                </div>
                                                {editMode.education && (
                                                    <button onClick={() => { const u = [...editData.schoolsAttended]; u.splice(idx, 1); handleFieldChange('schoolsAttended', u); }} className="absolute顶-6 right-8 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {editMode.education && (
                                    <SectionFooter onSave={() => handleSaveEdit('education')} onCancel={() => handleCancelEdit('education')} />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Test Scores */}
                    <section ref={testScoresRef} className="scroll-mt-32">
                        <div className="bg-white rounded-2xl shadow shadow-gray-200/50 border border-gray-50 overflow-hidden">
                            <SectionHeader
                                title="Standardized Test Scores"
                                icon={Award}
                                isEditing={editMode.testScores}
                                onEdit={() => handleEditToggle('testScores')}
                                onSave={() => handleSaveEdit('testScores')}
                                onCancel={() => handleCancelEdit('testScores')}
                            />
                            <div className="p-10 space-y-12">
                                <div className="space-y-8">
                                    <h4 className="flex items-center gap-3 text-lg font-black text-gray-900">
                                        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                                        Language Proficiency
                                    </h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                                        <div className="col-span-2"><DataField label="Exam Type" value={editMode.testScores ? editData.examType : studentData.examType} options={["IELTS", "TOEFL", "PTE", "Duolingo"]} isEditing={editMode.testScores} onChange={(v) => handleFieldChange('examType', v)} /></div>
                                        <div className="col-span-2"><DataField label="Date" type="date" value={editMode.testScores ? editData.examDate : studentData.examDate} isEditing={editMode.testScores} onChange={(v) => handleFieldChange('examDate', v)} /></div>
                                        <DataField label="Listening" value={editMode.testScores ? editData.listeningScore : studentData.listeningScore} isEditing={editMode.testScores} onChange={(v) => handleFieldChange('listeningScore', v)} mono={true} />
                                        <DataField label="Reading" value={editMode.testScores ? editData.readingScore : studentData.readingScore} isEditing={editMode.testScores} onChange={(v) => handleFieldChange('readingScore', v)} mono={true} />
                                        <DataField label="Writing" value={editMode.testScores ? editData.writingScore : studentData.writingScore} isEditing={editMode.testScores} onChange={(v) => handleFieldChange('writingScore', v)} mono={true} />
                                        <DataField label="Speaking" value={editMode.testScores ? editData.speakingScore : studentData.speakingScore} isEditing={editMode.testScores} onChange={(v) => handleFieldChange('speakingScore', v)} mono={true} />
                                        <div className="col-span-2 bg-blue-600 p-3 rounded-xl flex flex-col items-center justify-center text-white shadow-lg shadow-blue-100/50">
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 leading-none">Overall Score</span>
                                            <span className="text-2xl font-bold font-mono mt-1">
                                                {editMode.testScores ? (
                                                    <input type="text" value={editData.overallScore} onChange={e => handleFieldChange('overallScore', e.target.value)} className="bg-transparent border-none text-center outline-none w-16" />
                                                ) : (studentData.overallScore || "0.0")}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-gray-100 space-y-6">
                                    <h4 className="flex items-center gap-3 text-lg font-black text-gray-900 mb-6">
                                        <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                                        Standardized Test Scores
                                    </h4>
                                    <div className="space-y-6">
                                        <div className="space-y-12">
                                            {/* GRE Section */}
                                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group">
                                                <div
                                                    onClick={() => {
                                                        if (!editMode.testScores) {
                                                            handleEditToggle('testScores');
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                additionalQualifications: {
                                                                    ...prev.additionalQualifications,
                                                                    gre: { ...prev.additionalQualifications?.gre, hasExam: true }
                                                                }
                                                            }));
                                                        } else {
                                                            handleExamToggle('gre', !editData.additionalQualifications?.gre?.hasExam);
                                                        }
                                                    }}
                                                    className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 cursor-pointer ${(editMode.testScores ? editData.additionalQualifications?.gre?.hasExam : studentData.additionalQualifications?.gre?.hasExam) ? 'bg-white border-b border-gray-100' : 'bg-white hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${(editMode.testScores ? editData.additionalQualifications?.gre?.hasExam : studentData.additionalQualifications?.gre?.hasExam) ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-500 group-hover:bg-purple-50 group-hover:text-purple-600'}`}>
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <span className={`font-bold text-lg transition-colors ${(editMode.testScores ? editData.additionalQualifications?.gre?.hasExam : studentData.additionalQualifications?.gre?.hasExam) ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                            {(editMode.testScores ? editData.additionalQualifications?.gre?.hasExam : studentData.additionalQualifications?.gre?.hasExam) ? 'GRE Details' : 'Add GRE Score'}
                                                        </span>
                                                    </div>
                                                    <div className={`p-2 rounded-lg border-2 transition-colors duration-200 ${(editMode.testScores ? editData.additionalQualifications?.gre?.hasExam : studentData.additionalQualifications?.gre?.hasExam) ? 'border-purple-100 bg-purple-50 text-purple-600' : 'border-gray-100 bg-gray-50 text-gray-400 group-hover:border-purple-100 group-hover:text-purple-600'}`}>
                                                        {(editMode.testScores ? editData.additionalQualifications?.gre?.hasExam : studentData.additionalQualifications?.gre?.hasExam) ?
                                                            <ChevronUp className="w-5 h-5" /> :
                                                            <div className="w-5 h-5 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                                                        }
                                                    </div>
                                                </div>

                                                {(editMode.testScores ? editData.additionalQualifications?.gre?.hasExam : studentData.additionalQualifications?.gre?.hasExam) && (
                                                    <div className="p-6 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-sm font-bold text-gray-700">Date of Exam</span>
                                                                <input
                                                                    type="date"
                                                                    value={editMode.testScores ? editData.additionalQualifications.gre.examDate : studentData.additionalQualifications.gre.examDate}
                                                                    onChange={e => setEditData(prev => ({ ...prev, additionalQualifications: { ...prev.additionalQualifications, gre: { ...prev.additionalQualifications.gre, examDate: e.target.value } } }))}
                                                                    disabled={!editMode.testScores}
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 disabled:bg-gray-50 transition-all font-medium"
                                                                />
                                                            </div>
                                                            <ScoreRankField label="Verbal" score={editMode.testScores ? editData.additionalQualifications.gre.verbalScore : studentData.additionalQualifications.gre.verbalScore} rank={editMode.testScores ? editData.additionalQualifications.gre.verbalRank : studentData.additionalQualifications.gre.verbalRank} isEditing={editMode.testScores} onScoreChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gre: { ...p.additionalQualifications.gre, verbalScore: v } } }))} onRankChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gre: { ...p.additionalQualifications.gre, verbalRank: v } } }))} />
                                                            <ScoreRankField label="Quant" score={editMode.testScores ? editData.additionalQualifications.gre.quantScore : studentData.additionalQualifications.gre.quantScore} rank={editMode.testScores ? editData.additionalQualifications.gre.quantRank : studentData.additionalQualifications.gre.quantRank} isEditing={editMode.testScores} onScoreChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gre: { ...p.additionalQualifications.gre, quantScore: v } } }))} onRankChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gre: { ...p.additionalQualifications.gre, quantRank: v } } }))} />
                                                            <ScoreRankField label="Writing" score={editMode.testScores ? editData.additionalQualifications.gre.writingScore : studentData.additionalQualifications.gre.writingScore} rank={editMode.testScores ? editData.additionalQualifications.gre.writingRank : studentData.additionalQualifications.gre.writingRank} isEditing={editMode.testScores} onScoreChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gre: { ...p.additionalQualifications.gre, writingScore: v } } }))} onRankChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gre: { ...p.additionalQualifications.gre, writingRank: v } } }))} />
                                                        </div>
                                                        {editMode.testScores && (
                                                            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                                                <button
                                                                    onClick={() => handleClearExam('gre')}
                                                                    className="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    Clear Record
                                                                </button>
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={() => handleCancelEdit('testScores')}
                                                                        className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSaveEdit('testScores')}
                                                                        className="px-6 py-2.5 text-sm font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm shadow-purple-200"
                                                                    >
                                                                        Save Changes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* GMAT Section */}
                                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group">
                                                <div
                                                    onClick={() => {
                                                        if (!editMode.testScores) {
                                                            handleEditToggle('testScores');
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                additionalQualifications: {
                                                                    ...prev.additionalQualifications,
                                                                    gmat: { ...prev.additionalQualifications?.gmat, hasExam: true }
                                                                }
                                                            }));
                                                        } else {
                                                            handleExamToggle('gmat', !editData.additionalQualifications?.gmat?.hasExam);
                                                        }
                                                    }}
                                                    className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 cursor-pointer ${(editMode.testScores ? editData.additionalQualifications?.gmat?.hasExam : studentData.additionalQualifications?.gmat?.hasExam) ? 'bg-white border-b border-gray-100' : 'bg-white hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${(editMode.testScores ? editData.additionalQualifications?.gmat?.hasExam : studentData.additionalQualifications?.gmat?.hasExam) ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500 group-hover:bg-amber-50 group-hover:text-amber-600'}`}>
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <span className={`font-bold text-lg transition-colors ${(editMode.testScores ? editData.additionalQualifications?.gmat?.hasExam : studentData.additionalQualifications?.gmat?.hasExam) ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                            {(editMode.testScores ? editData.additionalQualifications?.gmat?.hasExam : studentData.additionalQualifications?.gmat?.hasExam) ? 'GMAT Details' : 'Add GMAT Score'}
                                                        </span>
                                                    </div>
                                                    <div className={`p-2 rounded-lg border-2 transition-colors duration-200 ${(editMode.testScores ? editData.additionalQualifications?.gmat?.hasExam : studentData.additionalQualifications?.gmat?.hasExam) ? 'border-amber-100 bg-amber-50 text-amber-600' : 'border-gray-100 bg-gray-50 text-gray-400 group-hover:border-amber-100 group-hover:text-amber-600'}`}>
                                                        {(editMode.testScores ? editData.additionalQualifications?.gmat?.hasExam : studentData.additionalQualifications?.gmat?.hasExam) ?
                                                            <ChevronUp className="w-5 h-5" /> :
                                                            <div className="w-5 h-5 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                                                        }
                                                    </div>
                                                </div>

                                                {(editMode.testScores ? editData.additionalQualifications?.gmat?.hasExam : studentData.additionalQualifications?.gmat?.hasExam) && (
                                                    <div className="p-6 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-sm font-bold text-gray-700">Date of Exam</span>
                                                                <input
                                                                    type="date"
                                                                    value={editMode.testScores ? editData.additionalQualifications.gmat.examDate : studentData.additionalQualifications.gmat.examDate}
                                                                    onChange={e => setEditData(prev => ({ ...prev, additionalQualifications: { ...prev.additionalQualifications, gmat: { ...prev.additionalQualifications.gmat, examDate: e.target.value } } }))}
                                                                    disabled={!editMode.testScores}
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 disabled:bg-gray-50 transition-all font-medium"
                                                                />
                                                            </div>
                                                            <ScoreRankField label="Total Score" score={editMode.testScores ? editData.additionalQualifications.gmat.totalScore : studentData.additionalQualifications.gmat.totalScore} rank={editMode.testScores ? editData.additionalQualifications.gmat.totalRank : studentData.additionalQualifications.gmat.totalRank} isEditing={editMode.testScores} onScoreChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, totalScore: v } } }))} onRankChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, totalRank: v } } }))} />
                                                            <ScoreRankField label="Verbal" score={editMode.testScores ? editData.additionalQualifications.gmat.verbalScore : studentData.additionalQualifications.gmat.verbalScore} rank={editMode.testScores ? editData.additionalQualifications.gmat.verbalRank : studentData.additionalQualifications.gmat.verbalRank} isEditing={editMode.testScores} onScoreChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, verbalScore: v } } }))} onRankChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, verbalRank: v } } }))} />
                                                            <ScoreRankField label="Quant" score={editMode.testScores ? editData.additionalQualifications.gmat.quantScore : studentData.additionalQualifications.gmat.quantScore} rank={editMode.testScores ? editData.additionalQualifications.gmat.quantRank : studentData.additionalQualifications.gmat.quantRank} isEditing={editMode.testScores} onScoreChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, quantScore: v } } }))} onRankChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, quantRank: v } } }))} />
                                                            <ScoreRankField label="Integrated Reasoning" score={editMode.testScores ? editData.additionalQualifications.gmat.irScore : studentData.additionalQualifications.gmat.irScore} rank={editMode.testScores ? editData.additionalQualifications.gmat.irRank : studentData.additionalQualifications.gmat.irRank} isEditing={editMode.testScores} onScoreChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, irScore: v } } }))} onRankChange={v => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, gmat: { ...p.additionalQualifications.gmat, irRank: v } } }))} />
                                                        </div>
                                                        {editMode.testScores && (
                                                            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                                                <button
                                                                    onClick={() => handleClearExam('gmat')}
                                                                    className="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    Clear Record
                                                                </button>
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={() => handleCancelEdit('testScores')}
                                                                        className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSaveEdit('testScores')}
                                                                        className="px-6 py-2.5 text-sm font-bold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors shadow-sm shadow-amber-200"
                                                                    >
                                                                        Save Changes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* SAT Section */}
                                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md group">
                                                <div
                                                    onClick={() => {
                                                        if (!editMode.testScores) {
                                                            handleEditToggle('testScores');
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                additionalQualifications: {
                                                                    ...prev.additionalQualifications,
                                                                    sat: { ...prev.additionalQualifications?.sat, hasExam: true }
                                                                }
                                                            }));
                                                        } else {
                                                            handleExamToggle('sat', !editData.additionalQualifications?.sat?.hasExam);
                                                        }
                                                    }}
                                                    className={`w-full px-6 py-4 flex items-center justify-between transition-all duration-200 cursor-pointer ${(editMode.testScores ? editData.additionalQualifications?.sat?.hasExam : studentData.additionalQualifications?.sat?.hasExam) ? 'bg-white border-b border-gray-100' : 'bg-white hover:bg-gray-50'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${(editMode.testScores ? editData.additionalQualifications?.sat?.hasExam : studentData.additionalQualifications?.sat?.hasExam) ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-500 group-hover:bg-pink-50 group-hover:text-pink-600'}`}>
                                                            <Award className="w-5 h-5" />
                                                        </div>
                                                        <span className={`font-bold text-lg transition-colors ${(editMode.testScores ? editData.additionalQualifications?.sat?.hasExam : studentData.additionalQualifications?.sat?.hasExam) ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                                            {(editMode.testScores ? editData.additionalQualifications?.sat?.hasExam : studentData.additionalQualifications?.sat?.hasExam) ? 'SAT Details' : 'Add SAT Score'}
                                                        </span>
                                                    </div>
                                                    <div className={`p-2 rounded-lg border-2 transition-colors duration-200 ${(editMode.testScores ? editData.additionalQualifications?.sat?.hasExam : studentData.additionalQualifications?.sat?.hasExam) ? 'border-pink-100 bg-pink-50 text-pink-600' : 'border-gray-100 bg-gray-50 text-gray-400 group-hover:border-pink-100 group-hover:text-pink-600'}`}>
                                                        {(editMode.testScores ? editData.additionalQualifications?.sat?.hasExam : studentData.additionalQualifications?.sat?.hasExam) ?
                                                            <ChevronUp className="w-5 h-5" /> :
                                                            <div className="w-5 h-5 flex items-center justify-center"><Plus className="w-4 h-4" /></div>
                                                        }
                                                    </div>
                                                </div>

                                                {(editMode.testScores ? editData.additionalQualifications?.sat?.hasExam : studentData.additionalQualifications?.sat?.hasExam) && (
                                                    <div className="p-6 bg-white animate-in slide-in-from-top-2 fade-in duration-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-sm font-bold text-gray-700">Date of Exam</span>
                                                                <input
                                                                    type="date"
                                                                    value={editMode.testScores ? editData.additionalQualifications.sat.examDate : studentData.additionalQualifications.sat.examDate}
                                                                    onChange={e => setEditData(prev => ({ ...prev, additionalQualifications: { ...prev.additionalQualifications, sat: { ...prev.additionalQualifications.sat, examDate: e.target.value } } }))}
                                                                    disabled={!editMode.testScores}
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:bg-gray-50 transition-all font-medium"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-sm font-bold text-gray-700">Reasoning Test Points</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Points"
                                                                    value={editMode.testScores ? editData.additionalQualifications.sat.reasoningPoint : studentData.additionalQualifications.sat.reasoningPoint}
                                                                    onChange={e => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, sat: { ...p.additionalQualifications.sat, reasoningPoint: e.target.value } } }))}
                                                                    disabled={!editMode.testScores}
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:bg-gray-50 transition-all font-medium"
                                                                />
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <span className="text-sm font-bold text-gray-700">Subject Test Points</span>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Points"
                                                                    value={editMode.testScores ? editData.additionalQualifications.sat.subjectTestPoint : studentData.additionalQualifications.sat.subjectTestPoint}
                                                                    onChange={e => setEditData(p => ({ ...p, additionalQualifications: { ...p.additionalQualifications, sat: { ...p.additionalQualifications.sat, subjectTestPoint: e.target.value } } }))}
                                                                    disabled={!editMode.testScores}
                                                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 disabled:bg-gray-50 transition-all font-medium"
                                                                />
                                                            </div>
                                                        </div>
                                                        {editMode.testScores && (
                                                            <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                                                <button
                                                                    onClick={() => handleClearExam('sat')}
                                                                    className="px-6 py-2.5 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                                >
                                                                    Clear Record
                                                                </button>
                                                                <div className="flex gap-3">
                                                                    <button
                                                                        onClick={() => handleCancelEdit('testScores')}
                                                                        className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleSaveEdit('testScores')}
                                                                        className="px-6 py-2.5 text-sm font-bold text-white bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors shadow-sm shadow-pink-200"
                                                                    >
                                                                        Save Changes
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Background */}
                    <section ref={backgroundRef} className="scroll-mt-32">
                        <div className="bg-white rounded-2xl shadow shadow-gray-200/50 border border-gray-50 overflow-hidden">
                            <SectionHeader title="Global Background" icon={Globe} isEditing={editMode.background} onEdit={() => handleEditToggle('background')} onSave={() => handleSaveEdit('background')} onCancel={() => handleCancelEdit('background')} />
                            <div className="p-6 md:p-10 space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="p-6 bg-red-50/50 border-2 border-red-50 rounded-2xl">
                                        <DataField label="Visa Refusal Record" value={studentData.visaRefusal} options={["YES", "NO"]} isEditing={editMode.background} onChange={v => handleFieldChange('visaRefusal', v)} />
                                    </div>
                                    <div className="p-6 bg-blue-50/50 border-2 border-blue-50 rounded-2xl">
                                        <DataField label="Study Permit History" value={studentData.studyPermit} options={["YES", "NO"]} isEditing={editMode.background} onChange={v => handleFieldChange('studyPermit', v)} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detailed Background Narrative</label>
                                    <DataField label="" type="textarea" value={studentData.backgroundDetails} isEditing={editMode.background} onChange={v => handleFieldChange('backgroundDetails', v)} placeholder="Provide context on your academic or visa history..." />
                                </div>
                                {editMode.background && (
                                    <SectionFooter onSave={() => handleSaveEdit('background')} onCancel={() => handleCancelEdit('background')} />
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Documents */}
                    <section ref={uploadRef} className="scroll-mt-32 pb-20">
                        <div className="bg-white rounded-2xl shadow shadow-gray-200/50 border border-gray-50 overflow-hidden">
                            <SectionHeader
                                title="Secure Document Vault"
                                icon={FileText}
                                isEditing={false} // Upload is always active or handled differently
                            />

                            <div className="p-6 md:p-10 space-y-8">
                                {/* Upload Area - Simplified */}
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <div className="flex flex-col md:flex-row gap-4 items-end">
                                        <div className="flex-1 w-full space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Document Name</label>
                                            <input
                                                type="text"
                                                value={documentForm.documentName}
                                                onChange={(e) => setDocumentForm(v => ({ ...v, documentName: e.target.value }))}
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                                placeholder="e.g. Passport, Degree Certificate"
                                            />
                                        </div>
                                        <div className="w-full md:w-auto flex gap-3">
                                            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                                            <button
                                                onClick={() => fileInputRef.current.click()}
                                                className="flex-1 md:flex-none px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-bold uppercase hover:bg-gray-50 hover:border-blue-300 transition-all text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis"
                                            >
                                                {documentForm.selectedFile ? documentForm.selectedFile.name : "Select File"}
                                            </button>
                                            <button
                                                onClick={handleUploadSubmit}
                                                disabled={uploading}
                                                className="flex-1 md:flex-none px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-100"
                                            >
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Document List */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Uploaded Documents</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {studentData.documents?.length === 0 && (
                                            <p className="text-sm text-gray-400 italic">No documents uploaded yet.</p>
                                        )}
                                        {studentData.documents?.map((doc, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-blue-100 transition-all group">
                                                <div className="flex items-center gap-4 overflow-hidden">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                                                        <FileText className="w-5 h-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h6 className="text-sm font-bold text-gray-900 truncate">{doc.documentName}</h6>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{doc.documentType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 ml-2">
                                                    {doc.verified && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md">
                                                            <CheckCircle2 className="w-3 h-3" /> VERIFIED
                                                        </span>
                                                    )}
                                                    <a
                                                        href={doc.documentUrl?.startsWith('http') ? doc.documentUrl : `http://localhost:5000${doc.documentUrl?.startsWith('/') ? '' : '/'}${doc.documentUrl}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                        title="View Document"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => handleDeleteDocument(doc._id, e)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all relative z-50 cursor-pointer border border-transparent hover:border-red-100"
                                                        title="Delete Document"
                                                    >
                                                        <Trash2 className="w-4 h-4 pointer-events-none" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div >
            </div >

            {/* Notifications */}
            {
                (uploadSuccess || uploadError) && (
                    <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-right-10 duration-500">
                        <div className={`px-8 py-5 rounded-2xl shadow-2xl border font-black text-sm uppercase tracking-tight flex items-center gap-4 ${uploadSuccess ? 'bg-black text-white border-black' : 'bg-red-600 text-white border-red-600'}`}>
                            {uploadSuccess ? <CheckCircle2 className="w-6 h-6 text-green-400" /> : <Lock className="w-6 h-6" />}
                            {uploadSuccess || uploadError}
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl border border-gray-100">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900">Delete Document?</h3>
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to delete this document? This action cannot be undone.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clear Exam Confirmation Modal */}
            {clearExamType && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl border border-gray-100">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-gray-900">Clear Record?</h3>
                                <p className="text-sm text-gray-500">
                                    Are you sure you want to clear this {clearExamType.toUpperCase()} record? This action cannot be undone.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                <button
                                    onClick={() => setClearExamType(null)}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmClearExam}
                                    className="px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 shadow-lg shadow-red-200 transition-all transform active:scale-95"
                                >
                                    Clear Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div >
    );
};

export default StudentProfile;
