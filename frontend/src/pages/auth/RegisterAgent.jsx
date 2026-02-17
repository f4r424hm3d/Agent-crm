import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Building, Target, Award, FileText, CheckCircle2,
  Upload, X, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import apiClient from '../../services/apiClient';

const RegisterAgent = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  const [formData, setFormData] = useState({
    // Personal
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    // Company
    company_name: '',
    companyType: '', // specific to admin form, mapping to simple structure if needed or keeping as is
    registration_number: '',
    website: '',
    company_address: '', // mapped from address
    city: '',
    state: '', // extra
    country: 'India',

    // Professional
    years_of_experience: '',
    description: '', // mapped from additionalInfo/whyPartner?

    // Bank (Optional in admin, but user said ALL fields required for public? Let's check backend authController)
    // Backend authController expects: bank_name, account_number, etc.
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    ifsc_code: '',
    swift_code: '',

    // Docs
    documents: {
      idProof: null,
      companyLicence: null,
      agentPhoto: null,
      identityDocument: null,
      companyRegistration: null,
      resume: null,
      companyPhoto: null
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (fieldName, file) => {
    if (!file) {
      setFormData(prev => ({
        ...prev,
        documents: { ...prev.documents, [fieldName]: null }
      }));
      return;
    }

    const isPhoto = ['agentPhoto', 'companyPhoto'].includes(fieldName);
    const allowedTypes = isPhoto
      ? ['image/jpeg', 'image/jpg', 'image/png']
      : ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
      const allowed = isPhoto ? 'JPG, JPEG, PNG' : 'PDF';
      toast.error(`Invalid file type. Only ${allowed} files allowed.`);
      return;
    }

    const maxSize = isPhoto ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File size exceeds ${isPhoto ? '2MB' : '5MB'} limit`);
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
      case 1: // Account
        return formData.name && formData.email && formData.phone &&
          formData.password && formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 6;
      case 2: // Company
        return formData.company_name && formData.registration_number &&
          formData.website && formData.company_address &&
          formData.city && formData.country;
      case 3: // Professional (Experience + Desc)
        // Mapping admin fields to backend expected fields
        // Backend: years_of_experience, description
        return formData.years_of_experience && formData.description;
      case 4: // Bank Details (Backend requires these?)
        // Backend authController: bank_name, account_number...
        // User said "Public Registration -> All fields... strictly required".
        return formData.bank_name && formData.account_number &&
          formData.account_holder_name && formData.ifsc_code;
      case 5: // Documents
        return Object.values(formData.documents).every(doc => doc !== null);
      case 6: // Review
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps && isStepValid()) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else if (!isStepValid()) {
      if (currentStep === 1 && formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
      } else {
        toast.error("Please fill all required fields");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submitData = new FormData();

      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'documents' && key !== 'confirmPassword') {
          submitData.append(key, value);
        }
      });

      // Append documents
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) submitData.append(key, file);
      });

      const response = await apiClient.post('/auth/register-agent', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success("Registration successful! Please wait for admin approval.");
        navigate('/login'); // or pending page
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, title: 'Account', icon: User },
    { id: 2, title: 'Company', icon: Building },
    { id: 3, title: 'Profile', icon: Target },
    { id: 4, title: 'Banking', icon: Award }, // Using Award icon for now
    { id: 5, title: 'Documents', icon: FileText },
    { id: 6, title: 'Review', icon: CheckCircle2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 py-10 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="bg-emerald-600 p-8 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-white mb-2">Partner Registration</h1>
            <p className="text-emerald-100">Join our network of educational consultants</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-50 border-b border-gray-200 p-4">
          <div className="flex items-center justify-between relative max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full" />
            <div
              className="absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            />

            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.id} className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${currentStep === step.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg scale-110' :
                      currentStep > step.id ? 'bg-emerald-500 border-emerald-500 text-white' :
                        'bg-white border-gray-300 text-gray-400'
                    }`}>
                    {currentStep > step.id ? <CheckCircle2 size={20} /> : <StepIcon size={18} />}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-wide ${currentStep === step.id ? 'text-emerald-700' : 'text-gray-400'
                    }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 min-h-[500px] flex flex-col">
          <div className="flex-1">
            {/* Step 1: Account */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Create your Account</h2>
                  <p className="text-gray-500">Let's start with your login details.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Your Name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Mobile Number *</label>
                    <input type="tel" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="+91 99999 99999" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                  <input type="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="you@company.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Password *</label>
                    <input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Create password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Confirm Password *</label>
                    <input type="password" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Confirm password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Company */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Company Details</h2>
                  <p className="text-gray-500">Tell us about your organization.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Legal Company Name *</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Company Name Pvt Ltd" value={formData.company_name} onChange={e => handleInputChange('company_name', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Registration Number *</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="CIN / LLPIN / Reg No" value={formData.registration_number} onChange={e => handleInputChange('registration_number', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Website URL *</label>
                    <input type="url" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="https://www.example.com" value={formData.website} onChange={e => handleInputChange('website', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Office Address *</label>
                  <textarea required rows={2} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Full address of headquarters" value={formData.company_address} onChange={e => handleInputChange('company_address', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">City *</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="City" value={formData.city} onChange={e => handleInputChange('city', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Country *</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Country" value={formData.country} onChange={e => handleInputChange('country', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Professional */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Business Profile</h2>
                  <p className="text-gray-500">Your experience and background.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Years of Experience *</label>
                  <select required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                    value={formData.years_of_experience} onChange={e => handleInputChange('years_of_experience', e.target.value)}>
                    <option value="">Select Range</option>
                    <option value="0-2">0-2 Years</option>
                    <option value="3-5">3-5 Years</option>
                    <option value="5-10">5-10 Years</option>
                    <option value="10+">10+ Years</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Company Description *</label>
                  <textarea required rows={4} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                    placeholder="Briefly describe your agency's focus, student base, and services." value={formData.description} onChange={e => handleInputChange('description', e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 4: Banking */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Banking Information</h2>
                  <p className="text-gray-500">Required for commission payouts.</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Bank Name *</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Bank Name" value={formData.bank_name} onChange={e => handleInputChange('bank_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Account Holder Name *</label>
                  <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Same as Company Name" value={formData.account_holder_name} onChange={e => handleInputChange('account_holder_name', e.target.value)} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Account Number *</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="Account Number" value={formData.account_number} onChange={e => handleInputChange('account_number', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">IFSC Code *</label>
                    <input type="text" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="IFSC Code" value={formData.ifsc_code} onChange={e => handleInputChange('ifsc_code', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">SWIFT Code (Optional)</label>
                  <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="For International transfers" value={formData.swift_code} onChange={e => handleInputChange('swift_code', e.target.value)} />
                </div>
              </div>
            )}

            {/* Step 5: Documents */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Upload Documents</h2>
                  <p className="text-gray-500">All documents are strictly required for verification.</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { key: 'idProof', label: 'ID Proof (Aadhaar/Passport)', type: '.pdf' },
                    { key: 'companyLicence', label: 'Company Licence / Incorporation Cert', type: '.pdf' },
                    { key: 'agentPhoto', label: 'Your Profile Photo', type: '.jpg,.png' },
                    { key: 'companyPhoto', label: 'Office Photo', type: '.jpg,.png' },
                    { key: 'identityDocument', label: 'PAN Card / Tax ID', type: '.pdf' },
                    { key: 'companyRegistration', label: 'GST / Business Reg', type: '.pdf' },
                    { key: 'resume', label: 'Company Profile / Brochure (PDF)', type: '.pdf' },
                  ].map((doc) => (
                    <div key={doc.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-emerald-300 transition-colors bg-white">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{doc.label} <span className="text-red-500">*</span></p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.documents[doc.key] ?
                            <span className="text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={12} /> {formData.documents[doc.key].name}
                            </span>
                            : `Max 5MB (${doc.type})`
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                          <Upload size={14} /> Upload
                          <input type="file" accept={doc.type} className="hidden" onChange={(e) => handleFileUpload(doc.key, e.target.files[0])} />
                        </label>
                        {formData.documents[doc.key] && (
                          <button onClick={() => handleFileUpload(doc.key, null)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors">
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Review & Submit</h2>
                  <p className="text-gray-500">Please verify your details before submitting.</p>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800 mb-6">
                  <strong>Important:</strong> By submitting, you agree to our Terms of Service. Your application will be reviewed by our admin team. Expected response time: 24-48 hours.
                </div>

                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 border-b pb-2 mb-2">Personal & Account</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Name:</span> <span className="font-medium">{formData.name}</span>
                      <span className="text-gray-500">Email:</span> <span className="font-medium">{formData.email}</span>
                      <span className="text-gray-500">Phone:</span> <span className="font-medium">{formData.phone}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 border-b pb-2 mb-2">Company</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-500">Name:</span> <span className="font-medium">{formData.company_name}</span>
                      <span className="text-gray-500">Reg No:</span> <span className="font-medium">{formData.registration_number}</span>
                      <span className="text-gray-500">Website:</span> <span className="font-medium">{formData.website}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-gray-900 border-b pb-2 mb-2">Documents Status</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(formData.documents).map(([key, val]) => (
                        <React.Fragment key={key}>
                          <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className={`font-medium ${val ? 'text-emerald-600' : 'text-red-500'}`}>{val ? 'Attached' : 'Missing'}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer / Nav */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            {currentStep > 1 ? (
              <button type="button" onClick={prevStep} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps ? (
              <button type="button" onClick={nextStep} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl">
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</> : 'Submit Application'}
              </button>
            )}
          </div>
        </form>
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Login here</Link>
      </p>
    </div>
  );
};

export default RegisterAgent;
