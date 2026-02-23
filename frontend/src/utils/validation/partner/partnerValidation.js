/**
 * Centralized validation logic for Partner Application Form
 */

/**
 * Validates a specific step of the partner application
 * @param {number} step - Current step number
 * @param {Object} formData - Form data object
 * @param {boolean} isEmailVerified - Whether email is verified
 * @returns {Object} - { isValid: boolean, newErrors: Object }
 */
export const validatePartnerStep = (step, formData, isEmailVerified) => {
    const newErrors = {};

    if (step === 1) {
        if (!formData.firstName) newErrors.firstName = "First Name is required";
        if (!formData.lastName) newErrors.lastName = "Last Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone Number is required";
        if (!formData.qualification) newErrors.qualification = "Qualification is required";
        if (!formData.designation) newErrors.designation = "Designation is required";
        if (!formData.experience) newErrors.experience = "Experience is required";
        if (!isEmailVerified) newErrors.emailVerified = "Please verify your email";
    }

    if (step === 2) {
        if (!formData.companyName) newErrors.companyName = "Company Name is required";
        if (!formData.companyType) newErrors.companyType = "Company Type is required";

        const currentYear = new Date().getFullYear();
        const year = parseInt(formData.establishedYear);
        if (!formData.establishedYear) {
            newErrors.establishedYear = "Year Established is required";
        } else if (!year || year > currentYear || year < 1900) {
            newErrors.establishedYear = "Enter a valid year";
        }

        if (!formData.address) newErrors.address = "Address is required";
        if (!formData.city) newErrors.city = "City is required";
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.pincode) newErrors.pincode = "PIN Code is required";
    }

    if (step === 3) {
        if (!formData.specialization || formData.specialization.length === 0) {
            newErrors.specialization = "Select at least one specialization";
        }
        if (!formData.servicesOffered || formData.servicesOffered.length === 0) {
            newErrors.servicesOffered = "Select at least one service";
        }
        if (!formData.currentStudents) newErrors.currentStudents = "Student Base is required";
        if (!formData.teamSize) newErrors.teamSize = "Team Size is required";
    }

    if (step === 4) {
        if (!formData.partnershipType) newErrors.partnershipType = "Partnership Type is required";
        if (!formData.expectedStudents) newErrors.expectedStudents = "Students Target is required";
        if (!formData.whyPartner) newErrors.whyPartner = "This field is required";
    }

    if (step === 5) {
        if (!formData.documents.idProof) newErrors.idProof = "ID Proof is required";
        if (!formData.documents.companyLicence) newErrors.companyLicence = "Company Licence is required";
        if (!formData.documents.agentPhoto) newErrors.agentPhoto = "Agent Photo is required";
        if (!formData.documents.companyPhoto) newErrors.companyPhoto = "Company Photo is required";
    }

    if (step === 6) {
        if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the terms";
        if (!formData.dataConsent) newErrors.dataConsent = "You must provide data consent";
    }

    return {
        isValid: Object.keys(newErrors).length === 0,
        newErrors
    };
};

/**
 * Validates file type and size
 * @param {string} fieldName - Name of the field
 * @param {File} file - File object
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export const validatePartnerFile = (fieldName, file) => {
    if (!file) return { isValid: true, error: null };

    const isPhoto = ['agentPhoto', 'companyPhoto'].includes(fieldName);
    const allowedTypes = isPhoto
        ? ['image/jpeg', 'image/jpg', 'image/png']
        : ['application/pdf'];

    if (!allowedTypes.includes(file.type)) {
        const allowed = isPhoto ? 'JPG, JPEG, PNG' : 'PDF';
        return {
            isValid: false,
            error: `Invalid file type for ${fieldName.replace(/([A-Z])/g, ' $1').trim()}. Only ${allowed} files allowed.`
        };
    }

    const maxSize = isPhoto ? 2 * 1024 * 1024 : 5 * 1024 * 1024; // 2MB or 5MB
    if (file.size > maxSize) {
        const sizeLabel = isPhoto ? '2MB' : '5MB';
        return {
            isValid: false,
            error: `File size exceeds ${sizeLabel} limit for ${fieldName.replace(/([A-Z])/g, ' $1').trim()}`
        };
    }

    return { isValid: true, error: null };
};

/**
 * Validates a specific step of the Register Agent form
 * @param {number} step - Current step number
 * @param {Object} formData - Form data object
 * @returns {Object} - { isValid: boolean, error: string | null }
 */
export const validateRegisterStep = (step, formData) => {
    if (step === 1) {
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            return { isValid: false, error: "Please fill all required fields" };
        }
        if (formData.password !== formData.confirmPassword) {
            return { isValid: false, error: "Passwords do not match" };
        }
        if (formData.password.length < 6) {
            return { isValid: false, error: "Password must be at least 6 characters" };
        }
    }

    if (step === 2) {
        if (!formData.company_name || !formData.registration_number || !formData.website || !formData.company_address || !formData.city || !formData.country) {
            return { isValid: false, error: "Please fill all required fields" };
        }
    }

    if (step === 3) {
        if (!formData.years_of_experience || !formData.description) {
            return { isValid: false, error: "Please fill all required fields" };
        }
    }

    if (step === 4) {
        if (!formData.bank_name || !formData.account_number || !formData.account_holder_name || !formData.ifsc_code) {
            return { isValid: false, error: "Please fill all required fields" };
        }
    }

    if (step === 5) {
        const missingDocs = Object.values(formData.documents).some(doc => doc === null);
        if (missingDocs) {
            return { isValid: false, error: "All documents are strictly required" };
        }
    }

    return { isValid: true, error: null };
};
