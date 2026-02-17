const mongoose = require('mongoose');

const brochureCategorySchema = new mongoose.Schema({
    brochure_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BrochureType',
        required: false
    },
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Unique index for name
brochureCategorySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('BrochureCategory', brochureCategorySchema);
