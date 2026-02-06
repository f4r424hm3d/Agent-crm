import React from 'react';

const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = (pwd) => {
        if (!pwd) return { level: 0, label: '', color: '' };

        let strength = 0;

        if (pwd.length >= 8) strength++;
        if (pwd.length >= 12) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) strength++;

        if (strength <= 2) {
            return { level: 33, label: 'Weak', color: 'bg-red-500' };
        } else if (strength <= 4) {
            return { level: 66, label: 'Medium', color: 'bg-yellow-500' };
        } else {
            return { level: 100, label: 'Strong', color: 'bg-green-500' };
        }
    };

    const strength = getStrength(password);

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Password Strength</span>
                <span className="text-xs font-medium" style={{
                    color: strength.label === 'Weak' ? '#EF4444' :
                        strength.label === 'Medium' ? '#F59E0B' : '#10B981'
                }}>
                    {strength.label}
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className={`${strength.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${strength.level}%` }}
                ></div>
            </div>
        </div>
    );
};

export default PasswordStrengthIndicator;
