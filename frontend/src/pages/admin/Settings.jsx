import React, { useState, useEffect } from 'react';
import {
    Save, Upload, Globe, Mail, Phone, MapPin,
    Facebook, Twitter, Youtube, Instagram, MessageCircle,
    Shield, Monitor, DollarSign, Layout
} from 'lucide-react';
import settingService from '../../services/settingService';
import uploadService from '../../services/uploadService';
import { useToast } from '../../components/ui/toast';
const Settings = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({});
    const [activeTab, setActiveTab] = useState('branding');

    // Define sections and fields
    // This allows us to map inputs dynamically

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await settingService.getSettings();
            // Flatten the grouped response for easier form state management
            // response.data is { general: { ... }, branding: { ... } }
            const flatSettings = {};
            if (response.data) {
                Object.values(response.data).forEach(group => {
                    Object.assign(flatSettings, group);
                });
            }
            setSettings(flatSettings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast({ title: "Error", description: "Failed to load settings", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e, key) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Show temporary loading or preview if needed
            const response = await uploadService.uploadFile(file);
            const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
            const fileUrl = `${apiBase}${response.url}`; // Construct full URL
            setSettings(prev => ({ ...prev, [key]: fileUrl }));
            toast({ title: "Success", description: "Image uploaded successfully", variant: "default" });
        } catch (error) {
            console.error('Upload failed:', error);
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
        }
    };

    const saveSettings = async () => {
        try {
            setSaving(true);
            await settingService.updateSettings(settings);
            toast({ title: "Success", description: "Settings saved successfully", variant: "default" });
        } catch (error) {
            console.error('Save failed:', error);
            toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    // Helper components
    const SectionHeader = ({ title, description }) => (
        <div className="mb-6 border-b pb-2">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500">{description}</p>
        </div>
    );

    const InputField = ({ label, name, type = "text", placeholder, icon: Icon }) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative rounded-md shadow-sm">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={settings[name] || ''}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${Icon ? 'pl-10' : ''} p-2 border`}
                />
            </div>
        </div>
    );

    const ImageUpload = ({ label, name }) => (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex items-center space-x-6">
                <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                    {settings[name] ? (
                        <img src={settings[name]} alt={label} className="max-h-full max-w-full object-contain" />
                    ) : (
                        <span className="text-gray-400 text-xs text-center p-1">No Image</span>
                    )}
                </div>
                <div className="flex-1">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, name)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Recommended size: 500x500px or larger. PNG or JPG.</p>
                </div>
            </div>
        </div>
    );

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm transition-colors ${activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </button>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden min-h-[600px] flex flex-col">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <TabButton id="branding" label="Branding" icon={Layout} />
                    <TabButton id="contact" label="Contact Info" icon={Phone} />
                    <TabButton id="social" label="Social Media" icon={Globe} />
                    <TabButton id="widgets" label="Widgets & Analytics" icon={Monitor} />
                    <TabButton id="security" label="Security" icon={Shield} />
                </div>

                <div className="p-8 flex-1">
                    {activeTab === 'branding' && (
                        <div className="space-y-6 max-w-2xl">
                            <SectionHeader title="Brand Identity" description="Manage your logos and platform name." />
                            <InputField label="Platform Name" name="platform_name" placeholder="Britannica Overseas" />
                            <ImageUpload label="Logo (Light Theme)" name="logo_light" />
                            <ImageUpload label="Logo (Dark Theme)" name="logo_dark" />
                            <ImageUpload label="Favicon" name="site_favicon" />
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <SectionHeader title="Contact Information" description="Details displayed on the contact page and footer." />
                            </div>

                            <InputField label="Primary Email" name="contact_email" icon={Mail} type="email" />
                            <InputField label="Alternative Email" name="contact_email_alt" icon={Mail} type="email" />

                            <InputField label="Primary Phone" name="contact_phone" icon={Phone} type="tel" />
                            <InputField label="Alternative Phone" name="contact_phone_alt" icon={Phone} type="tel" />

                            <div className="md:col-span-2 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                                    <textarea
                                        name="contact_address"
                                        value={settings.contact_address || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Full business address..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Address (for Footer)</label>
                                    <input
                                        type="text"
                                        name="contact_address_short"
                                        value={settings.contact_address_short || ''}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="City, Country"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="max-w-2xl space-y-6">
                            <SectionHeader title="Social Media Links" description="Connect your social profiles." />
                            <InputField label="Facebook URL" name="social_facebook" icon={Facebook} placeholder="https://facebook.com/..." />
                            <InputField label="Instagram URL" name="social_instagram" icon={Instagram} placeholder="https://instagram.com/..." />
                            <InputField label="Twitter (X) URL" name="social_twitter" icon={Twitter} placeholder="https://twitter.com/..." />
                            <InputField label="YouTube URL" name="social_youtube" icon={Youtube} placeholder="https://youtube.com/..." />
                            <InputField label="WhatsApp Number/Link" name="social_whatsapp" icon={MessageCircle} placeholder="https://wa.me/..." />
                        </div>
                    )}

                    {activeTab === 'widgets' && (
                        <div className="max-w-3xl space-y-6">
                            <SectionHeader title="Third-Party Widgets" description="Embed scripts for analytics or chat support." />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Live Chat Widget Script</label>
                                <p className="text-xs text-gray-500 mb-2">Paste the script code provided by your chat provider (e.g., Tawk.to, Intercom).</p>
                                <textarea
                                    name="widget_live_chat"
                                    value={settings.widget_live_chat || ''}
                                    onChange={handleInputChange}
                                    rows={8}
                                    className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                                    placeholder="<script>...</script>"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="max-w-2xl space-y-6">
                            <SectionHeader title="Security Controls" description="Global security settings." />
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <h3 className="font-medium text-gray-900">Enable Two-Factor Authentication (Global)</h3>
                                    <p className="text-sm text-gray-500">Enforce 2FA for all admin accounts.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="security_2fa_enabled"
                                        checked={settings.security_2fa_enabled === 'true' || settings.security_2fa_enabled === true}
                                        onChange={(e) => setSettings(prev => ({ ...prev, security_2fa_enabled: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
