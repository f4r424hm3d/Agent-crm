import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OTPInput from './OTPInput';
import { FiMail, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

/**
 * Email Verification Component
 * Handles OTP sending, verification, and resend logic
 */
const EmailVerification = ({ email, onVerified }) => {
    const [step, setStep] = useState('initial'); // initial, otp_sent, verified
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [expiresIn, setExpiresIn] = useState(0);

    // Resend countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // OTP expiry countdown
    useEffect(() => {
        if (expiresIn > 0) {
            const timer = setTimeout(() => setExpiresIn(expiresIn - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [expiresIn]);

    const sendOTP = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post(
                'http://localhost:5000/api/otp/send',
                { email },
                { withCredentials: true }
            );

            if (response.data.success) {
                setStep('otp_sent');
                setSuccess('OTP sent to your email!');
                setResendTimer(60); // 60 seconds cooldown
                setExpiresIn(response.data.expiresIn || 300); // 5 minutes
                setOtp(['', '', '', '', '', '']); // Clear OTP inputs
            }
        } catch (err) {
            console.error('Error sending OTP:', err);
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const verifyOTP = async () => {
        try {
            setLoading(true);
            setError('');

            const otpCode = otp.join('');

            if (otpCode.length !== 6) {
                setError('Please enter complete 6-digit OTP');
                return;
            }

            const response = await axios.post(
                'http://localhost:5000/api/otp/verify',
                { email, otp: otpCode },
                { withCredentials: true }
            );

            if (response.data.success) {
                setStep('verified');
                setSuccess('Email verified successfully! ✓');
                if (onVerified) onVerified();
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            const errorMsg = err.response?.data?.message || 'Invalid OTP. Please try again.';
            setError(errorMsg);

            // Clear OTP on error
            setOtp(['', '', '', '', '', '']);
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await axios.post(
                'http://localhost:5000/api/otp/resend',
                { email },
                { withCredentials: true }
            );

            if (response.data.success) {
                setSuccess('New OTP sent to your email!');
                setResendTimer(60);
                setExpiresIn(response.data.expiresIn || 300);
                setOtp(['', '', '', '', '', '']);
            }
        } catch (err) {
            console.error('Error resending OTP:', err);
            setError(err.response?.data?.message || 'Failed to resend OTP.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'verified') {
        return (
            <div className="bg-green-50 border-2 border-green-500 rounded-lg p-4">
                <div className="flex items-center gap-3 text-green-700">
                    <FiCheckCircle size={24} />
                    <div>
                        <h3 className="font-semibold">Email Verified!</h3>
                        <p className="text-sm">You can now proceed with registration</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mt-4">
            <div className="flex items-start gap-3 mb-4">
                <FiMail className="text-blue-600 mt-1" size={20} />
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 mb-1">
                        Email Verification Required
                    </h3>
                    <p className="text-sm text-blue-700">
                        We'll send a 6-digit code to <strong>{email}</strong>
                    </p>
                </div>
            </div>

            {step === 'initial' && (
                <button
                    onClick={sendOTP}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? 'Sending...' : 'Get OTP'}
                </button>
            )}

            {step === 'otp_sent' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Enter 6-digit OTP
                        </label>
                        <OTPInput otp={otp} setOtp={setOtp} />
                    </div>

                    {expiresIn > 0 && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <FiClock size={16} />
                            <span>Code expires in {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}</span>
                        </div>
                    )}

                    <button
                        onClick={verifyOTP}
                        disabled={loading || otp.some(d => !d)}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="text-center">
                        <button
                            onClick={resendOTP}
                            disabled={loading || resendTimer > 0}
                            className="text-sm text-indigo-600 hover:text-indigo-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {resendTimer > 0
                                ? `Resend OTP in ${resendTimer}s`
                                : 'Resend OTP'}
                        </button>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                    <FiCheckCircle />
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                    <FiAlertCircle />
                    {error}
                </div>
            )}
        </div>
    );
};

export default EmailVerification;
