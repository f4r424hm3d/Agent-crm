import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

/**
 * Route Guard Component
 * Validates referral ID before allowing access to student registration
 * 
 * Requirements:
 * - URL must have ?ref=REFERRAL_ID
 * - Referral ID must be 24 characters (MongoDB ObjectId)
 * - Referrer must exist and be active in database
 * - Sets HTTP-only cookie for multi-step form persistence
 */
const RequireReferral = ({ children }) => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [validating, setValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        validateReferral();
    }, []);

    const validateReferral = async () => {
        try {
            const referralId = searchParams.get('ref');

            // Check if referral ID exists
            if (!referralId) {
                console.warn('No referral ID provided');
                navigate('/404', { replace: true });
                return;
            }

            // Client-side validation: Check length
            if (referralId.length !== 24) {
                console.warn(`Invalid referral ID length: ${referralId.length}`);
                navigate('/404', { replace: true });
                return;
            }

            // Server-side validation via API
            const response = await axios.get(
                `http://localhost:5000/api/validate-referral?ref=${referralId}`,
                { withCredentials: true } // Important for cookies
            );

            if (response.data.success) {
                setIsValid(true);
                setValidating(false);
            }
        } catch (error) {
            console.error('Referral validation failed:', error);

            if (error.response) {
                // Server responded with error
                const status = error.response.status;
                const message = error.response.data?.message || 'Invalid referral link';

                console.warn(`Validation failed: ${status} - ${message}`);
                setError(message);
            } else {
                // Network error
                setError('Unable to validate referral. Please try again.');
            }

            // Redirect to 404 after a brief delay to show error
            setTimeout(() => {
                navigate('/404', { replace: true });
            }, 2000);
        }
    };

    // Loading state
    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Validating referral link...</p>
                    {error && (
                        <p className="text-red-600 mt-4">{error}</p>
                    )}
                </div>
            </div>
        );
    }

    // Valid referral - render protected content
    if (isValid) {
        return <>{children}</>;
    }

    // Should not reach here, but fallback to 404
    return null;
};

export default RequireReferral;
