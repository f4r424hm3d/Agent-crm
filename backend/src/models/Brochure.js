const mongoose = require('mongoose');

const brochureSchema = new mongoose.Schema({
    university_program_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UniversityProgram',
        required: true
    },
    brochure_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BrochureCategory',
        required: true
    },
    title: {
        type: String,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    url: {
        type: String,
        trim: true
    },
    date: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Brochure', brochureSchema);
