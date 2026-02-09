import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Building, Mail, Phone, Globe, MapPin, Calendar,
    Briefcase, Award, Users, TrendingUp, Target, FileText,
    CheckCircle, XCircle, ArrowLeft, Edit, Shield, Info,
    BarChart3, PieChart, Clock, ExternalLink, Download
} from 'lucide-react';
import agentService from '../../services/agentService';
import externalSearchService from '../../services/externalSearchService';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useToast } from '../../components/ui/toast';

const AgentDetailView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { success, error: showError } = useToast();
    const [agent, setAgent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmAction, setConfirmAction] = useState({ type: null, isOpen: false });

    useEffect(() => {
        fetchAgentDetails();
    }, [id]);

    const fetchAgentDetails = async () => {
        try {
            setLoading(true);
            const response = await agentService.getAgentById(id);
            const agentData = response.data?.agent || response.agent || response.data || response;
            setAgent(agentData);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to load agent details');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            if (confirmAction.type === 'approve') {
                await agentService.approveAgent(id);
                success('Agent approved successfully! Redirecting to agents list...');
                // Redirect to agents page after approval
                setTimeout(() => {
                    navigate('/agents');
                }, 1500); // 1.5 second delay to show success message
            } else if (confirmAction.type === 'reject') {
                await agentService.rejectAgent(id);
                success('Agent application declined.');
                fetchAgentDetails();
            }
        } catch (error) {
            showError('Failed to process request');
        } finally {
            setConfirmAction({ type: null, isOpen: false });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-indigo-600 font-semibold animate-pulse">Fetching Agent Profile...</p>
                </div>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-red-50">
                    <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Detailed View Unavailable</h2>
                    <p className="text-gray-600 mb-8">{error || "We couldn't find the agent you're looking for."}</p>
                    <button
                        onClick={() => navigate('/agents')}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        Return to Agent List
                    </button>
                </div>
            </div>
        );
    }

    const SectionHeader = ({ icon: Icon, title, subtitle }) => (
        <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-indigo-50 rounded-2xl">
                <Icon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            </div>
        </div>
    );

    const DataRow = ({ label, value, fullWidth = false }) => {
        if (!value && value !== 0) return null;
        return (
            <div className={`${fullWidth ? 'col-span-full' : ''} group`}>
                <label className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 group-hover:text-indigo-600 transition-colors">
                    {label}
                </label>
                <div className="text-sm font-semibold text-gray-900 mt-0.5 break-words">
                    {value}
                </div>
            </div>
        );
    };

    const StatusBadge = ({ status, type = 'approval' }) => {
        const configs = {
            approval: {
                pending: 'bg-amber-50 text-amber-600 border-amber-100',
                approved: 'bg-green-50 text-green-600 border-green-100',
                declined: 'bg-red-50 text-red-600 border-red-100', // Changed from rejected
                rejected: 'bg-red-50 text-red-600 border-red-100',
            },
            status: {
                active: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                inactive: 'bg-gray-50 text-gray-500 border-gray-100',
            }
        };
        const activeConfig = configs[type][status.toLowerCase()] || configs[type].inactive;
        return (
            <span className={`px-4 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${activeConfig}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Global Header */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                        <button
                            onClick={() => navigate('/agents')}
                            className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-400 hover:text-indigo-600"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                    {agent.firstName} {agent.lastName}
                                </h1>
                                <StatusBadge status={agent.approvalStatus || agent.approval_status || 'pending'} />
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-gray-500 font-medium">
                                <span className="flex items-center"><Building className="w-4 h-4 mr-1.5 text-indigo-400" /> {agent.companyName}</span>
                                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5 text-indigo-400" /> {agent.city}, {agent.country}</span>
                                <span className="flex items-center"><Shield className="w-4 h-4 mr-1.5 text-indigo-400" /> ID: {id.slice(-8).toUpperCase()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <StatusBadge status={agent.status || 'active'} type="status" />
                        {(agent.approvalStatus === 'pending' || agent.approval_status === 'pending') && (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmAction({ type: 'approve', isOpen: true })}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center"
                                >
                                    <CheckCircle className="w-5 h-5 mr-2" /> Approve
                                </button>
                                <button
                                    onClick={() => setConfirmAction({ type: 'reject', isOpen: true })}
                                    className="px-6 py-2.5 bg-white border-2 border-red-50 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all flex items-center"
                                >
                                    <XCircle className="w-5 h-5 mr-2" /> Reject
                                </button>
                            </div>
                        )}
                        {/* <button className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:text-indigo-600 transition-all">
                            <Edit className="w-5 h-5" />
                        </button> */}
                    </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN - Primary Profile */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100">
                                <Users className="w-8 h-8 mb-4 opacity-70" />
                                <div className="text-2xl font-black">{agent.stats?.totalStudents || 0}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest opacity-70">Total Students</div>
                            </div>
                            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm group hover:shadow-md transition-shadow">
                                <FileText className="w-8 h-8 mb-4 text-indigo-600 opacity-30 group-hover:opacity-100 transition-opacity" />
                                <div className="text-2xl font-black text-gray-900">{agent.stats?.totalApplications || 0}</div>
                                <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Applications</div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm min-h-[400px]">
                            <SectionHeader icon={User} title="Agent Identity" />
                            <div className="grid grid-cols-1 gap-6">
                                <DataRow label="Phone Number" value={agent.phone} />
                                <DataRow label="Alt. Phone" value={agent.alternatePhone} />
                                <DataRow label="Email Address" value={agent.email} />
                                <DataRow label="Physical Address" value={agent.address} fullWidth />
                                <div className="grid grid-cols-2 gap-4">
                                    <DataRow label="City" value={agent.city} />
                                    <DataRow label="State" value={agent.state} />
                                    <DataRow label="Pincode" value={agent.pincode} />
                                    <DataRow label="Country" value={agent.country} />
                                </div>
                                <div className="border-t pt-4 mt-2">
                                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Request Origin</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DataRow label="IP Address" value={agent.ipAddress || 'Unknown'} />
                                        <DataRow label="Device/OS" value={agent.os || 'Unknown'} />
                                        <DataRow label="Browser" value={agent.browser || 'Unknown'} fullWidth />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN - Business Details */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Company Detail Grid */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-30"></div>
                            <SectionHeader
                                icon={Building}
                                title="Corporation Profile"
                                subtitle="Official business registration and operational details."
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <div className="space-y-6">
                                    <DataRow label="Company Type" value={agent.companyType} />
                                    <DataRow label="Est. Year" value={agent.establishedYear} />
                                    <DataRow label="Reg. Number" value={agent.registrationNumber} />
                                </div>
                                <div className="space-y-6">
                                    <DataRow label="Website" value={agent.website ? (
                                        <a href={agent.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-800 flex items-center">
                                            Visit <ExternalLink className="w-3 h-3 ml-1" />
                                        </a>
                                    ) : 'N/A'} />
                                    <DataRow label="Designation" value={agent.designation} />
                                    <DataRow label="Experience" value={agent.experience} />
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Team Size</span>
                                            <span className="font-bold text-indigo-600">{agent.teamSize || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Rev. Range</span>
                                            <span className="font-bold text-green-600">{agent.annualRevenue || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase">Students</span>
                                            <span className="font-bold text-amber-600">{agent.currentStudents || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Proposal & Expertise */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                <SectionHeader icon={Target} title="The Proposal" />
                                <div className="space-y-6">
                                    <DataRow label="Partnership Logic" value={agent.partnershipType} />
                                    <DataRow label="Expected Flow" value={`${agent.expectedStudents || '0'} Students/Year`} />
                                    <DataRow label="Marketing Budget" value={agent.marketingBudget} />
                                    <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 italic text-sm text-amber-800">
                                        "{agent.whyPartner || 'No statement provided.'}"
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                                <SectionHeader icon={Award} title="Core Expertise" />
                                <div className="space-y-8">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-3 block">Specializations</label>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.specialization?.map((spec, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100">
                                                    {spec}
                                                </span>
                                            )) || <span className="text-gray-400 italic text-sm">None listed</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest font-bold text-indigo-400 mb-3 block">Services Offered</label>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.servicesOffered?.map((serv, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                                                    {serv}
                                                </span>
                                            )) || <span className="text-gray-400 italic text-sm">None listed</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Documentation Section */}
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <SectionHeader
                                icon={FileText}
                                title="Verification Vault"
                                subtitle="Official documents and registration certificates."
                            />
                            {agent.documents && agent.documents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agent.documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 group hover:border-indigo-300 transition-all">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-white rounded-xl mr-3 shadow-xs">
                                                    <FileText className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div className="capitalize font-bold text-gray-600 text-sm">{doc.documentType}</div>
                                            </div>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all opacity-0 group-hover:opacity-100">
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-[2rem] border border-dashed border-gray-300">
                                    <Info className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-400 font-medium italic text-sm">No digital documents have been uploaded yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Search API Access Control Section */}
                        <AccessControlSection agent={agent} onUpdate={fetchAgentDetails} />

                    </div>
                </div>

                {/* Footer Insight */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-[2rem] border border-gray-100 shadow-sm text-gray-500 text-xs font-medium">
                    <div className="flex items-center gap-6">
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-2 opacity-50" /> Joined {new Date(agent.createdAt || agent.created_at).toLocaleDateString()}</span>
                        {agent.lastLogin && <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 opacity-50" /> Last Active {new Date(agent.lastLogin).toLocaleDateString()}</span>}
                    </div>
                    {agent.approvedBy && (
                        <div className="mt-2 md:mt-0 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-bold">
                            Verified by {agent.approvedBy?.name || 'Administrator'}
                        </div>
                    )}
                </div>

            </div>

            {/* Premium Alert Dialog */}
            <AlertDialog open={confirmAction.isOpen} onOpenChange={(isOpen) => setConfirmAction(prev => ({ ...prev, isOpen }))}>
                <AlertDialogContent className="rounded-3xl p-8 border-none shadow-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black text-gray-900 mb-2">Final Confirmation</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 text-base">
                            {confirmAction.type === 'approve'
                                ? "You're about to approve this agent. An official welcome email with their unique login credentials will be generated and dispatched immediately."
                                : "Are you certain you want to reject this partnership? They will be notified of the decision and their application will be marked as rejected."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 gap-4">
                        <AlertDialogCancel className="rounded-xl border-2 border-gray-100 font-bold hover:bg-gray-50 hover:text-gray-900 px-6 h-12">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleAction}
                            className={`rounded-xl font-black text-white px-8 h-12 shadow-lg transition-all ${confirmAction.type === 'approve'
                                ? "bg-green-600 hover:bg-green-700 shadow-green-100"
                                : "bg-red-600 hover:bg-red-700 shadow-red-100"
                                }`}
                        >
                            {confirmAction.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

const AccessControlSection = ({ agent, onUpdate }) => {
    const [countries, setCountries] = useState([]);
    const [universities, setUniversities] = useState([]);
    const [selectedCountries, setSelectedCountries] = useState(agent.accessibleCountries || []);
    const [selectedUniversities, setSelectedUniversities] = useState(agent.accessibleUniversities || []);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const { success, error } = useToast();

    useEffect(() => {
        const loadData = async () => {
            try {
                setFetchLoading(true);
                const [countriesData, univsData] = await Promise.all([
                    externalSearchService.getCountries(),
                    externalSearchService.getUniversities()
                ]);
                setCountries(countriesData.data || countriesData || []);
                setUniversities(univsData.data || univsData || []);
            } catch (err) {
                console.error('Failed to load access control data', err);
            } finally {
                setFetchLoading(false);
            }
        };
        loadData();
    }, []);

    const handleToggleCountry = (countryName) => {
        setSelectedCountries(prev =>
            prev.includes(countryName)
                ? prev.filter(c => c !== countryName)
                : [...prev, countryName]
        );
    };

    const handleToggleUniversity = (univId) => {
        setSelectedUniversities(prev =>
            prev.includes(univId.toString())
                ? prev.filter(id => id !== univId.toString())
                : [...prev, univId.toString()]
        );
    };

    const handleSaveAccess = async () => {
        try {
            setLoading(true);
            await agentService.updateAgent(agent._id, {
                accessible_countries: selectedCountries,
                accessible_universities: selectedUniversities
            });
            success('Access control updated successfully');
            if (onUpdate) onUpdate();
        } catch (err) {
            error(err.response?.data?.message || 'Failed to update access control');
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mt-8 animate-pulse">
            <div className="h-8 bg-gray-100 rounded-xl w-48 mb-4"></div>
            <div className="h-24 bg-gray-50 rounded-2xl w-full"></div>
        </div>
    );

    return (
        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm mt-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-30"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <SectionHeader
                    icon={Shield}
                    title="API Access Control"
                    subtitle="Restrict which countries and universities this agent can access."
                />
                <button
                    onClick={handleSaveAccess}
                    disabled={loading}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center disabled:opacity-50"
                >
                    {loading ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Access Rules</>}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                {/* Country Access */}
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center">
                        <Globe className="w-3.5 h-3.5 mr-2" /> Permitted Countries
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {countries.map((country) => (
                            <button
                                key={country.name}
                                onClick={() => handleToggleCountry(country.name)}
                                className={`flex items-center p-3 rounded-xl border-2 transition-all text-left ${selectedCountries.includes(country.name)
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                        : 'border-gray-100 bg-white text-gray-500 hover:border-indigo-100'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${selectedCountries.includes(country.name) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                                    }`}>
                                    {selectedCountries.includes(country.name) && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-xs font-bold truncate">{country.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* University Access */}
                <div className="space-y-4">
                    <label className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center">
                        <Building className="w-3.5 h-3.5 mr-2" /> Specific University Access
                    </label>
                    <p className="text-[10px] text-gray-400 font-medium italic -mt-2">
                        Leave unselected to allow access to ALL universities in permitted countries.
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {universities
                            .filter(u => selectedCountries.includes(u.country))
                            .map((univ) => (
                                <button
                                    key={univ.id || univ.university_id}
                                    onClick={() => handleToggleUniversity(univ.id || univ.university_id)}
                                    className={`flex items-center p-3 rounded-xl border-2 transition-all text-left ${selectedUniversities.includes((univ.id || univ.university_id).toString())
                                            ? 'border-green-600 bg-green-50 text-green-700'
                                            : 'border-gray-100 bg-white text-gray-500 hover:border-green-100'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${selectedUniversities.includes((univ.id || univ.university_id).toString()) ? 'bg-green-600 border-green-600' : 'border-gray-300'
                                        }`}>
                                        {selectedUniversities.includes((univ.id || univ.university_id).toString()) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold truncate">{univ.name}</div>
                                        <div className="text-[10px] opacity-70 font-medium">{univ.city}, {univ.country}</div>
                                    </div>
                                </button>
                            ))}
                        {selectedCountries.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed text-gray-400 text-xs italic">
                                Select at least one country to see universities.
                            </div>
                        )}
                        {selectedCountries.length > 0 && universities.filter(u => selectedCountries.includes(u.country)).length === 0 && (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed text-gray-400 text-xs italic">
                                No universities found for selected countries.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDetailView;
