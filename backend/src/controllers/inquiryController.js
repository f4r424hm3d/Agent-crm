const { Agent } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const otpGenerator = require('../utils/otpGenerator');
const emailService = require('../services/emailService');

// In-memory OTP storage for simplicity in public registration
// For production, this should ideally be in Redis or a DB collection
const otpStore = new Map();

class InquiryController {
    /**
     * Submit Partner Application (Agent Registration)
     * POST /api/inquiry/partner-application
     */
    static async submitPartnerApplication(req, res) {
        try {
            const {
                firstName,
                lastName,
                email,
                phone,
                alternatePhone,
                companyName,
                companyType,
                registrationNumber,
                establishedYear,
                website,
                address,
                city,
                state,
                pincode,
                country = 'India',
                designation,
                experience,
                qualification,
                specialization,
                currentStudents,
                annualRevenue,
                teamSize,
                servicesOffered,
                partnershipType,
                expectedStudents,
                marketingBudget,
                references,
                whyPartner,
                additionalInfo,
                termsAccepted,
                dataConsent,
                latitude,
                longitude,
                documents // Expecting array of objects
            } = req.body;

            // 0. Validation for Qualification and Designation (Alphabets and spaces only)
            const alphaRegex = /^[A-Za-z\s]+$/;
            if (qualification && !alphaRegex.test(qualification)) {
                return ResponseHandler.badRequest(res, 'Qualification can only contain alphabet characters and spaces.');
            }
            if (designation && !alphaRegex.test(designation)) {
                return ResponseHandler.badRequest(res, 'Designation can only contain alphabet characters and spaces.');
            }

            // Optional coordinate validation
            if (latitude && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
                return ResponseHandler.badRequest(res, 'Invalid latitude value.');
            }
            if (longitude && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
                return ResponseHandler.badRequest(res, 'Invalid longitude value.');
            }

            // Phone Validation (Strict 10 digits, numeric only)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone)) {
                return ResponseHandler.badRequest(res, 'Phone number must be exactly 10 digits and contain only numbers.');
            }

            // 1. Capture tracking info
            const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const browser = req.headers['user-agent'] || 'Unknown';
            // Simple OS detection from user-agent could be added here or passed from frontend
            const os = req.body.os || 'Unknown';

            // 2. Prevent duplicate requests from same Email or Phone within a short timeframe
            const RECENT_SUBMISSION_WINDOW = 5 * 60 * 1000; // 5 minutes
            const recentSubmission = await Agent.findOne({
                $or: [{ email }, { phone }],
                createdAt: { $gt: new Date(Date.now() - RECENT_SUBMISSION_WINDOW) }
            });

            if (recentSubmission) {
                return res.status(429).json({
                    success: false,
                    errorCode: 'DUPLICATE_SUBMISSION',
                    message: 'You have already submitted this application. Please wait a few minutes before trying again.'
                });
            }

            // 3. Unique Email and Phone Validation
            const existingAgentByEmail = await Agent.findOne({ email });
            if (existingAgentByEmail) {
                if (existingAgentByEmail.approvalStatus === 'pending') {
                    return ResponseHandler.error(res, 'You already have a pending application with this email.', null, 400);
                }
                return ResponseHandler.error(res, 'An account with this email already exists.', null, 400);
            }

            const existingAgentByPhone = await Agent.findOne({ phone });
            if (existingAgentByPhone) {
                if (existingAgentByPhone.approvalStatus === 'pending') {
                    return ResponseHandler.error(res, 'You already have a pending application with this phone number.', null, 400);
                }
                return ResponseHandler.error(res, 'An account with this phone number already exists.', null, 400);
            }

            // 4. Document Constraints: Check for duplicate documentType
            if (documents && Array.isArray(documents)) {
                const docTypes = documents.map(doc => doc.documentType);
                if (new Set(docTypes).size !== docTypes.length) {
                    return ResponseHandler.error(res, 'Duplicate document types are not allowed.', null, 400);
                }
            }

            // Generate a random temporary password
            const tempPassword = crypto.randomBytes(8).toString('hex');

            // Create Agent Record
            const agent = await Agent.create({
                // Auth (Generated)
                email,
                password: tempPassword,

                // Personal Info
                firstName,
                lastName,
                phone,
                alternatePhone,
                designation,
                experience,
                qualification,

                // Company Info
                companyName,
                companyType,
                registrationNumber,
                establishedYear: parseInt(establishedYear) || new Date().getFullYear(),
                website,
                address,
                city,
                state,
                pincode,
                country,

                // Specialization & Services
                specialization: specialization || [],
                servicesOffered: servicesOffered || [],

                // Business Metrics
                currentStudents,
                annualRevenue,
                teamSize,

                // Partnership Details
                partnershipType,
                expectedStudents,
                marketingBudget,
                whyPartner,
                references,
                additionalInfo,

                // Consent
                termsAccepted,
                dataConsent,
                termsAcceptedAt: termsAccepted ? new Date() : null,
                dataConsentAt: dataConsent ? new Date() : null,

                // Status
                status: 'inactive',
                approvalStatus: 'pending',

                // Application Tracking
                trackingToken: crypto.randomBytes(32).toString('hex'),
                trackingTokenExpires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default

                // Tracking
                ipAddress,
                browser,
                os,

                // Coordinates
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,

                // Documents
                documents: documents || []
            });

            // 6. Send "Under Review" Email
            try {
                const trackingLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/application-status?token=${agent.trackingToken}`;
                await emailService.sendApplicationUnderReviewEmail(agent, trackingLink);
            } catch (emailError) {
                console.error('Failed to send under-review email:', emailError);
            }

            return ResponseHandler.success(res, 'Application submitted successfully. Our team will review your application and contact you shortly.', {
                trackingToken: agent.trackingToken
            });

        } catch (error) {
            console.error('Partner Application Error:', error);
            return ResponseHandler.serverError(res, 'Failed to submit application. Please try again later.', error);
        }
    }

    /**
     * Send Verification OTP
     * POST /api/inquiry/send-otp
     */
    static async sendVerificationOTP(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return ResponseHandler.badRequest(res, 'Email is required');
            }

            // Check if email is already registered/pending
            const existingAgent = await Agent.findOne({ email });
            if (existingAgent) {
                return ResponseHandler.badRequest(res, 'This email is already registered or has a pending application.');
            }

            const otp = otpGenerator.generateOTP();
            const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

            otpStore.set(email, { otp, expires });

            await emailService.sendVerificationOTP(email, otp);

            return ResponseHandler.success(res, 'Verification code sent to your email.');
        } catch (error) {
            console.error('Send OTP Error:', error);
            return ResponseHandler.serverError(res, 'Failed to send verification code.', error);
        }
    }

    /**
     * Verify OTP
     * POST /api/inquiry/verify-otp
     */
    static async verifyOTP(req, res) {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return ResponseHandler.badRequest(res, 'Email and OTP are required');
            }

            const stored = otpStore.get(email);
            if (!stored) {
                return ResponseHandler.badRequest(res, 'No verification code found for this email.');
            }

            if (Date.now() > stored.expires) {
                otpStore.delete(email);
                return ResponseHandler.badRequest(res, 'Verification code has expired.');
            }

            if (stored.otp !== otp) {
                return ResponseHandler.badRequest(res, 'Invalid verification code.');
            }

            // CHECKPOINT: After OTP verification, check if email already exists
            const existingAgent = await Agent.findOne({ email });
            if (existingAgent) {
                return ResponseHandler.badRequest(res, 'This email is already registered.');
            }

            // Success - mark as verified in store so it can be checked during final submission if needed
            stored.verified = true;

            return ResponseHandler.success(res, 'Email verified successfully.');
        } catch (error) {
            console.error('Verify OTP Error:', error);
            return ResponseHandler.serverError(res, 'Failed to verify code.', error);
        }
    }

    /**
     * Upload Agent Documents
     * POST /api/inquiry/upload-agent-documents
     * Requires temporary agent data in body
     */
    static async uploadAgentDocuments(req, res) {
        const fs = require('fs');
        const path = require('path');

        try {
            // Get agent details from request body
            const { firstName, lastName, tempAgentId } = req.body;

            // Allow upload even if we only have ID (for updates), but ideally we need names for folder creation
            // if folder doesn't exist.
            if (!tempAgentId && (!firstName || !lastName)) {
                return ResponseHandler.badRequest(res, 'Agent ID or Name details are required');
            }

            const agentsBaseDir = path.join(__dirname, '../../uploads/agents');
            let agentFolder;
            let folderName;

            // 1. Try to find existing agent to get their folder
            let existingAgent = null;
            if (tempAgentId && tempAgentId.match(/^[0-9a-fA-F]{24}$/)) {
                try {
                    existingAgent = await Agent.findOne({ _id: tempAgentId });
                } catch (e) { /* ignore invalid id */ }
            }

            // 2. Determine Folder Path from existing agent
            if (existingAgent && existingAgent.documents && existingAgent.documents.size > 0) {
                // Try to extract folder from existing documents
                // Values are like "uploads/agents/FOLDER_NAME/docs/file.ext"
                const firstDocPath = Array.from(existingAgent.documents.values())[0];
                if (firstDocPath) {
                    const parts = firstDocPath.split('/');
                    const agentIndex = parts.indexOf('agents');
                    if (agentIndex !== -1 && parts[agentIndex + 1]) {
                        folderName = parts[agentIndex + 1];
                        agentFolder = path.join(agentsBaseDir, folderName);
                    }
                }
            }

            // If no existing folder found (or new agent), create new stable one
            if (!agentFolder || !fs.existsSync(agentFolder)) {
                // Sanitize names for folder
                // Use provided names or fallback to existing agent names if available
                const fName = firstName || (existingAgent ? existingAgent.firstName : 'Unknown');
                const lName = lastName || (existingAgent ? existingAgent.lastName : 'Agent');

                const safeFirst = fName.replace(/[^a-z0-9]/gi, '');
                const safeLast = lName.replace(/[^a-z0-9]/gi, '');

                // Format: {time}_{agentid}_{agentname}
                // Using Date.now() for time prefix, then ID, then Name.
                // Assuming "time" means timestamp of creation to keep folder unique.
                const timestamp = Date.now();
                folderName = `${timestamp}_${tempAgentId || 'new'}_${safeFirst}${safeLast}`;
                agentFolder = path.join(agentsBaseDir, folderName);
            }

            // Create directories: Root, docs, and old/docs
            const docsFolder = path.join(agentFolder, 'docs');
            const oldDocsFolder = path.join(agentFolder, 'old', 'docs');

            if (!fs.existsSync(agentFolder)) fs.mkdirSync(agentFolder, { recursive: true });
            if (!fs.existsSync(docsFolder)) fs.mkdirSync(docsFolder, { recursive: true });
            if (!fs.existsSync(oldDocsFolder)) fs.mkdirSync(oldDocsFolder, { recursive: true });

            const files = req.files;
            if (!files || Object.keys(files).length === 0) {
                // Return success with empty data if no files uploaded (optional upload)
                return ResponseHandler.success(res, 'No new documents to upload', { documentPaths: {}, folderName });
            }

            const documentPaths = {};

            for (const [fieldName, fileArray] of Object.entries(files)) {
                const file = fileArray[0];
                const ext = path.extname(file.originalname);

                // Determine new filename
                let newFileName;
                switch (fieldName) {
                    case 'idProof': newFileName = `id_proof${ext}`; break;
                    case 'companyLicence': newFileName = `company_licence${ext}`; break;
                    case 'agentPhoto': newFileName = `agent_photo${ext}`; break;
                    case 'companyPhoto': newFileName = `company_photo${ext}`; break;
                    case 'identityDocument': newFileName = `identity_document${ext}`; break;
                    case 'companyRegistration': newFileName = `company_registration${ext}`; break;
                    case 'resume': newFileName = `resume${ext}`; break;
                    default: newFileName = `${fieldName}${ext}`;
                }

                const targetPath = path.join(docsFolder, newFileName);

                // 3. Handle Archiving: If file exists in 'docs', move to 'old/docs'
                if (fs.existsSync(targetPath)) {
                    // Append timestamp to archived file name
                    const archiveFileName = `${path.basename(newFileName, ext)}_${Date.now()}${ext}`;
                    const archivePath = path.join(oldDocsFolder, archiveFileName);

                    try {
                        fs.renameSync(targetPath, archivePath);
                    } catch (err) {
                        console.error(`Failed to archive file ${newFileName}:`, err);
                    }
                }

                // Move new file to 'docs' folder
                try {
                    fs.renameSync(file.path, targetPath);
                } catch (err) {
                    console.error("Error moving file:", err);
                    // Fallback copy/delete
                    fs.copyFileSync(file.path, targetPath);
                    fs.unlinkSync(file.path);
                }

                // Store relative path (pointing to /docs/)
                documentPaths[fieldName] = `uploads/agents/${folderName}/docs/${newFileName}`;
            }

            return ResponseHandler.success(res, 'Documents uploaded successfully', {
                documentPaths,
                folderName
            });

        } catch (error) {
            console.error('Upload Documents Error:', error);
            // Cleanup temp files if any
            if (req.files) {
                Object.values(req.files).flat().forEach(f => {
                    try { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); } catch (e) { }
                });
            }
            return ResponseHandler.serverError(res, 'Failed to upload documents.', error);
        }
    }

    /**
     * Get Application Status by Token
     * GET /api/inquiry/application-status/:token
     */
    static async getApplicationStatus(req, res) {
        try {
            const { token } = req.params;
            if (!token) {
                return ResponseHandler.badRequest(res, 'Tracking token is required');
            }

            const agent = await Agent.findOne({ trackingToken: token });

            if (!agent) {
                return ResponseHandler.notFound(res, 'Invalid tracking token or application not found.');
            }

            // Expiry check (optional but recommended)
            if (agent.trackingTokenExpires && agent.trackingTokenExpires < new Date()) {
                return ResponseHandler.error(res, 'Tracking token has expired.', null, 401);
            }

            // Return safe data for public view
            const statusData = {
                firstName: agent.firstName,
                lastName: agent.lastName,
                companyName: agent.companyName,
                email: agent.email,
                approvalStatus: agent.approvalStatus,
                status: agent.status,
                submittedAt: agent.createdAt,
                phase: agent.approvalStatus === 'pending' ? 'Verification' : 'Completed',
                details: {
                    city: agent.city,
                    country: agent.country,
                    partnershipType: agent.partnershipType
                }
            };

            return ResponseHandler.success(res, 'Application status retrieved successfully', statusData);
        } catch (error) {
            console.error('Get Application Status Error:', error);
            return ResponseHandler.serverError(res, 'Failed to fetch status.', error);
        }
    }
}

module.exports = InquiryController;
