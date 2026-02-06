import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ArrowLeft, Save, ArrowRight, Check } from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import studentService from '../../services/studentService';

const StudentForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(isEditMode);

  const generalRef = useRef(null);
  const educationRef = useRef(null);
  const testScoresRef = useRef(null);
  const backgroundRef = useRef(null);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    c_code: '91',
    father: '',
    mother: '',
    dob: '',
    first_language: '',
    nationality: '',
    passport_number: '',
    passport_expiry: '',
    marital_status: 'Single',
    gender: 'Male',
    home_address: '',
    city: '',
    state: '',
    country: '',
    zipcode: '',
    home_contact_number: '',
    referredBy: '',
    // Education
    education_country: '',
    highest_level: '',
    grading_scheme: '',
    grade_average: '',
    // Test Scores
    exam_type: '',
    exam_date: '',
    listening_score: '',
    reading_score: '',
    writing_score: '',
    speaking_score: '',
    overall_score: '',
    // Background
    visa_refusal: '',
    study_permit: '',
    background_details: '',
  });

  // Fetch data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchStudentData();
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        referredBy: user.id || user._id || user.email || 'SELF'
      }));
    }
  }, [id, user]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await studentService.getStudentById(id);
      const student = response?.data?.student || response?.data;

      if (student) {
        setFormData({
          firstName: student.firstName || '',
          lastName: student.lastName || '',
          email: student.email || '',
          mobile: student.phone || student.mobile || '',
          c_code: student.countryCode || student.c_code || '91',
          father: student.fatherName || student.father || '',
          mother: student.motherName || student.mother || '',
          dob: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : (student.dob ? student.dob.split('T')[0] : ''),
          first_language: student.firstLanguage || student.first_language || '',
          nationality: student.nationality || '',
          passport_number: student.passportNumber || student.passport_number || '',
          passport_expiry: student.passportExpiry ? student.passportExpiry.split('T')[0] : (student.passport_expiry ? student.passport_expiry.split('T')[0] : ''),
          marital_status: student.maritalStatus || student.marital_status || 'Single',
          gender: student.gender || 'Male',
          home_address: student.address || student.home_address || '',
          city: student.city || '',
          state: student.state || '',
          country: student.country || '',
          zipcode: student.postalCode || student.zipcode || '',
          home_contact_number: student.home_contact_number || '',
          referredBy: student.referredBy || '',
          // Education
          education_country: student.educationCountry || student.education_country || '',
          highest_level: student.highestLevel || student.highest_level || '',
          grading_scheme: student.gradingScheme || student.grading_scheme || '',
          grade_average: student.gradeAverage || student.grade_average || '',
          // Test Scores
          exam_type: student.examType || student.exam_type || '',
          exam_date: student.examDate ? student.examDate.split('T')[0] : (student.exam_date ? student.exam_date.split('T')[0] : ''),
          listening_score: student.listeningScore || student.listening_score || '',
          reading_score: student.readingScore || student.reading_score || '',
          writing_score: student.writingScore || student.writing_score || '',
          speaking_score: student.speakingScore || student.speaking_score || '',
          overall_score: student.overallScore || student.overall_score || '',
          // Background
          visa_refusal: student.visaRefusal || student.visa_refusal || '',
          study_permit: student.studyPermit || student.study_permit || '',
          background_details: student.backgroundDetails || student.background_details || '',
        });
      }
    } catch (err) {
      console.error('Error fetching student:', err);
      toast.error('Failed to load student data');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveStep = async () => {
    // In edit mode, we can optionally save current step, 
    // but for now let's just toast success as placeholder for progress
    toast.success(`Step ${currentStep} progress saved locally!`);
  };

  const handleNext = async () => {
    await handleSaveStep();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinalSubmit = async () => {
    try {
      // Map frontend fields to backend expected fields
      const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.mobile,
        countryCode: formData.c_code,
        fatherName: formData.father,
        motherName: formData.mother,
        dateOfBirth: formData.dob,
        firstLanguage: formData.first_language,
        nationality: formData.nationality,
        passportNumber: formData.passport_number,
        passportExpiry: formData.passport_expiry,
        maritalStatus: formData.marital_status,
        gender: formData.gender,
        address: formData.home_address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.zipcode,
        home_contact_number: formData.home_contact_number,
        referredBy: formData.referredBy,
        // Education
        educationCountry: formData.education_country,
        highestLevel: formData.highest_level,
        gradingScheme: formData.grading_scheme,
        gradeAverage: formData.grade_average,
        // Test Scores
        examType: formData.exam_type,
        examDate: formData.exam_date,
        listeningScore: formData.listening_score,
        readingScore: formData.reading_score,
        writingScore: formData.writing_score,
        speakingScore: formData.speaking_score,
        overallScore: formData.overall_score,
        // Background
        visaRefusal: formData.visa_refusal,
        studyPermit: formData.study_permit,
        backgroundDetails: formData.background_details,
      };

      if (isEditMode) {
        await studentService.updateStudent(id, submissionData);
        toast.success('Student updated successfully!');
      } else {
        await studentService.createStudent(submissionData);
        toast.success('Student created successfully!');
      }

      setTimeout(() => {
        navigate('/students');
      }, 1000);
    } catch (err) {
      console.error('Submission error:', err);
      toast.error(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} student`);
    }
  };

  // Static data (same as CreateStudent)
  const countriesData = [
    { code: 'IN', name: 'INDIA' },
    { code: 'US', name: 'UNITED STATES' },
    { code: 'GB', name: 'UNITED KINGDOM' },
    { code: 'CA', name: 'CANADA' },
    { code: 'AU', name: 'AUSTRALIA' },
  ];

  const phoneCode = [
    { phonecode: '1' },
    { phonecode: '7' },
    { phonecode: '44' },
    { phonecode: '61' },
    { phonecode: '91' },
  ];

  const steps = [
    { number: 1, title: 'Personal Info', ref: generalRef },
    { number: 2, title: 'Education', ref: educationRef },
    { number: 3, title: 'Test Scores', ref: testScoresRef },
    { number: 4, title: 'Background', ref: backgroundRef },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/students')}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Student' : 'Create New Student'}
            </h1>
            <p className="text-gray-600 text-sm mt-1">Step {currentStep} of 4 - {steps[currentStep - 1].title}</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : currentStep === step.number
                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                    : 'bg-gray-200 text-gray-500'
                  }`}>
                  {currentStep > step.number ? <Check size={20} /> : step.number}
                </div>
                <span className={`text-sm mt-2 font-medium ${currentStep === step.number ? 'text-indigo-600' : 'text-gray-500'
                  }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded transition-all ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div ref={generalRef}>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-indigo-700">👤 Personal Information</h3>
              <p className="text-gray-500 text-sm mt-1">Fill in the student's personal and passport details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
                <div className="flex">
                  <select
                    name="c_code"
                    value={formData.c_code}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-l-lg p-3"
                  >
                    {phoneCode.map((code, idx) => (
                      <option key={idx} value={code.phonecode}>+{code.phonecode}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="border-y border-r border-gray-300 rounded-r-lg p-3 w-full"
                  />
                </div>
              </div>

              {/* Referral Display */}
              <div className="col-span-2 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <label className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">Referral Tracking</label>
                <p className="text-sm font-medium text-gray-700">Student is referred by: <span className="text-indigo-700 font-bold">{formData.referredBy || 'Direct'}</span></p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Father's Name</label>
                <input type="text" name="father" value={formData.father} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mother's Name</label>
                <input type="text" name="mother" value={formData.mother} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                <select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3">
                  <option value="">Select country</option>
                  {countriesData.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                <input type="text" name="passport_number" value={formData.passport_number} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passport Expiry</label>
                <input type="date" name="passport_expiry" value={formData.passport_expiry} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" />
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-indigo-700 mb-4">📍 Address Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Home Address</label>
                  <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
                <input type="text" name="state" placeholder="State/Province" value={formData.state} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
                <select name="country" value={formData.country} onChange={handleChange} className="border border-gray-300 rounded-lg p-3">
                  <option value="">Select country</option>
                  {countriesData.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
                </select>
                <input type="text" name="zipcode" placeholder="Zip Code" value={formData.zipcode} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Education */}
        {currentStep === 2 && (
          <div ref={educationRef}>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-indigo-700">🎓 Education History</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <select name="education_country" value={formData.education_country} onChange={handleChange} className="border border-gray-300 rounded-lg p-3">
                <option value="">Education Country</option>
                {countriesData.map(c => <option key={c.code} value={c.name}>{c.name}</option>)}
              </select>
              <select name="highest_level" value={formData.highest_level} onChange={handleChange} className="border border-gray-300 rounded-lg p-3">
                <option value="">Highest Level</option>
                <option>Under-Graduate</option>
                <option>Post-Graduate</option>
                <option>Diploma</option>
              </select>
              <select name="grading_scheme" value={formData.grading_scheme} onChange={handleChange} className="border border-gray-300 rounded-lg p-3">
                <option value="">Grading Scheme</option>
                <option>Percentage</option>
                <option>CGPA</option>
              </select>
              <input type="text" name="grade_average" placeholder="Grade Average" value={formData.grade_average} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
            </div>
          </div>
        )}

        {/* Step 3: Test Scores */}
        {currentStep === 3 && (
          <div ref={testScoresRef}>
            <h3 className="text-2xl font-semibold text-indigo-700 mb-6">🎯 Test Scores</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <select name="exam_type" value={formData.exam_type} onChange={handleChange} className="border border-gray-300 rounded-lg p-3">
                <option value="">Exam Type</option>
                <option>IELTS</option><option>TOEFL</option><option>PTE</option>
              </select>
              <input type="date" name="exam_date" value={formData.exam_date} onChange={handleChange} className="border border-gray-300 rounded-lg p-3 col-span-2" />
              <input type="text" name="listening_score" placeholder="Listening" value={formData.listening_score} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
              <input type="text" name="reading_score" placeholder="Reading" value={formData.reading_score} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
              <input type="text" name="writing_score" placeholder="Writing" value={formData.writing_score} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
              <input type="text" name="speaking_score" placeholder="Speaking" value={formData.speaking_score} onChange={handleChange} className="border border-gray-300 rounded-lg p-3" />
              <input type="text" name="overall_score" placeholder="Overall Score" value={formData.overall_score} onChange={handleChange} className="border border-gray-300 rounded-lg p-3 col-span-2" />
            </div>
          </div>
        )}

        {/* Step 4: Background */}
        {currentStep === 4 && (
          <div ref={backgroundRef}>
            <h3 className="text-2xl font-semibold text-indigo-700 mb-6">📝 Background</h3>
            <div className="space-y-6">
              <select name="visa_refusal" value={formData.visa_refusal} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3">
                <option value="">Visa Refusal?</option>
                <option value="YES">Yes</option><option value="NO">No</option>
              </select>
              <select name="study_permit" value={formData.study_permit} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3">
                <option value="">Valid Study Permit?</option>
                <option value="YES">Yes</option><option value="NO">No</option>
              </select>
              <textarea name="background_details" rows="4" placeholder="Additional Details" value={formData.background_details} onChange={handleChange} className="w-full border border-gray-300 rounded-lg p-3"></textarea>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t font-bold">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg transition-all ${currentStep === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700'}`}
          >
            Previous
          </button>
          <div className="flex gap-3">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg flex items-center gap-2 shadow-lg"
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleFinalSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2 shadow-lg"
              >
                <Check size={18} />
                {isEditMode ? 'Update Student' : 'Create Student'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
