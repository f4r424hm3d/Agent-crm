import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Lock,
    ChevronLeft,
    Save,
    UserCircle,
    Key,
    Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: '',
        status: 'Active'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/staff')}
                    className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Staff List
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mr-4">
                            <UserCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Add Staff Member</h1>
                            <p className="text-gray-500 mt-0.5">Create a new internal account for your team.</p>
                        </div>
                    </div>
                    <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-bold">
                        <Save className="w-5 h-5 mr-2" />
                        Create Staff Account
                    </button>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-8">
                    {/* Basic Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full pb-4 border-b border-gray-50">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <User className="w-5 h-5 mr-2 text-indigo-500" />
                                Personal Details
                            </h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    name="phone"
                                    type="text"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 00000 00000"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-full pb-4 border-b border-gray-50 pt-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center">
                                <Lock className="w-5 h-5 mr-2 text-indigo-500" />
                                Account Security
                            </h2>
                        </div>

                        <div className="space-y-2 col-span-full lg:col-span-1">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="email@example.com"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-full lg:col-span-1">
                            <label className="text-sm font-semibold text-gray-700">Account Password</label>
                            <div className="relative">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 col-span-full">
                            <label className="text-sm font-semibold text-gray-700">Assign Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium appearance-none"
                                >
                                    <option value="">Select a role...</option>
                                    <option value="super_admin">Super Admin</option>
                                    <option value="sales_manager">Sales Manager</option>
                                    <option value="support_staff">Support Staff</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 italic">Permissions will be inherited from the selected role.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffForm;
