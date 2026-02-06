import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiFileText, FiHome, FiMail } from 'react-icons/fi';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <FiFileText className="mx-auto text-red-400 mb-6" size={80} />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or the referral link is invalid.
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8 text-left">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Looking to register as a student?
          </h3>
          <p className="text-blue-700 mb-4">
            You need a valid referral link from an authorized agent or admin.
          </p>
          <ul className="list-disc list-inside text-blue-700 space-y-2 text-sm">
            <li>Contact your education consultant</li>
            <li>Request a personalized registration link</li>
            <li>Use the provided link to complete your application</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <FiHome size={20} />
            Return Home
          </button>
          <a
            href="mailto:support@example.com"
            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <FiMail size={20} />
            Contact Support
          </a>
        </div>

        <p className="text-sm text-gray-500 mt-8">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
