import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, Clock, XCircle, ArrowLeft, Building, Mail, MapPin, Calendar, ShieldCheck } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { useToast } from '../../components/ui/toast';
import { fetchSettings, selectSetting } from '../../store/slices/settingsSlice';

const ApplicationStatus = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const toast = useToast();
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const supportEmail = useSelector(selectSetting('support_email'));
    const isSettingsInitialized = useSelector(state => state.settings.isInitialized);

    useEffect(() => {
        if (!isSettingsInitialized) {
            dispatch(fetchSettings());
        }
    }, [dispatch, isSettingsInitialized]);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!token) {
                setError('Tracking token is missing.');
                setLoading(false);
                return;
            }

            try {
                const response = await apiClient.get(`/inquiry/application-status/${token}`);
                if (response.data?.success) {
                    setStatusData(response.data.data);
                } else {
                    setError(response.data?.message || 'Failed to fetch status.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Invalid or expired tracking token.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
    }, [token]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-emerald-200 rounded-full mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                        <XCircle size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Notice</h1>
                    <p className="text-gray-600 mb-8">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const { approvalStatus, firstName, lastName, companyName, email, submittedAt, phase, details } = statusData;

    const getStatusIcon = () => {
        switch (approvalStatus) {
            case 'approved': return <CheckCircle2 className="text-emerald-600" size={24} />;
            case 'pending': return <Clock className="text-amber-500" size={24} />;
            case 'rejected': return <XCircle className="text-red-600" size={24} />;
            default: return <Clock size={24} />;
        }
    };

    const getStatusTheme = () => {
        switch (approvalStatus) {
            case 'approved': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
            case 'pending': return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'rejected': return 'bg-red-50 border-red-200 text-red-700';
            default: return 'bg-gray-50 border-gray-200 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
            <div className="w-full max-w-2xl">
                <button onClick={() => navigate('/')} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 mb-8 transition-colors group">
                    <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Selection
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
                    <div className="bg-emerald-600 p-8 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <ShieldCheck size={120} />
                        </div>
                        <h1 className="text-3xl font-extrabold mb-2">Application Status</h1>
                        <p className="text-emerald-100 flex items-center gap-2">
                            Tracking ID: <span className="font-mono bg-emerald-700/50 px-2 py-0.5 rounded text-xs">{token.substring(0, 12)}...</span>
                        </p>
                    </div>

                    <div className="p-8">
                        <div className={`p-6 rounded-2xl border-2 mb-8 flex items-center gap-4 ${getStatusTheme()}`}>
                            <div className="p-3 bg-white rounded-xl shadow-sm">
                                {getStatusIcon()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold uppercase tracking-wide">
                                    {approvalStatus === 'pending' ? 'Currently Under Review' : approvalStatus.charAt(0).toUpperCase() + approvalStatus.slice(1)}
                                </h2>
                                <p className="text-sm opacity-80">
                                    {approvalStatus === 'pending'
                                        ? "We are verifying your credentials. This usually takes 3-5 business days."
                                        : approvalStatus === 'approved'
                                            ? "Congratulations! Your application has been approved."
                                            : "Unfortunately, your application was not approved at this time."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Applicant Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><Building size={16} /></div>
                                            <span className="font-semibold">{companyName}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><Mail size={16} /></div>
                                            <span>{email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><MapPin size={16} /></div>
                                            <span>{details.city}, {details.country}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Timeline</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500"><Calendar size={16} /></div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Submitted On</p>
                                                <p className="font-medium">{new Date(submittedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-700">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600"><Clock size={16} /></div>
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">Current Phase</p>
                                                <p className="font-bold text-emerald-600">{phase}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 py-3 px-6 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                Print Status
                            </button>
                            {approvalStatus === 'approved' && (
                                <button
                                    onClick={() => navigate('/login?role=AGENT')}
                                    className="flex-1 py-3 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500"
                                >
                                    Continue to Login
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Secure Verification Portal &bull; Updated {new Date().toLocaleTimeString()}
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-center text-gray-500 text-sm">
                    Questions? Contact us at <a href={`mailto:${supportEmail}`} className="text-emerald-600 font-semibold hover:underline">{supportEmail}</a>
                </p>
            </div>
        </div>
    );
};

export default ApplicationStatus;
