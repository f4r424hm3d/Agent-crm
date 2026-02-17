const mongoose = require('mongoose');

const universityProgramSchema = new mongoose.Schema({
    brochure_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BrochureType',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

// Index for filtering
universityProgramSchema.index({ brochure_type_id: 1, country: 1 });

module.exports = mongoose.model('UniversityProgram', universityProgramSchema);
