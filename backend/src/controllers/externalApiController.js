const ExternalApiService = require('../services/externalApiService');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class ExternalApiController {
    /**
     * Proxy for Countries with access control
     */
    static async getCountries(req, res) {
        try {
            const responseData = await ExternalApiService.fetchCountries();
            const data = responseData.data || [];

            // If user is AGENT, filter countries
            if (req.userRole === 'AGENT') {
                const allowedCountries = req.user.accessibleCountries || [];
                const filteredCountries = data.filter(c =>
                    allowedCountries.includes(c.name) ||
                    allowedCountries.includes(c.website) || // Use website instead of code
                    allowedCountries.some(ac => c.name.toLowerCase() === ac.toLowerCase())
                );
                return ResponseHandler.success(res, 'Restricted countries retrieved', filteredCountries);
            }

            return ResponseHandler.success(res, 'All countries retrieved', data);
        } catch (error) {
            logger.error('Proxy Countries Error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to fetch countries', error);
        }
    }

    /**
     * Proxy for Universities with access control
     */
    static async getUniversities(req, res) {
        try {
            // Support both 'website' and 'country' query params from frontend
            const website = req.query.website || req.query.country;
            const responseData = await ExternalApiService.fetchUniversities(website);
            let universities = responseData.data || [];

            if (req.userRole === 'AGENT') {
                const allowedCountries = req.user.accessibleCountries || [];
                const allowedUnivs = req.user.accessibleUniversities || [];

                // 1. Filter by countries first (if universities list has country field)
                // Note: The API might already filter by website/country if passed
                if (allowedCountries.length > 0 && !website) {
                    // This is complex because we don't have country field in universities list always
                    // But if website was passed, API already filtered.
                }

                // 2. If specific universities are set, restrict to those
                if (allowedUnivs.length > 0) {
                    universities = universities.filter(u =>
                        allowedUnivs.includes(u.id?.toString()) ||
                        allowedUnivs.includes(u.university_id?.toString()) ||
                        allowedUnivs.includes(u.name)
                    );
                }
            }

            return ResponseHandler.success(res, 'Universities retrieved', universities);
        } catch (error) {
            logger.error('Proxy Universities Error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to fetch universities', error);
        }
    }

    /**
     * Proxy for Levels
     */
    static async getLevels(req, res) {
        try {
            const { university_id } = req.query;
            if (!university_id) return ResponseHandler.badRequest(res, 'university_id is required');

            const responseData = await ExternalApiService.fetchLevels(university_id);
            return ResponseHandler.success(res, 'Levels retrieved', responseData.data || []);
        } catch (error) {
            return ResponseHandler.serverError(res, 'Failed to fetch levels', error);
        }
    }

    /**
     * Proxy for Categories
     */
    static async getCategories(req, res) {
        try {
            const { university_id, level } = req.query;
            const responseData = await ExternalApiService.fetchCategories(university_id, level);
            return ResponseHandler.success(res, 'Categories retrieved', responseData.data || []);
        } catch (error) {
            return ResponseHandler.serverError(res, 'Failed to fetch categories', error);
        }
    }

    /**
     * Proxy for Specializations
     */
    static async getSpecializations(req, res) {
        try {
            const { university_id, level, course_category_id } = req.query;
            const responseData = await ExternalApiService.fetchSpecializations(university_id, level, course_category_id);
            return ResponseHandler.success(res, 'Specializations retrieved', responseData.data || []);
        } catch (error) {
            return ResponseHandler.serverError(res, 'Failed to fetch specializations', error);
        }
    }

    /**
     * Proxy for Programs
     */
    static async getPrograms(req, res) {
        try {
            const responseData = await ExternalApiService.fetchPrograms(req.query);
            return ResponseHandler.success(res, 'Programs retrieved', responseData.data || []);
        } catch (error) {
            return ResponseHandler.serverError(res, 'Failed to fetch programs', error);
        }
    }
}

module.exports = ExternalApiController;
