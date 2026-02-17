const { CountryDetail } = require('../models');
const ResponseHandler = require('../utils/responseHandler');
const logger = require('../utils/logger');

class CountryDetailController {
    /**
     * Get all countries
     * GET /api/countries
     */
    static async getAllCountries(req, res) {
        try {
            const countries = await CountryDetail.find().sort({ name: 1 });

            return ResponseHandler.success(res, 'Countries retrieved successfully', countries);
        } catch (error) {
            logger.error('Get countries error', { error: error.message });
            return ResponseHandler.serverError(res, 'Failed to get countries', error);
        }
    }
}

module.exports = CountryDetailController;
