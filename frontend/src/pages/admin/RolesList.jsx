import React, { useState } from 'react';
import {
    Users,
    Shield,
    Plus,
    MoreVertical,
    Edit,
    Trash2,
    Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RolesList = () => {
    const navigate = useNavigate();
    const [roles] = useState([
        { id: 1, name: 'Super Admin', members: 2, permissions: 'All Access', status: 'Active' },
        { id: 2, name: 'Sales Manager', members: 5, permissions: 'Agents, Students, Apps', status: 'Active' },
        { id: 3, name: 'Support Staff', members: 12, permissions: 'View Only', status: 'Active' },
    ]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
                    <p className="text-gray-600 mt-1">Define access levels and assign permissions to staff groups.</p>
                </div>
                <button
                    onClick={() => navigate('/roles-permissions/new')}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Role
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <Shield className="w-6 h-6 text-indigo-600" />
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 mb-1">{role.name}</h3>
                        <p className="text-sm text-gray-500 mb-4 flex items-center">
                            <Users className="w-4 h-4 mr-1.5" />
                            {role.members} staff members
                        </p>

                        <div className="pt-4 border-t border-gray-50 mt-4 flex justify-between items-center">
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full uppercase tracking-wider">
                                {role.status}
                            </span>
                            <div className="flex space-x-2">
                                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Permissions">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Role">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RolesList;
