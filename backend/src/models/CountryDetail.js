const mongoose = require('mongoose');

const countryDetailSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    phone: [{
        type: Number,
        required: true
    }]
}, {
    timestamps: true
});

// Index for faster searches
countryDetailSchema.index({ name: 'text', code: 1 });

module.exports = mongoose.model('CountryDetail', countryDetailSchema);
