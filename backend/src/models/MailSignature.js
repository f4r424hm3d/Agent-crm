const mongoose = require('mongoose');

const mailSignatureSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Signature name is required'],
            trim: true,
        },
        signatureContent: {
            type: String,
            required: [true, 'Signature content is required'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const MailSignature = mongoose.model('MailSignature', mailSignatureSchema);

module.exports = MailSignature;
