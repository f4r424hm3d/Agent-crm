import React, { useState, useRef, useEffect } from 'react';

/**
 * OTP Input Component
 * 6 individual input boxes for OTP entry
 * Features: auto-focus, paste support, backspace navigation
 */
const OTPInput = ({ otp, setOtp, onComplete }) => {
    const inputRefs = useRef([]);

    useEffect(() => {
        // Auto-focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        // Check if OTP is complete
        if (otp.every(digit => digit !== '') && onComplete) {
            onComplete(otp.join(''));
        }
    }, [otp, onComplete]);

    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only last character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace: clear current and move to previous
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setOtp(newOtp);

        // Focus last filled input or first empty
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`
            w-12 h-12 text-center text-xl font-semibold
            border-2 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            transition-all
            ${digit ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
          `}
                />
            ))}
        </div>
    );
};

export default OTPInput;
