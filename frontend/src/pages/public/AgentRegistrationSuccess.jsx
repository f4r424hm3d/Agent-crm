import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle, Mail, Phone, Clock, ArrowRight } from 'lucide-react';
import { fetchSettings, selectSetting } from '../../store/slices/settingsSlice';

const AgentRegistrationSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const supportEmail = useSelector(selectSetting('support_email')) || 'support@universitycrm.com';
    const isSettingsInitialized = useSelector(state => state.settings.isInitialized);

    useEffect(() => {
        if (!isSettingsInitialized) {
            dispatch(fetchSettings());
        }
    }, [dispatch, isSettingsInitialized]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-emerald-600 p-8 text-center text-white">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                        <CheckCircle size={48} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Application Submitted!</h1>
                    <p className="text-emerald-50 text-lg">Your application has been received and is now under review.</p>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                            <Mail className="mx-auto text-blue-600 mb-2" />
                            <h3 className="font-semibold text-gray-900 text-sm">Confirmation Sent</h3>
                            <p className="text-xs text-gray-500 mt-1">Check your inbox for tracking details</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                            <Clock className="mx-auto text-amber-600 mb-2" />
                            <h3 className="font-semibold text-gray-900 text-sm">Review Time</h3>
                            <p className="text-xs text-gray-500 mt-1">Usually reviewed within 24-48 hours</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                            <Phone className="mx-auto text-emerald-600 mb-2" />
                            <h3 className="font-semibold text-gray-900 text-sm">Next Steps</h3>
                            <p className="text-xs text-gray-500 mt-1">Our team will contact you soon</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                        <h3 className="font-bold text-gray-900 mb-4">What happens now?</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">1</div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Application Review</p>
                                    <p className="text-sm text-gray-600">Our compliance team will verify your documents and business details.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">2</div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Email Notification</p>
                                    <p className="text-sm text-gray-600">You will receive an email regarding the approval status of your application.</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">3</div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Portal Access</p>
                                    <p className="text-sm text-gray-600">Once approved, you'll get a link to set up your password and access the agent portal.</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 py-3 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                        >
                            Return to Home
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex-1 py-3 px-6 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Print Summary
                        </button>
                    </div>
                </div>

                <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Need help? Contact our support at <span className="text-emerald-600 font-semibold">{supportEmail}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AgentRegistrationSuccess;
