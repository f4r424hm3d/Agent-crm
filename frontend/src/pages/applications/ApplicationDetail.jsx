import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, User, GraduationCap, Building2, DollarSign,
    Clock, Mail, FileText, Activity, MapPin, Calendar,
    CheckCircle2, AlertCircle, RefreshCw, CreditCard, Download
} from 'lucide-react';
import PageHeader from '../../components/layout/PageHeader';
import applicationService from '../../services/applicationService';
import { useToast } from '../../components/ui/toast';
import './StudentApplicationsList.css';

const STAGES = [
    'Pre-Payment', 'Pre-Submission', 'Submission', 'Post-Submission',
    'Admission', 'Visa-Application', 'Pre-Arrival', 'Post-Arrival', 'Arrival'
];

/* ────────────────────────────────────────────── */
/*  Progress Bar Component                        */
/* ────────────────────────────────────────────── */
const StageProgressBar = ({ currentStage }) => {
    const currentIndex = STAGES.indexOf(currentStage);

    return (
        <div className="ad-progress-wrap">
            <div className="ad-progress-title">Application Progress</div>
            <div className="ad-progress-bar">
                {STAGES.map((stage, i) => {
                    let state = 'inactive';
                    if (i < currentIndex) state = 'completed';
                    else if (i === currentIndex) state = 'active';

                    return (
                        <React.Fragment key={stage}>
                            <div className="ad-progress-step">
                                <div className={`ad-progress-dot ${state}`}>
                                    {state === 'completed' ? '✓' : i + 1}
                                </div>
                                <span className="ad-progress-label">{stage}</span>
                            </div>
                            {i < STAGES.length - 1 && (
                                <div className={`ad-progress-line ${i < currentIndex ? 'completed' : ''}`} />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

/* ────────────────────────────────────────────── */
/*  Info Row Component                            */
/* ────────────────────────────────────────────── */
const InfoItem = ({ label, value }) => (
    <div className="ad-info-item">
        <span className="ad-info-label">{label}</span>
        <span className="ad-info-value">{value || 'N/A'}</span>
    </div>
);

/* ════════════════════════════════════════════════ */
/*  Main Component: ApplicationDetail              */
/* ════════════════════════════════════════════════ */
const ApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await applicationService.getApplicationById(id);
            setApplication(response.data);
        } catch (err) {
            console.error('Error:', err);
            toast.error(err.response?.data?.message || 'Failed to load application');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) {
        return (
            <div className="sal-loading">
                <div className="sal-spinner" />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="sal-empty">
                <AlertCircle size={48} className="sal-empty-icon" />
                <h3>Application Not Found</h3>
                <p>The application you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate(-1)} className="sal-btn-primary mt-4">Go Back</button>
            </div>
        );
    }

    const student = application.studentId || {};
    const snapshot = application.programSnapshot || {};
    const statusHistory = application.statusHistory || [];
    const mailHistory = application.mailHistory || [];

    const formatDate = (d) => {
        if (!d) return 'N/A';
        return new Date(d).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatDateTime = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true
        });
    };

    // Sort combined timeline (newest first)
    const timeline = [...statusHistory].sort((a, b) =>
        new Date(b.changedAt) - new Date(a.changedAt)
    );

    return (
        <div className="p-6 ad-container">
            <PageHeader breadcrumbs={[
                { label: 'Dashboard', link: '/dashboard' },
                { label: 'Applied Students', link: '/applied-students' },
                {
                    label: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student',
                    link: `/student-applications/${application.studentId?._id || ''}`
                },
                { label: application.applicationNo }
            ]} />

            {/* Header */}
            <div className="ad-header">
                <div className="ad-header-left">
                    <button onClick={() => navigate(-1)} className="sal-back-btn">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="ad-header-info">
                        <h1>{application.applicationNo}</h1>
                        <p>{snapshot.programName || 'Unknown Program'} • {snapshot.universityName || ''}</p>
                    </div>
                </div>
                <div className="ad-badges">
                    <span className={`sal-badge ${application.paymentStatus === 'paid' ? 'sal-badge-emerald' :
                        application.paymentStatus === 'cancelled' ? 'sal-badge-red' : 'sal-badge-amber'
                        }`}>
                        <DollarSign size={12} />
                        {application.paymentStatus.charAt(0).toUpperCase() + application.paymentStatus.slice(1)}
                    </span>
                    <span className="sal-badge sal-badge-indigo">
                        <Clock size={12} />
                        {application.stage}
                    </span>
                    {application.isSent && (
                        <span className="sal-badge sal-badge-emerald">
                            <Mail size={12} /> Sent
                        </span>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <StageProgressBar currentStage={application.stage} />

            {/* Info Sections */}
            <div className="ad-grid">
                {/* Student Info */}
                <div className="ad-section">
                    <div className="ad-section-header"><User size={16} /> Student Information</div>
                    <div className="ad-section-body">
                        <div className="ad-info-grid">
                            <InfoItem label="Name" value={`${student.firstName || ''} ${student.lastName || ''}`.trim()} />
                            <InfoItem label="Email" value={student.email} />
                            <InfoItem label="Phone" value={student.phone} />
                            <InfoItem label="Nationality" value={student.nationality} />
                            <InfoItem label="Passport" value={student.passportNumber} />
                            <InfoItem label="Gender" value={student.gender} />
                        </div>
                    </div>
                </div>

                {/* Program Info */}
                <div className="ad-section">
                    <div className="ad-section-header"><GraduationCap size={16} /> Program Information</div>
                    <div className="ad-section-body">
                        <div className="ad-info-grid">
                            <InfoItem label="Program" value={snapshot.programName} />
                            <InfoItem label="University" value={snapshot.universityName} />
                            <InfoItem label="Country" value={snapshot.countryName} />
                            <InfoItem label="Level" value={snapshot.level} />
                            <InfoItem label="Duration" value={snapshot.duration} />
                            <InfoItem label="Specialization" value={snapshot.specialization} />
                        </div>
                    </div>
                </div>

                {/* Application Status */}
                <div className="ad-section">
                    <div className="ad-section-header"><Activity size={16} /> Application Status</div>
                    <div className="ad-section-body">
                        <div className="ad-info-grid">
                            <InfoItem label="Application No" value={application.applicationNo} />
                            <InfoItem label="Stage" value={application.stage} />
                            <InfoItem label="Payment Status" value={application.paymentStatus} />
                            <InfoItem label="Applied On" value={formatDate(application.applyDate)} />
                            <InfoItem label="Payment Date" value={formatDate(application.paymentDate)} />
                            <InfoItem label="Submitted" value={application.submittedByAgent ? 'Yes' : 'No'} />
                        </div>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="ad-section">
                    <div className="ad-section-header" style={{ color: '#059669' }}><CreditCard size={16} /> Payment Details</div>
                    <div className="ad-section-body">
                        <div className="ad-info-grid">
                            <InfoItem label="Payment Status" value={
                                <span style={{
                                    padding: '0.15rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', fontWeight: 600,
                                    background: application.paymentStatus === 'paid' ? '#ecfdf5' : application.paymentStatus === 'cancelled' ? '#fef2f2' : '#fffbeb',
                                    color: application.paymentStatus === 'paid' ? '#059669' : application.paymentStatus === 'cancelled' ? '#dc2626' : '#d97706',
                                }}>
                                    {application.paymentStatus.charAt(0).toUpperCase() + application.paymentStatus.slice(1)}
                                </span>
                            } />
                            <InfoItem label="Payment Date" value={formatDate(application.paymentDate)} />
                        </div>

                        {/* Payment Proof Files */}
                        {application.paymentProof && application.paymentProof.length > 0 ? (
                            <div style={{ marginTop: '1rem' }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                                    Payment Proof ({application.paymentProof.length} file{application.paymentProof.length > 1 ? 's' : ''})
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {application.paymentProof.map((proof, i) => {
                                        const isPdf = proof.mimeType === 'application/pdf';
                                        const isImage = proof.mimeType?.startsWith('image/');
                                        const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                                        const fileUrl = `${backendUrl}/${proof.path}`;
                                        const formatSize = (bytes) => {
                                            if (!bytes) return '';
                                            if (bytes < 1024) return bytes + ' B';
                                            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                                            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
                                        };

                                        return (
                                            <div key={proof._id || i} style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                padding: '0.5rem 0.75rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
                                                borderRadius: '0.375rem', fontSize: '0.82rem'
                                            }}>
                                                {isPdf ? (
                                                    <FileText size={16} style={{ color: '#dc2626', flexShrink: 0 }} />
                                                ) : (
                                                    <FileText size={16} style={{ color: '#059669', flexShrink: 0 }} />
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {proof.originalName || proof.fileName}
                                                    </div>
                                                    <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                                                        {formatSize(proof.size)}
                                                        {proof.uploadedAt && ` • Uploaded ${formatDateTime(proof.uploadedAt)}`}
                                                    </div>
                                                </div>
                                                <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                                                        padding: '0.25rem 0.5rem', background: '#059669', color: 'white',
                                                        borderRadius: '0.25rem', fontSize: '0.72rem', textDecoration: 'none',
                                                        fontWeight: 500, flexShrink: 0
                                                    }}>
                                                    <Download size={12} /> View
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            application.paymentStatus === 'paid' && (
                                <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: '0.75rem' }}>No payment proof uploaded</p>
                            )
                        )}
                    </div>
                </div>

                {/* Documents */}
                <div className="ad-section">
                    <div className="ad-section-header"><FileText size={16} /> Uploaded Documents</div>
                    <div className="ad-section-body">
                        {student.documents && Object.keys(student.documents).length > 0 ? (() => {
                            const docEntries = Object.entries(student.documents).filter(([, val]) => {
                                if (!val) return false;
                                if (typeof val === 'string') return val.length > 0;
                                if (typeof val === 'object' && val.path) return true;
                                return false;
                            });
                            const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

                            return docEntries.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                    {docEntries.map(([key, val]) => {
                                        const docPath = typeof val === 'string' ? val : val.path;
                                        const docName = (typeof val === 'object' && val.originalName)
                                            ? val.originalName
                                            : key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                                        const fileUrl = `${backendUrl}/${docPath}`;
                                        const isPdf = docPath.endsWith('.pdf');

                                        return (
                                            <div key={key}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    padding: '0.5rem 0.75rem', background: '#f8fafc', borderRadius: '0.375rem',
                                                    border: '1px solid #e5e7eb', fontSize: '0.85rem'
                                                }}>
                                                <FileText size={16} style={{ color: isPdf ? '#dc2626' : '#3b82f6', flexShrink: 0 }} />
                                                <span style={{ flex: 1, fontWeight: 500 }}>{docName}</span>
                                                <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                                                    style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                                                        padding: '0.2rem 0.5rem', background: '#eff6ff', color: '#1e40af',
                                                        border: '1px solid #bfdbfe', borderRadius: '0.25rem',
                                                        fontSize: '0.72rem', fontWeight: 500, textDecoration: 'none', flexShrink: 0
                                                    }}>
                                                    <Download size={11} /> View
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No documents uploaded</p>
                            );
                        })() : (
                            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No documents uploaded</p>
                        )}
                    </div>
                </div>

                {/* Mail History */}
                <div className="ad-section ad-section-full">
                    <div className="ad-section-header"><Mail size={16} /> Mail History</div>
                    <div className="ad-section-body">
                        {mailHistory.length > 0 ? (
                            mailHistory.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)).map((mail, i) => (
                                <div key={mail._id || i} className="ad-mail-item">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span className="ad-mail-to">To: {mail.sentTo}</span>
                                        <span className="ad-mail-date">{formatDateTime(mail.sentAt)}</span>
                                    </div>
                                    {mail.subject && (
                                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1f2937', marginTop: '0.25rem' }}>
                                            Subject: {mail.subject}
                                        </div>
                                    )}
                                    {mail.sentByName && (
                                        <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '0.15rem' }}>
                                            Sent by: {mail.sentByName}
                                        </div>
                                    )}
                                    {mail.messageBody && (
                                        <div className="ad-mail-body-preview">{mail.messageBody}</div>
                                    )}
                                    {mail.attachedDocuments?.length > 0 && (
                                        <div style={{ marginTop: '0.5rem' }}>
                                            <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                                                📎 Attachments ({mail.attachedDocuments.length})
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                                {mail.attachedDocuments.map((doc, j) => {
                                                    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                                                    const fileUrl = `${backendUrl}/${doc.filePath}`;
                                                    return (
                                                        <a key={j} href={fileUrl} target="_blank" rel="noopener noreferrer"
                                                            style={{
                                                                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                                padding: '0.3rem 0.6rem', background: '#f0fdf4', border: '1px solid #bbf7d0',
                                                                borderRadius: '0.3rem', fontSize: '0.72rem', color: '#059669',
                                                                textDecoration: 'none', fontWeight: 500, cursor: 'pointer',
                                                                transition: 'all 0.15s'
                                                            }}>
                                                            <FileText size={12} />
                                                            {doc.fileName || doc.documentKey}
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No emails sent yet</p>
                        )}
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="ad-section ad-section-full">
                    <div className="ad-section-header"><Clock size={16} /> Activity Timeline</div>
                    <div className="ad-section-body">
                        {timeline.length > 0 ? (
                            <div className="ad-timeline">
                                {timeline.map((entry, i) => (
                                    <div key={entry._id || i} className="ad-timeline-item">
                                        <div className={`ad-timeline-dot ${entry.actionType || 'status'}`} />
                                        <div className="ad-timeline-date">{formatDateTime(entry.changedAt)}</div>
                                        <div className="ad-timeline-text">
                                            {entry.actionType === 'status' && (
                                                <>Status changed: <strong>{entry.oldValue || entry.oldStatus}</strong> → <strong>{entry.newValue || entry.newStatus}</strong></>
                                            )}
                                            {entry.actionType === 'stage' && (
                                                <>Stage changed: <strong>{entry.oldValue}</strong> → <strong>{entry.newValue}</strong></>
                                            )}
                                            {entry.actionType === 'mail' && (
                                                <>{entry.newValue || entry.notes}</>
                                            )}
                                            {!entry.actionType && (
                                                <>{entry.notes || `${entry.oldStatus} → ${entry.newStatus}`}</>
                                            )}
                                        </div>
                                        {entry.changedByName && (
                                            <div className="ad-timeline-by">by {entry.changedByName}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No activity recorded yet</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetail;
