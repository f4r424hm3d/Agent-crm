const { Agent } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

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
                dataConsent
            } = req.body;

            // Check if email already exists
            const existingAgent = await Agent.findOne({ email });
            if (existingAgent) {
                return ResponseHandler.error(res, 'An account with this email already exists.', null, 400);
            }

            // Generate a random temporary password
            // In a real app, we would send this via email or send a set-password link
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

                // Status
                status: 'active', // Account is active but pending approval
                approvalStatus: 'pending',
            });

            return ResponseHandler.success(res, 'Application submitted successfully. Our team will review your application and contact you shortly.');

        } catch (error) {
            console.error('Partner Application Error:', error);
            return ResponseHandler.serverError(res, 'Failed to submit application. Please try again later.', error);
        }
    }
}

module.exports = InquiryController;
