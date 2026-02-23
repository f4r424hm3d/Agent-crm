/**
 * Agent Edit Validation
 * Centralized validation logic for agent profile details
 */

import { validateEmail, validateMobile, validateRequired } from '../../validation';

export const validateAgentStep1 = (data) => {
    const errors = {};

    if (!data.firstName?.trim()) errors.firstName = 'First name is required';
    if (!data.lastName?.trim()) errors.lastName = 'Last name is required';

    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    const phoneError = validateMobile(data.phone);
    if (phoneError) errors.phone = phoneError;

    if (!data.qualification?.trim()) errors.qualification = 'Qualification is required';
    if (!data.designation?.trim()) errors.designation = 'Designation is required';
    if (!data.experience) errors.experience = 'Experience level is required';

    return errors;
};

export const validateAgentStep2 = (data) => {
    const errors = {};
    const currentYear = new Date().getFullYear();

    if (!data.companyName?.trim()) errors.companyName = 'Company name is required';
    if (!data.companyType) errors.companyType = 'Company type is required';

    const year = parseInt(data.establishedYear);
    if (!year || year < 1900 || year > currentYear) {
        errors.establishedYear = `Year must be between 1900 and ${currentYear}`;
    }

    if (!data.address?.trim()) errors.address = 'Address is required';
    if (!data.city?.trim()) errors.city = 'City is required';
    if (!data.state) errors.state = 'State is required';

    if (!data.pincode || !/^\d{6}$/.test(data.pincode)) {
        errors.pincode = 'Valid 6-digit PIN code is required';
    }

    return errors;
};

export const validateAgentStep3 = (data) => {
    const errors = {};

    if (!data.specialization || data.specialization.length === 0) {
        errors.specialization = 'Select at least one specialization';
    }

    if (!data.servicesOffered || data.servicesOffered.length === 0) {
        errors.servicesOffered = 'Select at least one service';
    }

    if (!data.currentStudents) errors.currentStudents = 'Student base range is required';
    if (!data.teamSize) errors.teamSize = 'Team size is required';

    return errors;
};

export const validateAgentStep4 = (data) => {
    const errors = {};

    if (!data.partnershipType) errors.partnershipType = 'Partnership type is required';
    if (!data.expectedStudents) errors.expectedStudents = 'Target students range is required';
    if (!data.whyPartner?.trim()) errors.whyPartner = 'Please provide reasoning for partnership';

    return errors;
};

export const validateFullAgent = (data) => {
    return {
        ...validateAgentStep1(data),
        ...validateAgentStep2(data),
        ...validateAgentStep3(data),
        ...validateAgentStep4(data)
    };
};
