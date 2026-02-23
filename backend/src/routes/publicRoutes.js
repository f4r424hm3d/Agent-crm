const express = require('express');
const router = express.Router();
const { CountryDetail } = require('../models');
const ResponseHandler = require('../utils/responseHandler');

/**
 * @route   GET /api/public/countries
 * @desc    Get all countries with dial codes
 * @access  Public
 */
router.get('/countries', async (req, res) => {
    try {
        const countries = await CountryDetail.find({})
            .select('name code phone')
            .sort({ name: 1 });

        return ResponseHandler.success(res, 'Countries retrieved successfully', countries);
    } catch (error) {
        return ResponseHandler.serverError(res, 'Failed to fetch countries', error);
    }
});

module.exports = router;
