import React, { useState, useEffect } from 'react';
import {
    Save,
    Globe,
    Shield,
    Mail,
    Users,
    AlertCircle,
    CheckCircle,
    Loader
} from 'lucide-react';
import axios from 'axios';

// Component for individual tab content
const TabContent = ({ active, children }) => {
    if (!active) return null;
    return <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>;
};

const Settings = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        general: {},
        security: {},
        email: {},
        agent: {},
    });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch settings on load
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/settings', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    setSettings(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch settings:', error);
                setMessage({ type: 'error', text: 'Failed to load settings from server.' });
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Handle form input changes
    const handleChange = (group, key, value) => {
        setSettings(prev => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: value
            }
        }));
    };

    // Save settings
    const handleSave = async () => {
        setSaving(true);
        setMessage({ type: '', text: '' });

        // Flatten settings for API
        const flatSettings = {};
        Object.keys(settings).forEach(group => {
            Object.keys(settings[group]).forEach(key => {
                flatSettings[key] = settings[group][key];
            });
        });

        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/settings',
                { settings: flatSettings },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage({ type: 'success', text: 'Settings updated successfully!' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General', icon: Globe },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'email', label: 'Email Configuration', icon: Mail },
        { id: 'agent', label: 'Agent Policies', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Platform Settings</h1>
                        <p className="text-gray-500 mt-1">Manage global configurations for the application.</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {saving ? (
                            <>
                                <Loader className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                {/* Floating Message */}
                {message.text && (
                    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center animate-bounce-in ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
                        {message.text}
                    </div>
                )}

                {/* Tabs & Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 bg-gray-50/50">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-6 py-4 text-sm font-medium transition-colors relative outline-none ${activeTab === tab.id
                                        ? 'text-blue-600 bg-white'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-600" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Panels */}
                    <div className="p-8">

                        {/* General Tab */}
                        <TabContent active={activeTab === 'general'}>
                            <div className="space-y-6 max-w-2xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Platform Name</label>
                                    <input
                                        type="text"
                                        value={settings.general?.platform_name || ''}
                                        onChange={(e) => handleChange('general', 'platform_name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="e.g. My CRM"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Displayed in emails and browser title.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
                                    <input
                                        type="email"
                                        value={settings.general?.support_email || ''}
                                        onChange={(e) => handleChange('general', 'support_email', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="support@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                                    <select
                                        value={settings.general?.currency || 'USD'}
                                        onChange={(e) => handleChange('general', 'currency', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all bg-white"
                                    >
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                        <option value="INR">INR (₹)</option>
                                        <option value="GBP">GBP (£)</option>
                                    </select>
                                </div>
                            </div>
                        </TabContent>

                        {/* Security Tab */}
                        <TabContent active={activeTab === 'security'}>
                            <div className="space-y-6 max-w-2xl">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication (2FA)</h3>
                                        <p className="text-xs text-gray-500 mt-1">Enforce 2FA for all admin accounts.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.security?.enable_2fa || false}
                                            onChange={(e) => handleChange('security', 'enable_2fa', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password Policy</label>
                                    <select
                                        value={settings.security?.password_policy || 'medium'}
                                        onChange={(e) => handleChange('security', 'password_policy', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                    >
                                        <option value="low">Low (Min 6 chars)</option>
                                        <option value="medium">Medium (Min 8 chars, mixed case)</option>
                                        <option value="high">High (Min 10 chars, special chars required)</option>
                                    </select>
                                </div>
                            </div>
                        </TabContent>

                        {/* Email Tab */}
                        <TabContent active={activeTab === 'email'}>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                <h4 className="text-sm font-medium text-amber-800 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    SMTP Configuration used for sending system emails.
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Host</label>
                                    <input
                                        type="text"
                                        value={settings.email?.smtp_host || ''}
                                        onChange={(e) => handleChange('email', 'smtp_host', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="smtp.example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Port</label>
                                    <input
                                        type="number"
                                        value={settings.email?.smtp_port || ''}
                                        onChange={(e) => handleChange('email', 'smtp_port', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="587"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Username</label>
                                    <input
                                        type="text"
                                        value={settings.email?.smtp_user || ''}
                                        onChange={(e) => handleChange('email', 'smtp_user', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Password</label>
                                    <input
                                        type="password"
                                        value={settings.email?.smtp_pass || ''}
                                        onChange={(e) => handleChange('email', 'smtp_pass', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </TabContent>

                        {/* Agent Tab */}
                        <TabContent active={activeTab === 'agent'}>
                            <div className="space-y-6 max-w-2xl">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-900">Auto-Approve Agents</h3>
                                        <p className="text-xs text-gray-500 mt-1">Automatically approve agents upon registration verification.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.agent?.auto_approve_agents || false}
                                            onChange={(e) => handleChange('agent', 'auto_approve_agents', e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Commission Rate (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={settings.agent?.default_commission_rate || 0}
                                            onChange={(e) => handleChange('agent', 'default_commission_rate', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all pr-8"
                                            placeholder="10"
                                        />
                                        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">%</span>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">Default commission rate applied to new agents unless overridden.</p>
                                </div>
                            </div>
                        </TabContent>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
