import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordRequirements = ({ password }) => {
    const requirements = [
        {
            label: 'At least 8 characters',
            test: (pwd) => pwd && pwd.length >= 8
        },
        {
            label: 'Contains uppercase letter',
            test: (pwd) => /[A-Z]/.test(pwd)
        },
        {
            label: 'Contains lowercase letter',
            test: (pwd) => /[a-z]/.test(pwd)
        },
        {
            label: 'Contains number',
            test: (pwd) => /[0-9]/.test(pwd)
        },
        {
            label: 'Contains special character (!@#$%^&*...)',
            test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
        }
    ];

    return (
        <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
            <ul className="space-y-1">
                {requirements.map((req, index) => {
                    const isMet = req.test(password);
                    return (
                        <li key={index} className="flex items-center text-sm">
                            {isMet ? (
                                <Check className="w-4 h-4 text-green-600 mr-2" />
                            ) : (
                                <X className="w-4 h-4 text-gray-400 mr-2" />
                            )}
                            <span className={isMet ? 'text-green-700' : 'text-gray-600'}>
                                {req.label}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default PasswordRequirements;
