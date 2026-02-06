import React, { useState } from 'react';
import {
    User,
    Mail,
    Phone,
    Key,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffList = () => {
    const navigate = useNavigate();
    const [staff] = useState([
        { id: 1, name: 'Aman Kumar', email: 'aman@example.com', phone: '+91 9876543210', role: 'Super Admin', status: 'Active' },
        { id: 2, name: 'Priya Singh', email: 'priya@example.com', phone: '+91 8765432109', role: 'Sales Manager', status: 'Active' },
        { id: 3, name: 'Sohan Lal', email: 'sohan@example.com', phone: '+91 7654321098', role: 'Support Staff', status: 'Inactive' },
    ]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-gray-600 mt-1">Manage your team members, their roles, and account access.</p>
                </div>
                <button
                    onClick={() => navigate('/staff/new')}
                    className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Staff Member
                </button>
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    />
                </div>
                <div className="flex items-center space-x-3">
                    <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        <option>All Roles</option>
                        <option>Super Admin</option>
                        <option>Sales Manager</option>
                        <option>Support Staff</option>
                    </select>
                    <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>
            </div>

            {/* Staff Grid/Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-500 text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Staff Details</th>
                            <th className="px-6 py-4 font-semibold">Contact Info</th>
                            <th className="px-6 py-4 font-semibold">Role</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {staff.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-5">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-indigo-100 text-indigo-700 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{member.name}</div>
                                            <div className="text-xs text-gray-500">Member since Feb 2024</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="space-y-1">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                            {member.email}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                            {member.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg border border-indigo-100">
                                        {member.role}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    {member.status === 'Active' ? (
                                        <span className="flex items-center text-green-600 font-medium">
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                            Active
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-gray-400 font-medium">
                                            <XCircle className="w-4 h-4 mr-1.5" />
                                            Inactive
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm" title="Edit">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm" title="Change Password">
                                            <Key className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-red-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 shadow-none hover:shadow-sm" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StaffList;
