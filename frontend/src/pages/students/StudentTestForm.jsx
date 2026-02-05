import React, { useState, useRef, useEffect } from "react";
import { User, UserCircle2, Home, GraduationCap, MessageSquare, Lock, LogOut, Edit } from 'lucide-react';

const StudentTestForm = () => {
    const [activeTab, setActiveTab] = useState("general");
    const generalRef = useRef(null);
    const educationRef = useRef(null);
    const testScoresRef = useRef(null);
    const backgroundRef = useRef(null);
    const uploadRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: "Ritik",
        lastName: "Saini",
        email: "ritiksainiritiksaini6@gmail.com",
        mobile: "9719700483",
        c_code: "91",
        father: "",
        mother: "",
        dob: "",
        first_language: "",
        nationality: "",
        passport_number: "",
        passport_expiry: "",
        marital_status: "Single",
        gender: "Male",
        home_address: "",
        city: "",
        state: "",
        country: "",
        zipcode: "",
        home_contact_number: "",
        referredBy: "", // Captured from URL parameter
    });

    // Capture referral code from URL on component mount
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');
        if (referralCode) {
            setFormData(prev => ({ ...prev, referredBy: referralCode }));
            console.log('Referral code captured:', referralCode);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        console.log("Form data saved:", formData);
        // TODO: Send formData including referredBy to backend API
        alert(`Student registered successfully! ${formData.referredBy ? `Referred by: ${formData.referredBy}` : ''}`);
    };

    const handleCancel = () => {
        setFormData({
            name: "Ritik Saini",
            email: "ritiksainiritiksaini6@gmail.com",
            mobile: "9719700483",
            c_code: "91",
            father: "",
            mother: "",
            dob: "",
            first_language: "",
            nationality: "",
            passport_number: "",
            passport_expiry: "",
            marital_status: "Single",
            gender: "Male",
            home_address: "",
            city: "",
            state: "",
            country: "",
            zipcode: "",
            home_contact_number: "",
        });
    };

    const handleTabClick = (tab, ref) => {
        setActiveTab(tab);
        ref.current?.scrollIntoView({ behavior: "smooth" });
    };

    const [qualifications, setQualifications] = useState({
        gre: false,
        gmat: false,
        sat: false,
    });

    const toggle = (key) => {
        setQualifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // Static country data
    const countriesData = [
        { code: "IN", name: "INDIA" },
        { code: "US", name: "UNITED STATES" },
        { code: "GB", name: "UNITED KINGDOM" },
        { code: "CA", name: "CANADA" },
        { code: "AU", name: "AUSTRALIA" },
    ];

    const phoneCode = [
        { phonecode: "1" },
        { phonecode: "7" },
        { phonecode: "44" },
        { phonecode: "61" },
        { phonecode: "91" },
    ];

    return (
        <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen p-4 md:p-6 md:items-start">
            {/* Sidebar */}
            <div className="w-full md:w-1/4 bg-gradient-to-b from-blue-800 via-blue-700 to-blue-900 text-white rounded p-8 shadow-2xl flex flex-col items-center">
                <div className="relative">
                    <UserCircle2 className="w-28 h-28 text-white drop-shadow-lg" />
                    <button className="absolute bottom-2 right-2 bg-white text-blue-800 p-2 rounded-full shadow-md hover:bg-blue-100 transition">
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
                <h2 className="mt-4 font-semibold text-xl text-white tracking-wide">{formData.name}</h2>
                <p className="text-sm mb-8 opacity-80">{formData.email}</p>

                <div className="space-y-3 w-full">
                    <a href="/student/overview" className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm text-white rounded-xl py-3 px-4 shadow hover:bg-white/20 transition">
                        <UserCircle2 className="w-5 h-5" /> Overview
                    </a>
                    <a href="/student/profile" className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm text-white rounded-xl py-3 px-4 shadow hover:bg-white/20 transition">
                        <User className="w-5 h-5" /> My Profile
                    </a>
                    <a href="/student/applied-colleges" className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm text-white rounded-xl py-3 px-4 shadow hover:bg-white/20 transition">
                        <Home className="w-5 h-5" /> Applied Colleges
                    </a>
                    <a href="/student/conversation" className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm text-white rounded-xl py-3 px-4 shadow hover:bg-white/20 transition">
                        <MessageSquare className="w-5 h-5" /> Conversations
                    </a>
                    <a href="/student/change-password" className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm text-white rounded-xl py-3 px-4 shadow hover:bg-white/20 transition">
                        <Lock className="w-5 h-5" /> Change Password
                    </a>
                    <button className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-xl py-3 px-4 shadow transition cursor-pointer">
                        <LogOut className="w-5 h-5" /> Log Out
                    </button>
                </div>
            </div>

            {/* Right Section */}
            <div className="relative w-full md:w-3/4 bg-white rounded-2xl mt-6 md:mt-0 md:ml-6 shadow-xl">
                {/* Tabs - Sticky Header */}
                <div className="sticky top-0 rounded-t-2xl z-30 flex flex-wrap gap-3 py-4 px-2 text-sm font-semibold w-full bg-white border-b border-gray-100">
                    <button
                        onClick={() => handleTabClick("general", generalRef)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${activeTab === "general"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                            }`}
                    >
                        General Information
                    </button>

                    <button
                        onClick={() => handleTabClick("education", educationRef)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${activeTab === "education"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                            }`}
                    >
                        Education History
                    </button>

                    <button
                        onClick={() => handleTabClick("testScores", testScoresRef)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${activeTab === "testScores"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                            }`}
                    >
                        Test Scores
                    </button>

                    <button
                        onClick={() => handleTabClick("backgroundInfo", backgroundRef)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${activeTab === "backgroundInfo"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                            }`}
                    >
                        Background Information
                    </button>

                    <button
                        onClick={() => handleTabClick("uploadDocs", uploadRef)}
                        className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 whitespace-nowrap ${activeTab === "uploadDocs"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                            }`}
                    >
                        Upload Documents
                    </button>
                </div>

                {/* Personal Information */}
                <div ref={generalRef} className="mb-10 mt-10">
                    <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                        <div className="mb-6">
                            <h3 className="text-2xl font-semibold text-blue-700">👤 Personal Information</h3>
                            <p className="text-gray-500 text-sm mt-1">Fill in your personal and passport details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <input
                                type="text"
                                name="firstName"
                                placeholder="First Name"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                            <input
                                type="text"
                                name="lastName"
                                placeholder="Last Name"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />

                            <div className="flex">
                                <select
                                    name="c_code"
                                    value={formData.c_code}
                                    onChange={handleChange}
                                    required
                                    className="border border-gray-300 rounded-l-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">Code</option>
                                    {phoneCode.map((code, idx) => (
                                        <option key={idx} value={code.phonecode}>
                                            +{code.phonecode}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    name="mobile"
                                    placeholder="Mobile"
                                    value={formData.mobile}
                                    required
                                    onChange={handleChange}
                                    className="border border-gray-300 rounded-r-xl p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                            </div>

                            <input
                                type="text"
                                name="father"
                                placeholder="Father Name"
                                value={formData.father}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                            <input
                                type="text"
                                name="mother"
                                placeholder="Mother Name"
                                value={formData.mother}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                            <input
                                type="date"
                                name="dob"
                                placeholder="Date of Birth"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                            <input
                                type="text"
                                name="first_language"
                                placeholder="First Language"
                                value={formData.first_language}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />

                            <select
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            >
                                <option value="">Country of Citizenship</option>
                                {countriesData.map((country) => (
                                    <option key={country.code} value={country.name}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="passport_number"
                                placeholder="Passport Number"
                                value={formData.passport_number}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                            <input
                                type="text"
                                name="passport_expiry"
                                placeholder="Passport Expiry Date"
                                value={formData.passport_expiry}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            />
                            <select
                                name="marital_status"
                                value={formData.marital_status}
                                onChange={handleChange}
                                required
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            >
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                            </select>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {/* Address Detail */}
                        <div className="mt-10">
                            <h3 className="text-2xl font-semibold text-blue-700 mb-2">📍 Address Detail</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                ℹ️ Please make sure to enter the student's <b>residential address</b>. Organization address will not be accepted.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text"
                                    name="home_address"
                                    placeholder="Enter Address"
                                    value={formData.home_address}
                                    onChange={handleChange}
                                    required
                                    className="border border-gray-300 rounded-xl p-3 col-span-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="city"
                                    placeholder="Enter City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    required
                                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="state"
                                    placeholder="Enter State"
                                    value={formData.state}
                                    onChange={handleChange}
                                    required
                                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                                <select
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    required
                                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                >
                                    <option value="">Select Country</option>
                                    {countriesData.map((country) => (
                                        <option key={country.code} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    name="zipcode"
                                    placeholder="Enter Postal / Zipcode"
                                    value={formData.zipcode}
                                    onChange={handleChange}
                                    required
                                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                                <input
                                    type="text"
                                    name="home_contact_number"
                                    placeholder="Enter Home Contact Number"
                                    value={formData.home_contact_number}
                                    onChange={handleChange}
                                    required
                                    className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                />
                            </div>

                            <div className="flex justify-end gap-4 mt-8">
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Education History */}
                <div ref={educationRef}>
                    <div className="mb-10">
                        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold text-blue-700">🎓 Education Summary</h3>
                                <p className="text-gray-500 text-sm mt-1">Provide your latest education details</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <select className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                                    <option value="">Select Country of Education</option>
                                    {countriesData.map((country) => (
                                        <option key={country.code} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                                <select className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                                    <option value="">Select Highest Level</option>
                                    <option>Under-Graduate</option>
                                    <option>Post-Graduate</option>
                                    <option>Diploma</option>
                                </select>
                                <select className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                                    <option value="">Select Grading Scheme</option>
                                    <option value="Percentage">Percentage</option>
                                    <option value="CGPA">CGPA</option>
                                    <option value="GPA">GPA</option>
                                </select>
                                <input placeholder="Enter Grade Average" className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="text" />
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <button className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">Save</button>
                                <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                            {/* Schools Attended */}
                            <div className="w-full p-4 mb-10">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-semibold">Schools Attended</h2>
                                    <button className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md flex items-center">
                                        Add Attended School <span className="ml-1">＋</span>
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-center text-gray-500">No schools have been added yet.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10">
                        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                            {/* Additional Qualifications */}
                            <div className="p-4 mb-10">
                                <h2 className="text-lg font-semibold mb-4">Additional Qualifications</h2>
                                <div className="space-y-6 p-4 rounded-lg">
                                    {["gre", "gmat", "sat"].map((key) => (
                                        <div key={key} className="p-4 rounded-md bg-white shadow-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-800">
                                                    I Have {key.toUpperCase()} Exam Scores
                                                </span>
                                                <button
                                                    onClick={() => toggle(key)}
                                                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${qualifications[key] ? "bg-blue-600" : "bg-gray-300"
                                                        }`}
                                                >
                                                    <div
                                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${qualifications[key] ? "translate-x-6" : "translate-x-0"
                                                            }`}
                                                    ></div>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Scores */}
                <div ref={testScoresRef}>
                    <div className="mb-10">
                        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                            <div className="mb-6">
                                <h3 className="text-2xl font-semibold text-blue-700">🎯 Test Scores</h3>
                                <p className="text-gray-500 text-sm mt-1">Enter your latest English exam scores</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <select className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                                    <option value="">Select English Exam Type</option>
                                    <option>IELTS</option>
                                    <option>TOEFL</option>
                                    <option>PTE</option>
                                    <option>Duolingo English Test</option>
                                </select>
                                <input className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="date" />
                                <input placeholder="Listening Score" className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="text" />
                                <input placeholder="Reading Score" className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="text" />
                                <input placeholder="Writing Score" className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="text" />
                                <input placeholder="Speaking Score" className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="text" />
                                <input placeholder="Overall Score" className="border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="text" />
                            </div>
                            <div className="flex justify-end gap-4 mt-8">
                                <button className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">Save</button>
                                <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Background Information */}
                <div ref={backgroundRef}>
                    <div className="mb-10">
                        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-blue-700">📝 Background Information</h2>
                            </div>
                            <div className="mb-6">
                                <label className="block font-medium text-gray-700 mb-2">
                                    Have you been refused a visa from Canada, USA, UK, Australia more...?<span className="text-red-500">*</span>
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                                    <option value="">Select</option>
                                    <option value="YES">Yes</option>
                                    <option value="NO">No</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                                    Do you have a valid Study Permit / Visa?
                                </label>
                                <select className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition">
                                    <option value="">Select</option>
                                    <option value="YES">Yes</option>
                                    <option value="NO">No</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block font-medium text-gray-700 mb-2">
                                    If you answered "Yes" to any of the questions above, please provide more details below:<span className="text-red-500">*</span>
                                </label>
                                <textarea rows="4" placeholder="Enter details here..." className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"></textarea>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">Save</button>
                                <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Documents */}
                <div ref={uploadRef}>
                    <div className="mb-10">
                        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                            <div className="mb-6">
                                <h2 className="text-2xl font-semibold text-blue-700">📄 Upload Your Documents</h2>
                                <p className="text-gray-500 mt-2 text-sm">
                                    Accepted formats: <span className="font-semibold text-gray-700">.PDF, .JPEG, .PNG</span>
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Document Name</label>
                                    <input placeholder="Enter Document Name..." className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" type="text" />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">Upload Document</label>
                                    <label className="flex flex-col items-center justify-center w-full h-[52px] border-2 border-dashed border-blue-400 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-xl cursor-pointer transition">
                                        <span className="flex items-center gap-2 text-sm">
                                            <span className="text-lg">📂</span> Browse File
                                        </span>
                                        <input className="hidden" type="file" />
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md transition">Save</button>
                                <button className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-700 text-white shadow-md transition">Cancel</button>
                            </div>
                        </div>

                    </div>
                </div>
                {/* Upload Documents */}
                <div ref={uploadRef}>
                    <div className="mb-10">
                        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-8">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Documents</h3>
                            <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm uppercase tracking-wide">
                                        <tr>
                                            <th className="px-6 py-3">S.N.</th>
                                            <th className="px-6 py-3">Document Name</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-4 py-2 border text-center" colSpan="4">
                                                No documents uploaded yet.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentTestForm;
