import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Search, X, RefreshCw, Trash2,
    Mail, CheckCircle2, Clock, Send, ArrowLeft, FileText,
    DollarSign, AlertTriangle, CreditCard, Upload, Eye
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import applicationService from '../../services/applicationService';
import { useToast } from '../../components/ui/toast';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader, AlertDialogTitle
} from '../../components/ui/alert-dialog';
import './StudentApplicationsList.css';

// ─── Stage & Status Constants ───
const STAGES = [
    'Pre-Payment', 'Pre-Submission', 'Submission', 'Post-Submission',
    'Admission', 'Visa-Application', 'Pre-Arrival', 'Post-Arrival', 'Arrival'
];
const PAYMENT_STATUSES = ['unpaid', 'paid', 'cancelled'];

/* ────────────────────────────────────────────── */
/*  Status Update Modal                           */
/* ────────────────────────────────────────────── */
const StatusModal = ({ isOpen, onClose, currentStatus, onSave, loading }) => {
    const [selected, setSelected] = useState(currentStatus);

    useEffect(() => { setSelected(currentStatus); }, [currentStatus]);

    if (!isOpen) return null;

    const colors = {
        unpaid: { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', ring: 'ring-amber-400' },
        paid: { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', ring: 'ring-emerald-400' },
        cancelled: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', ring: 'ring-red-400' },
    };

    return (
        <div className="sal-modal-overlay" onClick={onClose}>
            <div className="sal-modal" onClick={e => e.stopPropagation()}>
                <div className="sal-modal-header">
                    <DollarSign size={20} />
                    <h3>Update Payment Status</h3>
                    <button onClick={onClose} className="sal-modal-close"><X size={18} /></button>
                </div>
                <div className="sal-modal-body">
                    <div className="sal-status-options">
                        {PAYMENT_STATUSES.map(s => {
                            const c = colors[s];
                            return (
                                <button key={s}
                                    className={`sal-status-option ${c.bg} ${c.border} ${c.text} ${selected === s ? `ring-2 ${c.ring} shadow-md` : 'opacity-75'}`}
                                    onClick={() => setSelected(s)}>
                                    {selected === s && <CheckCircle2 size={16} />}
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="sal-modal-footer">
                    <button onClick={onClose} className="sal-btn-secondary" disabled={loading}>Cancel</button>
                    <button onClick={() => onSave(selected)} className="sal-btn-primary" disabled={loading || selected === currentStatus}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────── */
/*  Stage Update Modal                            */
/* ────────────────────────────────────────────── */
const StageModal = ({ isOpen, onClose, currentStage, onSave, loading }) => {
    const [selected, setSelected] = useState(currentStage);

    useEffect(() => { setSelected(currentStage); }, [currentStage]);

    if (!isOpen) return null;

    return (
        <div className="sal-modal-overlay" onClick={onClose}>
            <div className="sal-modal sal-modal-wide" onClick={e => e.stopPropagation()}>
                <div className="sal-modal-header">
                    <Clock size={20} />
                    <h3>Update Stage</h3>
                    <button onClick={onClose} className="sal-modal-close"><X size={18} /></button>
                </div>
                <div className="sal-modal-body">
                    <div className="sal-stage-grid">
                        {STAGES.map((s, i) => (
                            <button key={s}
                                className={`sal-stage-option ${selected === s ? 'sal-stage-active' : ''}`}
                                onClick={() => setSelected(s)}>
                                <span className="sal-stage-num">{i + 1}</span>
                                <span className="sal-stage-label">{s}</span>
                                {selected === s && <CheckCircle2 size={14} className="sal-stage-check" />}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="sal-modal-footer">
                    <button onClick={onClose} className="sal-btn-secondary" disabled={loading}>Cancel</button>
                    <button onClick={() => onSave(selected)} className="sal-btn-primary" disabled={loading || selected === currentStage}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────── */
/*  Send Mail Modal                               */
/* ────────────────────────────────────────────── */
const DEFAULT_GREETING = 'Dear Sir/Madam';
const DEFAULT_MESSAGE = `Greetings from Britannica Overseas Education,
Hope you are doing well. Kindly pursue the applicant information attached and eligibility of the applicant to issue offer letter. Feel free to contact us for further information. Expecting to listen from you at the earliest.`;
const DEFAULT_FOOTER = `With Best Regards,

Aman Ahlawat
Director
Britannica Overseas Education

Ramada Dua Sentral Plaza, Jalan Tun Sambanthan, 50470, Kuala Lumpur, Malaysia
B-16, GF, Mayfield Garden, Sector-50, Gurgaon, Haryana, India

Hand Phone: +60-104306704, +91-9870406867
WeChat, Kakao Talk: +60-104306704
Facebook page: https://www.facebook.com/educationmalaysia.in`;

// Added import at the top of the file in the next step, assuming it's done or we'll add it along with the component updates.
const SendMailModal = ({ isOpen, onClose, application, student, onSend, loading }) => {
    const [form, setForm] = useState({
        sentTo: '', cc: '', greeting: DEFAULT_GREETING, messageBody: DEFAULT_MESSAGE, footer: DEFAULT_FOOTER
    });
    const [selectedDocs, setSelectedDocs] = useState([]);
    const [mailSignatures, setMailSignatures] = useState([]);
    const [selectedSignatureId, setSelectedSignatureId] = useState('');
    const [isLoadingSignatures, setIsLoadingSignatures] = useState(false);

    // Fetch signatures when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchSignatures();
        }
    }, [isOpen]);

    const fetchSignatures = async () => {
        try {
            setIsLoadingSignatures(true);
            // Dynamic import or assume it's imported at the top (will fix imports in a separate call)
            const { default: mailSignatureService } = await import('../../services/mailSignatureService');
            const response = await mailSignatureService.getSignatures();
            const fetchedSigs = response.data || [];
            setMailSignatures(fetchedSigs);

            // Find active signature
            const activeSig = fetchedSigs.find(s => s.isActive);
            if (activeSig) {
                setSelectedSignatureId(activeSig._id);
                // We'll update the form footer in the other useEffect
            }
        } catch (error) {
            console.error('Failed to fetch mail signatures:', error);
        } finally {
            setIsLoadingSignatures(false);
        }
    };

    useEffect(() => {
        if (isOpen && student) {
            setForm(prev => ({
                ...prev,
                sentTo: student.email || '',
                cc: '',
                greeting: DEFAULT_GREETING,
                messageBody: DEFAULT_MESSAGE,
                // footer is handled separately now based on signature selection
            }));
            setSelectedDocs([]);
        }
    }, [isOpen, student]);

    // Handle Signature Selection Change
    useEffect(() => {
        if (!isOpen) return;

        if (selectedSignatureId === 'default' || !selectedSignatureId) {
            setForm(prev => ({ ...prev, footer: DEFAULT_FOOTER }));
            return;
        }

        const sig = mailSignatures.find(s => s._id === selectedSignatureId);
        if (sig && sig.signatureContent) {
            setForm(prev => ({ ...prev, footer: sig.signatureContent }));
        }
    }, [selectedSignatureId, mailSignatures, isOpen]);

    if (!isOpen) return null;

    // Extract student documents — handle both string paths AND object {path, originalName}
    const studentDocs = student?.documents || {};
    const docEntries = Object.entries(studentDocs).filter(([key, val]) => {
        if (!val) return false;
        if (typeof val === 'string') return val.length > 0;       // plain string path
        if (typeof val === 'object' && val.path) return true;      // object with path
        return false;
    });

    const getDocName = (key, val) => {
        if (typeof val === 'object' && val.originalName) return val.originalName;
        // Format key as readable name: marksheet_10 → Marksheet 10
        return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    const toggleDoc = (key) => {
        setSelectedDocs(prev =>
            prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]
        );
    };

    const selectAllDocs = () => {
        if (selectedDocs.length === docEntries.length) {
            setSelectedDocs([]);
        } else {
            setSelectedDocs(docEntries.map(([key]) => key));
        }
    };

    const handleSubmit = () => {
        onSend({
            sentTo: form.sentTo,
            cc: form.cc,
            greeting: form.greeting,
            messageBody: form.messageBody,
            footer: form.footer,
            attachedDocumentKeys: selectedDocs
        });
    };

    return (
        <div className="sal-modal-overlay" onClick={onClose}>
            <div className="sal-modal sal-modal-large" onClick={e => e.stopPropagation()}
                style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="sal-modal-header sal-mail-header">
                    <Mail size={20} />
                    <h3>Send Application Email</h3>
                    <button onClick={onClose} className="sal-modal-close"><X size={18} /></button>
                </div>
                <div className="sal-modal-body sal-mail-body" style={{ overflowY: 'auto', flex: 1 }}>
                    <div className="sal-mail-grid">
                        <div className="sal-mail-field">
                            <label>Send To *</label>
                            <input type="email" value={form.sentTo}
                                onChange={e => setForm({ ...form, sentTo: e.target.value })}
                                placeholder="recipient@email.com" />
                        </div>
                        <div className="sal-mail-field">
                            <label>CC</label>
                            <input type="text" value={form.cc}
                                onChange={e => setForm({ ...form, cc: e.target.value })}
                                placeholder="cc@email.com" />
                        </div>
                    </div>
                    <div className="sal-mail-field">
                        <label>Greeting</label>
                        <input type="text" value={form.greeting}
                            onChange={e => setForm({ ...form, greeting: e.target.value })}
                            placeholder="Dear Sir/Madam" />
                    </div>
                    <div className="sal-mail-field sal-mail-full">
                        <label>Message Body *</label>
                        <textarea rows={4} value={form.messageBody}
                            onChange={e => setForm({ ...form, messageBody: e.target.value })}
                            placeholder="Type your message here..." />
                    </div>

                    {/* Auto-injected Info */}
                    <div style={{
                        padding: '0.5rem 0.8rem', background: '#eff6ff', border: '1px solid #bfdbfe',
                        borderRadius: '0.375rem', fontSize: '0.72rem', color: '#1e40af', lineHeight: '1.4'
                    }}>
                        <strong>ℹ️ Auto-included:</strong> Program details, Student personal info, Address & Education summary tables.
                    </div>

                    {/* Signature Selection */}
                    <div className="sal-mail-field sal-mail-full">
                        <label>Select Template Signature</label>
                        <select
                            value={selectedSignatureId}
                            onChange={(e) => setSelectedSignatureId(e.target.value)}
                            disabled={isLoadingSignatures}
                            style={{
                                width: '100%', padding: '0.5rem 0.75rem',
                                border: '1px solid #e2e8f0', borderRadius: '0.375rem',
                                fontSize: '0.875rem', color: '#374151',
                                backgroundColor: isLoadingSignatures ? '#f3f4f6' : 'white'
                            }}
                        >
                            <option value="default">Default System Signature</option>
                            {mailSignatures.map(sig => (
                                <option key={sig._id} value={sig._id}>
                                    {sig.name}
                                </option>
                            ))}
                        </select>
                        {isLoadingSignatures && <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>Loading signatures...</p>}
                    </div>

                    {/* Document Attachments */}
                    <div className="sal-mail-docs" style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                                <FileText size={16} /> Attach Documents
                                <span style={{ fontSize: '0.7rem', color: '#9ca3af', fontWeight: 400 }}>
                                    ({docEntries.length} available)
                                </span>
                            </h4>
                            {docEntries.length > 0 && (
                                <button onClick={selectAllDocs}
                                    style={{
                                        background: 'none', border: '1px solid #d1d5db', borderRadius: '0.25rem',
                                        padding: '0.2rem 0.5rem', fontSize: '0.72rem', cursor: 'pointer', color: '#4b5563'
                                    }}>
                                    {selectedDocs.length === docEntries.length ? 'Deselect All' : 'Select All'}
                                </button>
                            )}
                        </div>
                        {docEntries.length > 0 ? (
                            <>
                                <div className="sal-doc-list">
                                    {docEntries.map(([key, val]) => (
                                        <label key={key} className={`sal-doc-item ${selectedDocs.includes(key) ? 'sal-doc-selected' : ''}`}>
                                            <input type="checkbox" checked={selectedDocs.includes(key)}
                                                onChange={() => toggleDoc(key)} />
                                            <span>{getDocName(key, val)}</span>
                                        </label>
                                    ))}
                                </div>
                                {selectedDocs.length > 0 && (
                                    <p style={{ fontSize: '0.72rem', color: '#059669', margin: '0.35rem 0 0' }}>
                                        ✓ {selectedDocs.length} document(s) will be attached to the email
                                    </p>
                                )}
                            </>
                        ) : (
                            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0.25rem 0 0' }}>No documents uploaded for this student</p>
                        )}
                    </div>
                </div>
                <div className="sal-modal-footer">
                    <button onClick={onClose} className="sal-btn-secondary" disabled={loading}>Cancel</button>
                    <button onClick={handleSubmit} className="sal-btn-send"
                        disabled={loading || !form.sentTo || !form.messageBody}>
                        {loading ? 'Sending...' : <><Send size={16} /> Send Email</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────── */
/*  Payment Modal                                  */
/* ────────────────────────────────────────────── */
const PaymentModal = ({ isOpen, onClose, onSave, loading }) => {
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [files, setFiles] = useState([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPaymentDate(new Date().toISOString().split('T')[0]);
            setFiles([]);
            setNotes('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selected = Array.from(e.target.files);
        if (files.length + selected.length > 5) {
            alert('Maximum 5 files allowed');
            return;
        }
        setFiles(prev => [...prev, ...selected]);
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        const formData = new FormData();
        formData.append('paymentDate', paymentDate);
        if (notes) formData.append('notes', notes);
        files.forEach(f => formData.append('paymentProof', f));
        onSave(formData);
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="sal-modal-overlay" onClick={onClose}>
            <div className="sal-modal sal-modal-wide" onClick={e => e.stopPropagation()}>
                <div className="sal-modal-header" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', color: 'white', border: 'none' }}>
                    <FileText size={20} />
                    <h3>Upload Invoice</h3>
                    <button onClick={onClose} className="sal-modal-close" style={{ color: 'rgba(255,255,255,0.7)' }}><X size={18} /></button>
                </div>
                <div className="sal-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Payment Date */}
                    <div className="sal-mail-field">
                        <label>Invoice Date *</label>
                        <input type="date" value={paymentDate}
                            onChange={e => setPaymentDate(e.target.value)}
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }} />
                    </div>

                    {/* Notes */}
                    <div className="sal-mail-field">
                        <label>Notes</label>
                        <input type="text" value={notes}
                            onChange={e => setNotes(e.target.value)}
                            placeholder="e.g. Invoice #1234, Bank transfer"
                            style={{ padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.375rem', fontSize: '0.875rem' }} />
                    </div>

                    {/* File Upload */}
                    <div className="sal-mail-docs">
                        <h4><Upload size={16} /> Invoice Proof (Photo / PDF)</h4>
                        <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Max 5 files • JPG, PNG, PDF • 10MB each</p>
                        <label style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '1rem', border: '2px dashed #d1d5db', borderRadius: '0.5rem',
                            cursor: 'pointer', color: '#6b7280', fontSize: '0.85rem',
                            transition: 'all 0.15s', background: 'white'
                        }}>
                            <Upload size={18} />
                            <span>Click to upload files</span>
                            <input type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
                                onChange={handleFileChange} style={{ display: 'none' }} />
                        </label>

                        {/* File list */}
                        {files.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                                {files.map((f, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.4rem 0.6rem', background: '#ecfdf5', border: '1px solid #a7f3d0',
                                        borderRadius: '0.375rem', fontSize: '0.8rem'
                                    }}>
                                        <FileText size={14} style={{ color: '#059669', flexShrink: 0 }} />
                                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                                        <span style={{ color: '#6b7280', fontSize: '0.72rem', flexShrink: 0 }}>{formatSize(f.size)}</span>
                                        <button onClick={() => removeFile(i)} style={{
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.15rem'
                                        }}><X size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="sal-modal-footer">
                    <button onClick={onClose} className="sal-btn-secondary" disabled={loading}>Cancel</button>
                    <button onClick={handleSubmit} className="sal-btn-primary"
                        style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                        disabled={loading || !paymentDate}>
                        {loading ? 'Saving...' : 'Upload Validation'}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ════════════════════════════════════════════════ */
/*  Main Component: StudentApplicationsList        */
/* ════════════════════════════════════════════════ */
const StudentApplicationsList = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [student, setStudent] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRows, setExpandedRows] = useState({});

    // Modal states
    const [statusModal, setStatusModal] = useState({ open: false, appId: null, current: '' });
    const [stageModal, setStageModal] = useState({ open: false, appId: null, current: '' });
    const [mailModal, setMailModal] = useState({ open: false, appId: null, app: null });
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, appId: null, appNo: '' });
    const [payModal, setPayModal] = useState({ open: false, appId: null });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await applicationService.getStudentApplications(studentId);
            setStudent(response.data?.student || null);
            setApplications(response.data?.applications || []);
        } catch (err) {
            console.error('Error:', err);
            toast.error(err.response?.data?.message || 'Failed to fetch applications');
        } finally {
            setLoading(false);
        }
    }, [studentId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Status Update ──
    const handleStatusSave = async (newStatus) => {
        try {
            setActionLoading(true);
            await applicationService.updateStatus(statusModal.appId, newStatus);
            toast.success('Payment status updated');
            setStatusModal({ open: false, appId: null, current: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        } finally { setActionLoading(false); }
    };

    // ── Stage Update ──
    const handleStageSave = async (newStage) => {
        try {
            setActionLoading(true);
            await applicationService.updateStage(stageModal.appId, newStage);
            toast.success('Stage updated');
            setStageModal({ open: false, appId: null, current: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update stage');
        } finally { setActionLoading(false); }
    };

    // ── Send Mail ──
    const handleSendMail = async (mailData) => {
        try {
            setActionLoading(true);
            await applicationService.sendMail(mailModal.appId, mailData);
            toast.success('Email sent successfully');
            setMailModal({ open: false, appId: null, app: null });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send email');
        } finally { setActionLoading(false); }
    };

    // ── Delete ──
    const handleDelete = async () => {
        try {
            setActionLoading(true);
            await applicationService.deleteApplication(deleteConfirm.appId);
            toast.success('Application deleted');
            setDeleteConfirm({ open: false, appId: null, appNo: '' });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        } finally { setActionLoading(false); }
    };

    // ── Payment ──
    const handlePayment = async (formData) => {
        try {
            setActionLoading(true);
            await applicationService.updatePayment(payModal.appId, formData);
            toast.success('Payment recorded successfully');
            setPayModal({ open: false, appId: null });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to record payment');
        } finally { setActionLoading(false); }
    };

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Filter
    const filtered = applications.filter(app => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            app.applicationNo?.toLowerCase().includes(s) ||
            app.programSnapshot?.programName?.toLowerCase().includes(s) ||
            app.programSnapshot?.universityName?.toLowerCase().includes(s) ||
            app.stage?.toLowerCase().includes(s)
        );
    });

    // Badges
    const StatusBadge = ({ status, onClick }) => {
        const styles = {
            unpaid: 'sal-badge-amber', paid: 'sal-badge-emerald', cancelled: 'sal-badge-red'
        };
        return (
            <button className={`sal-badge sal-badge-clickable ${styles[status] || 'sal-badge-gray'}`} onClick={onClick}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
        );
    };

    const StageBadge = ({ stage, onClick }) => (
        <button className="sal-badge sal-badge-clickable sal-badge-indigo" onClick={onClick}>
            {stage}
        </button>
    );

    const SentBadge = ({ isSent }) => (
        <span className={`sal-badge ${isSent ? 'sal-badge-emerald' : 'sal-badge-gray'}`}>
            {isSent ? '✓ Sent' : 'Not Sent'}
        </span>
    );

    const studentName = student ? `${student.firstName || ''} ${student.lastName || ''}`.trim() : '';

    return (
        <div className="p-6">
            <PageHeader breadcrumbs={[
                { label: 'Dashboard', link: '/dashboard' },
                { label: 'Applied Students', link: '/applied-students' },
                { label: studentName || 'Student Applications' }
            ]} />

            {/* Header */}
            <div className="sal-header">
                <div className="sal-header-left">
                    <button onClick={() => navigate('/applied-students')} className="sal-back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="sal-title">
                            {studentName ? `${studentName}'s Applications` : 'Student Applications'}
                        </h1>
                        {student?.email && <p className="sal-subtitle">{student.email}</p>}
                    </div>
                    <span className="sal-count">{applications.length}</span>
                </div>
                <div className="sal-header-right">
                    <div className="sal-search-wrap">
                        <Search size={16} className="sal-search-icon" />
                        <input type="text" placeholder="Search by App #, Program, Stage..."
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                            className="sal-search-input" />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm('')} className="sal-search-clear">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <button onClick={fetchData} disabled={loading}
                        className="sal-refresh-btn">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="sal-loading">
                    <div className="sal-spinner" />
                </div>
            )}

            {/* Empty */}
            {!loading && filtered.length === 0 && (
                <div className="sal-empty">
                    <FileText size={48} className="sal-empty-icon" />
                    <h3>No Applications Found</h3>
                    <p>{searchTerm ? 'Try adjusting your search terms' : 'No program applications yet for this student'}</p>
                </div>
            )}

            {/* Table */}
            {!loading && filtered.length > 0 && (
                <div className="sal-table-wrap">
                    <table className="sal-table">
                        <thead>
                            <tr>
                                <th>S.N.</th>
                                <th>App #</th>
                                <th>Program</th>
                                <th>Status</th>
                                <th>Stage</th>
                                <th>Payment Date</th>
                                <th>Invoice</th>
                                <th>Send Mail</th>
                                <th>Sent</th>
                                <th>View</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((app, index) => (
                                <React.Fragment key={app._id}>
                                    <tr className="sal-row">
                                        <td className="sal-sn">{index + 1}</td>
                                        <td>
                                            <button className="sal-app-link"
                                                onClick={() => navigate(`/applications/${app._id}`)}>
                                                {app.applicationNo}
                                            </button>
                                        </td>
                                        <td className="sal-program-cell">
                                            <div className="sal-program-name">{app.programSnapshot?.programName || 'N/A'}</div>
                                            <div className="sal-university-name">{app.programSnapshot?.universityName || ''}</div>
                                        </td>
                                        <td>
                                            <StatusBadge status={app.paymentStatus}
                                                onClick={() => setStatusModal({ open: true, appId: app._id, current: app.paymentStatus })} />
                                        </td>
                                        <td>
                                            <StageBadge stage={app.stage}
                                                onClick={() => setStageModal({ open: true, appId: app._id, current: app.stage })} />
                                        </td>
                                        <td className="sal-date">
                                            {app.paymentDate ? new Date(app.paymentDate).toLocaleDateString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            }) : '—'}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', justifyContent: 'center' }}>
                                                {app.paymentStatus === 'paid' && (
                                                    <span className="sal-badge sal-badge-emerald" style={{ fontSize: '0.72rem', cursor: 'default' }} title="Paid">✓</span>
                                                )}
                                                <button className="sal-mail-btn" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                                                    onClick={() => setPayModal({ open: true, appId: app._id })}>
                                                    <Upload size={15} /> Upload
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="sal-mail-btn"
                                                onClick={() => setMailModal({ open: true, appId: app._id, app })}>
                                                <Mail size={15} /> Send
                                            </button>
                                        </td>
                                        <td><SentBadge isSent={app.isSent} /></td>
                                        <td>
                                            <button className="sal-mail-btn" style={{ background: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' }}
                                                onClick={() => navigate(`/applications/${app._id}`)}>
                                                <Eye size={15} /> View
                                            </button>
                                        </td>
                                        <td>
                                            {app.paymentStatus !== 'paid' ? (
                                                <button className="sal-delete-btn"
                                                    onClick={() => setDeleteConfirm({ open: true, appId: app._id, appNo: app.applicationNo })}>
                                                    <Trash2 size={15} />
                                                </button>
                                            ) : (
                                                <span style={{ color: '#d1d5db' }}>—</span>
                                            )}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Modals ── */}
            <StatusModal isOpen={statusModal.open}
                onClose={() => setStatusModal({ open: false, appId: null, current: '' })}
                currentStatus={statusModal.current}
                onSave={handleStatusSave} loading={actionLoading} />

            <StageModal isOpen={stageModal.open}
                onClose={() => setStageModal({ open: false, appId: null, current: '' })}
                currentStage={stageModal.current}
                onSave={handleStageSave} loading={actionLoading} />

            <PaymentModal isOpen={payModal.open}
                onClose={() => setPayModal({ open: false, appId: null })}
                onSave={handlePayment} loading={actionLoading} />

            <SendMailModal isOpen={mailModal.open}
                onClose={() => setMailModal({ open: false, appId: null, app: null })}
                application={mailModal.app} student={student}
                onSend={handleSendMail} loading={actionLoading} />

            {/* Delete Confirmation */}
            <AlertDialog open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm(prev => ({ ...prev, open }))}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="text-red-500" size={20} />
                            Delete Application
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete application <strong>{deleteConfirm.appNo}</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" disabled={actionLoading}>
                            {actionLoading ? 'Deleting...' : 'Yes, Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default StudentApplicationsList;
