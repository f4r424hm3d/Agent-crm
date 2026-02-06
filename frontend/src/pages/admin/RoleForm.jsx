import React, { useState } from 'react';
import {
    Shield,
    ChevronLeft,
    Save,
    Info,
    Check,
    Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleForm = () => {
    const navigate = useNavigate();
    const [roleName, setRoleName] = useState('');
    const [permissions, setPermissions] = useState({
        dashboard: { view: true },
        admins: { view: false, create: false, edit: false, delete: false },
        agents: { view: true, create: false, edit: false, delete: false, approve: false },
        students: { view: true, create: true, edit: true, delete: false },
        applications: { view: true, create: true, edit: true, delete: false, status: true },
        commissions: { view: false, create: false, edit: false, delete: false },
        payouts: { view: false, request: false, process: false },
        universities: { view: true, create: false, edit: false, delete: false },
        courses: { view: true, create: false, edit: false, delete: false },
        auditLogs: { view: false, clear: false },
        settings: { view: false, manage: false },
    });

    const categories = [
        { id: 'dashboard', label: 'Dashboard', description: 'Access to overview and statistics.' },
        { id: 'admins', label: 'Admins & Staff', description: 'Manage internal team and system administrators.' },
        { id: 'agents', label: 'Agent Management', description: 'Manage external agents, recruitment, and approvals.' },
        { id: 'students', label: 'Student Management', description: 'Manage student records and documentation.' },
        { id: 'applications', label: 'Application Pipeline', description: 'Manage university applications and processing.' },
        { id: 'commissions', label: 'Commissions', description: 'Manage commission rules and calculations.' },
        { id: 'payouts', label: 'Finance & Payouts', description: 'Process payments and payout requests.' },
        { id: 'universities', label: 'University Database', description: 'Manage university profiles and relationships.' },
    ];

    const togglePermission = (category, perm) => {
        setPermissions(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [perm]: !prev[category][perm]
            }
        }));
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="max-w-5xl mx-auto">
                <button
                    onClick={() => navigate('/roles-permissions')}
                    className="flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                    Back to Roles
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mr-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Create New Role</h1>
                            <p className="text-gray-500 mt-0.5">Define a new set of permissions for your staff members.</p>
                        </div>
                    </div>
                    <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-bold">
                        <Save className="w-5 h-5 mr-2" />
                        Save Role Configuration
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Role Details Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center mb-6">
                            <Info className="w-5 h-5 text-indigo-500 mr-2" />
                            <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                        </div>
                        <div className="max-w-md">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Role Name</label>
                            <input
                                type="text"
                                value={roleName}
                                onChange={(e) => setRoleName(e.target.value)}
                                placeholder="e.g. Senior Admissions Officer"
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-lg font-medium"
                            />
                        </div>
                    </div>

                    {/* Permission Matrix */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center mb-8">
                            <Lock className="w-5 h-5 text-indigo-500 mr-2" />
                            <h2 className="text-xl font-bold text-gray-900">Access Matrix</h2>
                        </div>

                        <div className="space-y-6">
                            {categories.map((category) => (
                                <div key={category.id} className="group border border-gray-100 rounded-2xl p-6 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="max-w-xs">
                                            <h3 className="font-bold text-gray-900 text-lg">{category.label}</h3>
                                            <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            {Object.keys(permissions[category.id]).map((perm) => (
                                                <button
                                                    key={perm}
                                                    onClick={() => togglePermission(category.id, perm)}
                                                    className={`
                                                        flex items-center px-4 py-2 rounded-xl border transition-all
                                                        ${permissions[category.id][perm]
                                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100'
                                                            : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-5 h-5 rounded-full mr-2 flex items-center justify-center transition-all
                                                        ${permissions[category.id][perm] ? 'bg-white' : 'bg-gray-100'}
                                                    `}>
                                                        {permissions[category.id][perm] && <Check className="w-3.5 h-3.5 text-indigo-600 stroke-[3]" />}
                                                    </div>
                                                    <span className="text-sm font-semibold capitalize">{perm}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoleForm;
