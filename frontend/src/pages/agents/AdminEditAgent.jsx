import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, Check, AlertCircle, Upload, X,
    User, Building, Target, Award, FileText, CheckCircle2,
    Lock, Eye, EyeOff, Loader2
} from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import agentService from '../../services/agentService';

const AdminEditAgent = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const toast = useToast();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        companyName: '',
        companyType: '',
        registrationNumber: '',
        establishedYear: '',
        website: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        designation: '',
        experience: '',
        qualification: '',
        specialization: [],
        currentStudents: '',
        annualRevenue: '',
        teamSize: '',
        servicesOffered: [],
        partnershipType: '',
        expectedStudents: '',
        marketingBudget: '',
        references: '',
        whyPartner: '',
        additionalInfo: '',
        termsAccepted: true,
        dataConsent: true,
        documents: {
            idProof: null,
            companyLicence: null,
            agentPhoto: null,
            identityDocument: null,
            companyRegistration: null,
            resume: null,
            companyPhoto: null
        },
        newPassword: '' // Optional password change
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const totalSteps = 6;

    // Load Agent Data
    useEffect(() => {
        const fetchAgent = async () => {
            try {
                if (!id) return;
                const response = await agentService.getAgentById(id);
                const agent = response.data?.agent || response.agent || response.data || response;

                if (agent) {
                    // Normalize arrays if they come as strings
                    const normalizeArray = (val) => {
                        if (Array.isArray(val)) return val;
                        if (typeof val === 'string') {
                            try { return JSON.parse(val); } catch { return []; }
                        }
                        return [];
                    };

                    setFormData(prev => ({
                        ...prev,
                        ...agent,
                        specialization: normalizeArray(agent.specialization),
                        servicesOffered: normalizeArray(agent.servicesOffered),
                        documents: {
                            ...prev.documents,
                            ...(agent.documents || {})
                        },
                        newPassword: '' // Reset password field
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch agent", error);
                toast.error("Failed to load agent details");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAgent();
    }, [id]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, value, checked) => {
        const updated = checked
            ? [...formData[field], value]
            : formData[field].filter(item => item !== value);
        setFormData(prev => ({ ...prev, [field]: updated }));
    };

    const handleFileUpload = (fieldName, file) => {
        // If file is null, we are removing it
        if (!file) {
            setFormData(prev => ({
                ...prev,
                documents: { ...prev.documents, [fieldName]: null }
            }));
            return;
        }

        // Validate file type
        const isPhoto = ['agentPhoto', 'companyPhoto'].includes(fieldName);
        const allowedTypes = isPhoto
            ? ['image/jpeg', 'image/jpg', 'image/png']
            : ['application/pdf'];

        if (!allowedTypes.includes(file.type)) {
            const allowed = isPhoto ? 'JPG, JPEG, PNG' : 'PDF';
            toast.error(`Invalid file type. Only ${allowed} files allowed.`);
            return;
        }

        // Validate file size
        const maxSize = isPhoto ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
            const sizeLabel = isPhoto ? '2MB' : '5MB';
            toast.error(`File size exceeds ${sizeLabel} limit`);
            return;
        }

        setFormData(prev => ({
            ...prev,
            documents: { ...prev.documents, [fieldName]: file }
        }));
        toast.success(`${fieldName.replace(/([A-Z])/g, ' $1').trim()} attached`);
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                return formData.firstName && formData.lastName && formData.email &&
                    formData.phone && formData.qualification && formData.designation &&
                    formData.experience;
            case 2:
                const currentYear = new Date().getFullYear();
                const year = parseInt(formData.establishedYear);
                const isYearValid = year && year <= currentYear && year >= 1900;
                return formData.companyName && formData.companyType && isYearValid &&
                    formData.address && formData.city && formData.state && formData.pincode;
            case 3:
                return formData.specialization.length > 0 && formData.servicesOffered.length > 0 &&
                    formData.currentStudents && formData.teamSize;
            case 4:
                return formData.partnershipType && formData.expectedStudents && formData.whyPartner;
            case 5:
                // Documents are optional
                return true;
            case 6:
                return true;
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps && isStepValid()) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        } else if (!isStepValid()) {
            toast.error("Please fill all required fields");
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            window.scrollTo(0, 0);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let finalDocuments = { ...formData.documents };
            const newFilesToUpload = [];

            // Identify new files that need uploading
            Object.entries(formData.documents).forEach(([key, value]) => {
                if (value instanceof File) {
                    newFilesToUpload.push({ key, file: value });
                }
            });

            if (newFilesToUpload.length > 0) {
                const docFormData = new FormData();
                // We don't need to append name/tempAgentId here as the backend service handles it based on the agent ID passed in URL
                // The new route is /agents/:id/documents/bulk

                newFilesToUpload.forEach(({ key, file }) => {
                    docFormData.append(key, file);
                });

                // Use the standardized service method
                const uploadResponse = await agentService.uploadBulkDocuments(id, docFormData);

                if (uploadResponse.success || uploadResponse.data?.success) {
                    // Merge new paths with existing ones
                    // The response usually returns structure like { documentPaths: { idProof: "url", ... } }
                    const newPaths = uploadResponse.data?.documentPaths || uploadResponse.documentPaths || {};
                    finalDocuments = {
                        ...finalDocuments,
                        ...newPaths
                    };
                    toast.success('New documents uploaded successfully');
                }
            }

            // Prepare final submission data
            const submissionData = {
                ...formData,
                documents: finalDocuments
            };

            // Remove File objects if any remain (paranoid check)
            Object.keys(submissionData.documents).forEach(key => {
                if (submissionData.documents[key] instanceof File) {
                    delete submissionData.documents[key];
                }
            });

            // Update agent
            await agentService.updateAgent(id, submissionData);
            toast.success("Agent updated successfully!");
            navigate('/agents');
        } catch (error) {
            console.error("Update failed", error);
            const msg = error.response?.data?.message || 'Failed to update agent.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const steps = [
        { id: 1, title: 'Personal', icon: User },
        { id: 2, title: 'Company', icon: Building },
        { id: 3, title: 'Expertise', icon: Target },
        { id: 4, title: 'Partnership', icon: Award },
        { id: 5, title: 'Documents', icon: FileText },
        { id: 6, title: 'Review', icon: CheckCircle2 }
    ];

    const states = [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
        'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
        'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
        'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    const specializationOptions = [
        'MBBS Admissions', 'Medical Counseling', 'Visa Assistance', 'International Admissions',
        'Student Support', 'Career Guidance', 'NEET Coaching', 'Abroad Studies', 'Scholarship Guidance',
        'University Partnerships', 'Student Mentoring', 'Documentation', 'Pre-departure Support'
    ];

    const servicesOptions = [
        'Admission Counseling', 'Visa Processing', 'Accommodation Assistance', 'Travel Arrangements',
        'Document Verification', 'Scholarship Guidance', 'Career Counseling', 'Test Preparation',
        'University Selection', 'Application Processing', 'Financial Planning', 'Post-arrival Support'
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-4" />
                    <p className="text-gray-500 font-medium">Loading agent details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <button onClick={() => navigate('/agents')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-4 transition-colors group">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Back to Agents List
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Agent: {formData.firstName} {formData.lastName}</h1>
                        <p className="text-gray-500 mt-1">Update agent information and documents.</p>
                    </div>
                </div>

                {/* Horizontal Stepper */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between relative">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        />

                        {steps.map((step) => {
                            const StepIcon = step.icon;
                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep === step.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg' :
                                        currentStep > step.id ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-200 text-gray-400'
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle2 size={20} /> : <StepIcon size={18} />}
                                    </div>
                                    <span className={`absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${currentStep === step.id ? 'text-emerald-600' : 'text-gray-400'
                                        }`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 md:p-10">
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-b border-gray-100 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                                    <p className="text-sm text-gray-500">Update agent's official contact details.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">First Name *</label>
                                        <input type="text" required value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="John" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Last Name *</label>
                                        <input type="text" required value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                                        <input type="email" required value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="john@example.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                                        <input type="tel" required value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="+91 00000 00000" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Alternate Phone</label>
                                        <input type="tel" value={formData.alternatePhone} onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="Optional" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Highest Qualification *</label>
                                        <input type="text" required value={formData.qualification} onChange={(e) => handleInputChange('qualification', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="e.g. MBA, B.Tech" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Designation *</label>
                                        <input type="text" required value={formData.designation} onChange={(e) => handleInputChange('designation', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="CEO / Manager" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Years of Experience *</label>
                                        <select required value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none cursor-pointer">
                                            <option value="">Select experience</option>
                                            <option value="1-2 years">1-2 years</option>
                                            <option value="3-5 years">3-5 years</option>
                                            <option value="6-10 years">6-10 years</option>
                                            <option value="11-15 years">11-15 years</option>
                                            <option value="15+ years">15+ years</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Password Change Field (Edit Only) */}
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mt-4">
                                    <div className="flex items-center mb-3">
                                        <Lock className="w-5 h-5 text-amber-600 mr-2" />
                                        <span className="text-sm font-bold text-amber-900 uppercase tracking-wide">Change Password (Optional)</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.newPassword}
                                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                            placeholder="Enter new credentials"
                                            className="w-full px-4 py-3 bg-white border border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none pr-12 text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-[11px] text-amber-700 font-medium italic">Leave blank to keep existing password.</p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Company Information */}
                        {currentStep === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-b border-gray-100 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Company Details</h2>
                                    <p className="text-sm text-gray-500">Information about the business or agency.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Legal Company Name *</label>
                                    <input type="text" required value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="Enter company name" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Company Type *</label>
                                        <select required value={formData.companyType} onChange={(e) => handleInputChange('companyType', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none">
                                            <option value="">Select type</option>
                                            <option value="Private Limited">Private Limited</option>
                                            <option value="Public Limited">Public Limited</option>
                                            <option value="Partnership">Partnership</option>
                                            <option value="Proprietorship">Proprietorship</option>
                                            <option value="LLP">LLP</option>
                                            <option value="NGO">NGO / Trust</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Registration Number</label>
                                        <input type="text" value={formData.registrationNumber} onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="Regn. Id" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Year Established *</label>
                                        <input type="number" required value={formData.establishedYear} onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                                            className={`w-full px-4 py-3 bg-white border ${formData.establishedYear && (parseInt(formData.establishedYear) > new Date().getFullYear() || parseInt(formData.establishedYear) < 1900) ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-emerald-500'} rounded-lg focus:ring-2 focus:ring-emerald-500/20 text-gray-900 outline-none transition-all`} placeholder="e.g. 2018" />
                                        {formData.establishedYear && parseInt(formData.establishedYear) > new Date().getFullYear() && (
                                            <p className="text-[10px] text-red-500 font-bold">Cannot be in the future</p>
                                        )}
                                        {formData.establishedYear && parseInt(formData.establishedYear) < 1900 && (
                                            <p className="text-[10px] text-red-500 font-bold">Enter a valid year</p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Company Website</label>
                                        <input type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all" placeholder="https://www.example.com" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Office Address *</label>
                                    <textarea required rows={2} value={formData.address} onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none transition-all resize-none" placeholder="Full business address" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">City *</label>
                                        <input type="text" required value={formData.city} onChange={(e) => handleInputChange('city', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none" placeholder="City" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">State *</label>
                                        <select required value={formData.state} onChange={(e) => handleInputChange('state', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none">
                                            <option value="">Select State</option>
                                            {states.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">PIN Code *</label>
                                        <input type="text" required pattern="[0-9]{6}" value={formData.pincode} onChange={(e) => handleInputChange('pincode', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none" placeholder="6-digit PIN" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Expertise & Reach */}
                        {currentStep === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-b border-gray-100 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Expertise & Reach</h2>
                                    <p className="text-sm text-gray-500">Highlight specializations and operational scale.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Areas of Specialization *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {specializationOptions.map(opt => (
                                            <label key={opt} className={`flex items-center p-2.5 rounded-lg border transition-all cursor-pointer ${formData.specialization.includes(opt) ? 'bg-emerald-50 border-emerald-400' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                }`}>
                                                <input type="checkbox" checked={formData.specialization.includes(opt)} onChange={(e) => handleArrayChange('specialization', opt, e.target.checked)} className="hidden" />
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2.5 ${formData.specialization.includes(opt) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-300'
                                                    }`}>
                                                    {formData.specialization.includes(opt) && <CheckCircle2 size={12} />}
                                                </div>
                                                <span className={`text-[12px] font-medium ${formData.specialization.includes(opt) ? 'text-emerald-900' : 'text-gray-600'}`}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">Services Offered *</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {servicesOptions.map(opt => (
                                            <label key={opt} className={`flex items-center p-2.5 rounded-lg border transition-all cursor-pointer ${formData.servicesOffered.includes(opt) ? 'bg-emerald-50 border-emerald-400' : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                }`}>
                                                <input type="checkbox" checked={formData.servicesOffered.includes(opt)} onChange={(e) => handleArrayChange('servicesOffered', opt, e.target.checked)} className="hidden" />
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2.5 ${formData.servicesOffered.includes(opt) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-gray-300'
                                                    }`}>
                                                    {formData.servicesOffered.includes(opt) && <CheckCircle2 size={12} />}
                                                </div>
                                                <span className={`text-[12px] font-medium ${formData.servicesOffered.includes(opt) ? 'text-emerald-900' : 'text-gray-600'}`}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Student Base *</label>
                                        <select required value={formData.currentStudents} onChange={(e) => handleInputChange('currentStudents', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 text-sm">
                                            <option value="">Select range</option>
                                            <option value="1-50">1-50 students</option>
                                            <option value="51-100">51-100 students</option>
                                            <option value="101-250">101-250 students</option>
                                            <option value="251-500">251-500 students</option>
                                            <option value="500+">500+ students</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Team Size *</label>
                                        <select required value={formData.teamSize} onChange={(e) => handleInputChange('teamSize', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 text-sm">
                                            <option value="">Select size</option>
                                            <option value="1-5">1-5 members</option>
                                            <option value="6-10">6-10 members</option>
                                            <option value="11-25">11-25 members</option>
                                            <option value="26-50">26-50 members</option>
                                            <option value="50+">50+ members</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Annual Revenue</label>
                                        <select value={formData.annualRevenue} onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 text-sm">
                                            <option value="">Select range</option>
                                            <option value="Under 10 Lakhs">Under ₹10 Lakhs</option>
                                            <option value="10-25 Lakhs">₹10-25 Lakhs</option>
                                            <option value="25-50 Lakhs">₹25-50 Lakhs</option>
                                            <option value="50 Lakhs - 1 Crore">₹50 Lakhs - 1 Crore</option>
                                            <option value="1-5 Crores">₹1-5 Crores</option>
                                            <option value="5+ Crores">₹5+ Crores</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Partnership Intent */}
                        {currentStep === 4 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-b border-gray-100 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Partnership Intent</h2>
                                    <p className="text-sm text-gray-500">Share the vision for collaboration.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Partnership Type *</label>
                                        <select required value={formData.partnershipType} onChange={(e) => handleInputChange('partnershipType', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900">
                                            <option value="">Select type</option>
                                            <option value="Authorized Representative">Authorized Representative</option>
                                            <option value="Regional Partner">Regional Partner</option>
                                            <option value="Referral Partner">Referral Partner</option>
                                            <option value="Franchise Partner">Franchise Partner</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Students Target/Year *</label>
                                        <select required value={formData.expectedStudents} onChange={(e) => handleInputChange('expectedStudents', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900">
                                            <option value="">Select range</option>
                                            <option value="10-25">10-25 students</option>
                                            <option value="26-50">26-50 students</option>
                                            <option value="51-100">51-100 students</option>
                                            <option value="100+">100+ students</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Annual Marketing Budget</label>
                                        <select value={formData.marketingBudget} onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900">
                                            <option value="">Select budget</option>
                                            <option value="Under 1 Lakh">Under ₹1 Lakh</option>
                                            <option value="1-5 Lakhs">₹1-5 Lakhs</option>
                                            <option value="5-10 Lakhs">₹5-10 Lakhs</option>
                                            <option value="10+ Lakhs">₹10+ Lakhs</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700">Any Additional Info</label>
                                        <input type="text" value={formData.additionalInfo} onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none" placeholder="Notes..." />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Why partner with us? *</label>
                                    <textarea required rows={3} value={formData.whyPartner} onChange={(e) => handleInputChange('whyPartner', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none resize-none" placeholder="Briefly describe the motivation" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Professional References</label>
                                    <textarea rows={2} value={formData.references} onChange={(e) => handleInputChange('references', e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-gray-900 outline-none resize-none" placeholder="Ref contact details" />
                                </div>
                            </div>
                        )}

                        {/* Step 5: Documents (Optional) */}
                        {currentStep === 5 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-b border-gray-100 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Upload Documents</h2>
                                    <p className="text-sm text-gray-500">Update or add documents. Existing files are preserved unless replaced.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'idProof', label: 'ID Proof (Aadhaar/PAN/Passport)', type: 'pdf', hint: 'Max 5MB' },
                                        { key: 'companyLicence', label: 'Company Licence', type: 'pdf', hint: 'Max 5MB' },
                                        { key: 'agentPhoto', label: 'Agent Photo', type: 'image', hint: 'JPG, PNG - Max 2MB' },
                                        { key: 'companyPhoto', label: 'Company Photo', type: 'image', hint: 'JPG, PNG - Max 2MB' },
                                        { key: 'identityDocument', label: 'Identity Document', type: 'pdf', hint: 'Max 5MB' },
                                        { key: 'companyRegistration', label: 'Company Registration', type: 'pdf', hint: 'Max 5MB' },
                                        { key: 'resume', label: 'Resume / CV', type: 'pdf', hint: 'Max 5MB' },
                                    ].map((doc) => {
                                        const fileValue = formData.documents[doc.key];
                                        const isString = typeof fileValue === 'string';
                                        const isFile = fileValue instanceof File;

                                        return (
                                            <div key={doc.key} className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-700">{doc.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept={doc.type === 'image' ? ".jpg,.jpeg,.png" : ".pdf"}
                                                        onChange={(e) => handleFileUpload(doc.key, e.target.files[0])}
                                                        className="hidden"
                                                        id={doc.key}
                                                    />
                                                    <label htmlFor={doc.key} className={`flex items-center justify-center w-full px-4 py-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${fileValue ? 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                                                        }`}>
                                                        <div className="text-center">
                                                            <Upload className={`mx-auto h-8 w-8 mb-2 ${fileValue ? 'text-emerald-600' : 'text-gray-400'}`} />
                                                            <p className="text-sm text-gray-600 truncate max-w-[200px] mx-auto">
                                                                {isFile ? fileValue.name : (isString ? 'Current File Uploaded' : `Click to upload ${doc.type.toUpperCase()}`)}
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {isFile ? 'New File' : (isString ? <a href={fileValue} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline" onClick={(e) => e.stopPropagation()}>View Current File</a> : doc.hint)}
                                                            </p>
                                                        </div>
                                                    </label>
                                                    {fileValue && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleFileUpload(doc.key, null)}
                                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
                                                            title="Remove file"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Step 6: Review */}
                        {currentStep === 6 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="border-b border-gray-100 pb-4">
                                    <h2 className="text-xl font-bold text-gray-900">Review & Update</h2>
                                    <p className="text-sm text-gray-500">Review all details before updating the agent profile.</p>
                                </div>

                                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-4">Primary Contact</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shrink-0">
                                                        <User size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{formData.firstName} {formData.lastName}</p>
                                                        <p className="text-xs text-gray-500">{formData.designation}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shrink-0">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                    <p className="text-sm text-gray-600">{formData.email}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shrink-0">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                    <p className="text-sm text-gray-600">{formData.phone}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-4">Organization</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shrink-0">
                                                        <Building size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{formData.companyName}</p>
                                                        <p className="text-xs text-gray-500">{formData.companyType}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-emerald-600 shrink-0">
                                                        <Award size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{formData.partnershipType}</p>
                                                        <p className="text-xs text-gray-500">{formData.city}, {formData.country}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                                    <AlertCircle className="text-blue-600 mt-0.5 shrink-0" size={20} />
                                    <div>
                                        <h5 className="text-sm font-bold text-blue-800">Processing Update</h5>
                                        <p className="text-xs text-blue-700 mt-1">
                                            Clicking "Update Agent" will save changes immediately. If you uploaded new documents, they will replace old ones.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1 || isSubmitting}
                                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                Previous Step
                            </button>

                            {currentStep < 6 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                >
                                    Next Step
                                    <ArrowRight size={16} />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`px-8 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all ${isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-emerald-700 hover:shadow-xl'}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            Update Agent
                                            <Check size={16} />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditAgent;
