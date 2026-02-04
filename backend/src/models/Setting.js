const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String
    },
    group: {
        type: String,
        default: 'general'
    },
    type: {
        type: String,
        enum: ['string', 'boolean', 'number', 'json'],
        default: 'string'
    },
    description: String
}, {
    timestamps: true
});

// Indexes (key is already indexed via unique: true)
settingSchema.index({ group: 1 });

module.exports = mongoose.model('Setting', settingSchema);
