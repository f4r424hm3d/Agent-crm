import React from 'react';
import { Check, Mail, Phone, Calendar } from 'lucide-react';

const RegistrationSuccess = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                {/* Success Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                    {/* Success Icon */}
                    <div className="mb-6 flex justify-center">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                <Check size={48} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* Success Message */}
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Registration Successful! 🎉
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Thank you for completing your student registration. Your application has been successfully submitted.
                    </p>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-blue-50 rounded-xl p-4">
                            <Mail className="text-blue-600 mx-auto mb-2" size={28} />
                            <p className="text-sm text-gray-700 font-medium">Email Confirmation</p>
                            <p className="text-xs text-gray-500 mt-1">Check your inbox</p>
                        </div>

                        <div className="bg-purple-50 rounded-xl p-4">
                            <Phone className="text-purple-600 mx-auto mb-2" size={28} />
                            <p className="text-sm text-gray-700 font-medium">We'll Contact You</p>
                            <p className="text-xs text-gray-500 mt-1">Within 24 hours</p>
                        </div>

                        <div className="bg-emerald-50 rounded-xl p-4">
                            <Calendar className="text-emerald-600 mx-auto mb-2" size={28} />
                            <p className="text-sm text-gray-700 font-medium">Next Steps</p>
                            <p className="text-xs text-gray-500 mt-1">Check email for details</p>
                        </div>
                    </div>

                    {/* What's Next Section */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 mb-6 text-left">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold">1</span>
                                </div>
                                <p className="text-gray-700">Our admissions team will review your application</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold">2</span>
                                </div>
                                <p className="text-gray-700">You'll receive a verification email within 24 hours</p>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-xs font-bold">3</span>
                                </div>
                                <p className="text-gray-700">Our counselors will contact you to discuss next steps</p>
                            </li>
                        </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a
                            href="/"
                            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg"
                        >
                            Return to Homepage
                        </a>
                        <a
                            href="mailto:support@example.com"
                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                        >
                            Contact Support
                        </a>
                    </div>

                    {/* Footer Note */}
                    <p className="text-sm text-gray-500 mt-8">
                        Didn't receive an email? Check your spam folder or{' '}
                        <a href="mailto:support@example.com" className="text-indigo-600 hover:underline">
                            contact us
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationSuccess;
