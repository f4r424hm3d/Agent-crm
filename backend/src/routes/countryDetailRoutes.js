const express = require('express');
const router = express.Router();
const CountryDetailController = require('../controllers/countryDetailController');
router.get('/', CountryDetailController.getAllCountries);

module.exports = router;
