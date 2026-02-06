import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Building,
    Mail,
    Phone,
    Globe,
    FileText,
    AlertCircle,
    Briefcase,
    GraduationCap,
    Award,
    Calendar,
    Target,
    Send,
    ArrowLeft
} from 'lucide-react';
import agentService from '../../services/agentService';
import { useToast } from '../../components/ui/toast';

const AdminCreateAgent = () => {
    const navigate = useNavigate();
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
        termsAccepted: true, // Auto-accept for admin creation? Or force them to check? Let's default true but visible.
        dataConsent: true
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const totalSteps = 5;

    const validateField = (name, value) => {
        let error = '';
        if (name === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                error = 'Please enter a valid email address';
            }
        }
        if (name === 'phone' || name === 'alternatePhone') {
            if (value && !/^\d+$/.test(value)) {
                error = 'Phone number must contain only digits';
            } else if (value && value.length < 10) {
                error = 'Phone number must be at least 10 digits';
            }
        }
        return error;
    };

    const handleInputChange = (field, value) => {
        const error = validateField(field, value);
        setErrors(prev => ({ ...prev, [field]: error }));

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleArrayChange = (field, value, checked) => {
        setFormData(prev => ({
            ...prev,
            [field]: checked
                ? [...prev[field], value]
                : prev[field].filter(item => item !== value)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prevent submission if not on the last step
        if (currentStep !== totalSteps) {
            nextStep();
            return;
        }

        // Final Validation Check
        if (errors.email || errors.phone) {
            toast.error("Please fix the errors before submitting.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Use agentService.createAgent which hits /api/agents (Admin Endpoint)
            await agentService.createAgent(formData);
            toast.success("Agent created and credentials sent!");
            navigate('/agents');
        } catch (error) {
            console.error("Submission error:", error);
            const msg = error.response?.data?.message || 'Failed to create agent.';
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

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

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex items-center">
                    <button onClick={() => navigate('/agents')} className="mr-4 text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Agent</h1>
                        <p className="text-gray-600">Admin Panel - Agent Registration Wizard</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-center sm:justify-between mb-4 flex-wrap">
                        {[1, 2, 3, 4, 5].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${step <= currentStep
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-600'
                                    }`}>
                                    {step}
                                </div>
                                {step < 5 && (
                                    <div className={`flex-1 h-1 mx-1 sm:mx-2 ${step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                                        } w-8 sm:w-12 md:w-16`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="text-center text-sm text-gray-600">
                        Step {currentStep} of {totalSteps}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <form onSubmit={handleSubmit}>
                        {/* Step 1: Personal Information */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <User className="w-6 h-6 text-blue-600 mr-3" />
                                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="email@example.com"
                                            />
                                        </div>
                                        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                                placeholder="9876543210"
                                            />
                                        </div>
                                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.alternatePhone}
                                            onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.alternatePhone ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="8765432109"
                                        />
                                    </div>
                                    {errors.alternatePhone && <p className="mt-1 text-sm text-red-600">{errors.alternatePhone}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Designation *</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                value={formData.designation}
                                                onChange={(e) => handleInputChange('designation', e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., Director"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience *</label>
                                        <select
                                            required
                                            value={formData.experience}
                                            onChange={(e) => handleInputChange('experience', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select experience</option>
                                            <option value="1-2 years">1-2 years</option>
                                            <option value="3-5 years">3-5 years</option>
                                            <option value="6-10 years">6-10 years</option>
                                            <option value="11-15 years">11-15 years</option>
                                            <option value="15+ years">15+ years</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Highest Qualification *</label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.qualification}
                                            onChange={(e) => handleInputChange('qualification', e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="e.g., MBA"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Company Information */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <Building className="w-6 h-6 text-blue-600 mr-3" />
                                    <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.companyName}
                                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter company name"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Type *</label>
                                        <select
                                            required
                                            value={formData.companyType}
                                            onChange={(e) => handleInputChange('companyType', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select company type</option>
                                            <option value="Private Limited">Private Limited</option>
                                            <option value="Public Limited">Public Limited</option>
                                            <option value="Partnership">Partnership</option>
                                            <option value="Proprietorship">Proprietorship</option>
                                            <option value="LLP">Limited Liability Partnership (LLP)</option>
                                            <option value="NGO">Non-Governmental Organization (NGO)</option>
                                            <option value="Trust">Trust</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
                                        <input
                                            type="text"
                                            value={formData.registrationNumber}
                                            onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Registration number"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Year Established *</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                required
                                                min="1950"
                                                max="2024"
                                                value={formData.establishedYear}
                                                onChange={(e) => handleInputChange('establishedYear', e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="2020"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="url"
                                                value={formData.website}
                                                onChange={(e) => handleInputChange('website', e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="https://example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address *</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={(e) => handleInputChange('address', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter complete business address"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="City"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                                        <select
                                            required
                                            value={formData.state}
                                            onChange={(e) => handleInputChange('state', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select state</option>
                                            {states.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">PIN Code *</label>
                                        <input
                                            type="text"
                                            required
                                            pattern="[0-9]{6}"
                                            value={formData.pincode}
                                            onChange={(e) => handleInputChange('pincode', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="123456"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Specialization & Services */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <Target className="w-6 h-6 text-blue-600 mr-3" />
                                    <h2 className="text-2xl font-bold text-gray-900">Specialization & Services</h2>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">Areas of Specialization *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {specializationOptions.map((spec) => (
                                            <label key={spec} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.specialization.includes(spec)}
                                                    onChange={(e) => handleArrayChange('specialization', spec, e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{spec}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-4">Services Offered *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {servicesOptions.map((service) => (
                                            <label key={service} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.servicesOffered.includes(service)}
                                                    onChange={(e) => handleArrayChange('servicesOffered', service, e.target.checked)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{service}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Students *</label>
                                        <select
                                            required
                                            value={formData.currentStudents}
                                            onChange={(e) => handleInputChange('currentStudents', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select range</option>
                                            <option value="1-50">1-50 students</option>
                                            <option value="51-100">51-100 students</option>
                                            <option value="101-250">101-250 students</option>
                                            <option value="251-500">251-500 students</option>
                                            <option value="500+">500+ students</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Team Size *</label>
                                        <select
                                            required
                                            value={formData.teamSize}
                                            onChange={(e) => handleInputChange('teamSize', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select size</option>
                                            <option value="1-5">1-5 members</option>
                                            <option value="6-10">6-10 members</option>
                                            <option value="11-25">11-25 members</option>
                                            <option value="26-50">26-50 members</option>
                                            <option value="50+">50+ members</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue</label>
                                        <select
                                            value={formData.annualRevenue}
                                            onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
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

                        {/* Step 4: Partnership Details */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <Award className="w-6 h-6 text-blue-600 mr-3" />
                                    <h2 className="text-2xl font-bold text-gray-900">Partnership Details</h2>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Partnership Type *</label>
                                    <select
                                        required
                                        value={formData.partnershipType}
                                        onChange={(e) => handleInputChange('partnershipType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select partnership type</option>
                                        <option value="Authorized Representative">Authorized Representative</option>
                                        <option value="Regional Partner">Regional Partner</option>
                                        <option value="Exclusive Partner">Exclusive Partner</option>
                                        <option value="Referral Partner">Referral Partner</option>
                                        <option value="Franchise Partner">Franchise Partner</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Expected Students per Year *</label>
                                        <select
                                            required
                                            value={formData.expectedStudents}
                                            onChange={(e) => handleInputChange('expectedStudents', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select range</option>
                                            <option value="10-25">10-25 students</option>
                                            <option value="26-50">26-50 students</option>
                                            <option value="51-100">51-100 students</option>
                                            <option value="101-200">101-200 students</option>
                                            <option value="200+">200+ students</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Budget (Annual)</label>
                                        <select
                                            value={formData.marketingBudget}
                                            onChange={(e) => handleInputChange('marketingBudget', e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select budget</option>
                                            <option value="Under 1 Lakh">Under ₹1 Lakh</option>
                                            <option value="1-5 Lakhs">₹1-5 Lakhs</option>
                                            <option value="5-10 Lakhs">₹5-10 Lakhs</option>
                                            <option value="10-25 Lakhs">₹10-25 Lakhs</option>
                                            <option value="25+ Lakhs">₹25+ Lakhs</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Why do you want to partner with us? *</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={formData.whyPartner}
                                        onChange={(e) => handleInputChange('whyPartner', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Explain your motivation..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">References (Previous Partners/Clients)</label>
                                    <textarea
                                        rows={3}
                                        value={formData.references}
                                        onChange={(e) => handleInputChange('references', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Reference contact details..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                                    <textarea
                                        rows={3}
                                        value={formData.additionalInfo}
                                        onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Any additional information..."
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 5: Terms & Submit */}
                        {currentStep === 5 && (
                            <div className="space-y-6">
                                <div className="flex items-center mb-6">
                                    <FileText className="w-6 h-6 text-blue-600 mr-3" />
                                    <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Summary (Admin Review)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Name:</span>
                                            <span className="ml-2 text-gray-600">{formData.firstName} {formData.lastName}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Company:</span>
                                            <span className="ml-2 text-gray-600">{formData.companyName}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Location:</span>
                                            <span className="ml-2 text-gray-600">{formData.city}, {formData.state}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Partnership Type:</span>
                                            <span className="ml-2 text-gray-600">{formData.partnershipType}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={formData.termsAccepted}
                                            onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">
                                            Confirm Terms & Conditions accepted on behalf of Agent.
                                        </span>
                                    </label>

                                    <label className="flex items-start">
                                        <input
                                            type="checkbox"
                                            required
                                            checked={formData.dataConsent}
                                            onChange={(e) => handleInputChange('dataConsent', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                                        />
                                        <span className="ml-3 text-sm text-gray-700">
                                            Confirm Data Consent obtained.
                                        </span>
                                    </label>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                                        <div className="text-sm text-blue-800">
                                            <p className="font-medium mb-1">Creation & Automatic Approval:</p>
                                            <p>Clicking Submit will:</p>
                                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                                <li>Create the agent account immediately</li>
                                                <li>Mark status as Active and Approved</li>
                                                <li>Generate a secure password</li>
                                                <li>Send login credentials to <strong>{formData.email}</strong></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-8 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className={`px-6 py-3 rounded-lg font-medium ${currentStep === 1
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Previous
                            </button>

                            {currentStep < totalSteps ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Next Step
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !formData.termsAccepted || !formData.dataConsent}
                                    className={`px-8 py-3 rounded-lg font-medium flex items-center ${isSubmitting || !formData.termsAccepted || !formData.dataConsent
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating Agent...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Create Agent & Send Credentials
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

export default AdminCreateAgent;
