const { MailSignature } = require('../models');

// @desc    Get all signatures
// @route   GET /api/mail-signatures
// @access  Private (Admin/SuperAdmin)
exports.getSignatures = async (req, res) => {
    try {
        const signatures = await MailSignature.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: signatures
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Create a signature
// @route   POST /api/mail-signatures
// @access  Private (Admin/SuperAdmin)
exports.createSignature = async (req, res) => {
    try {
        const { name, signatureContent, isActive } = req.body;

        if (!name || !signatureContent) {
            return res.status(400).json({ success: false, message: 'Name and signature content are required' });
        }

        const newSignature = new MailSignature({ name, signatureContent, isActive });
        const savedSignature = await newSignature.save();

        res.status(201).json({
            success: true,
            data: savedSignature
        });
    } catch (error) {
        console.error('Mail Signature Create Error:', error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message, stack: error.stack });
    }
};

// @desc    Update a signature
// @route   PUT /api/mail-signatures/:id
// @access  Private (Admin/SuperAdmin)
exports.updateSignature = async (req, res) => {
    try {
        const { name, signatureContent, isActive } = req.body;

        let signature = await MailSignature.findById(req.params.id);

        if (!signature) {
            return res.status(404).json({ success: false, message: 'Signature not found' });
        }

        signature.name = name || signature.name;
        signature.signatureContent = signatureContent || signature.signatureContent;
        if (isActive !== undefined) {
            signature.isActive = isActive;
        }

        const updatedSignature = await signature.save();

        res.status(200).json({
            success: true,
            data: updatedSignature
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a signature
// @route   DELETE /api/mail-signatures/:id
// @access  Private (Admin/SuperAdmin)
exports.deleteSignature = async (req, res) => {
    try {
        const signature = await MailSignature.findById(req.params.id);

        if (!signature) {
            return res.status(404).json({ success: false, message: 'Signature not found' });
        }

        await signature.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Signature deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Mark signature as active (and deactivate others)
// @route   PATCH /api/mail-signatures/:id/active
// @access  Private (Admin/SuperAdmin)
exports.toggleActive = async (req, res) => {
    try {
        const signature = await MailSignature.findById(req.params.id);

        if (!signature) {
            return res.status(404).json({ success: false, message: 'Signature not found' });
        }

        signature.isActive = true;
        const updatedSignature = await signature.save(); // pre-save hook handles the rest

        res.status(200).json({
            success: true,
            data: updatedSignature,
            message: 'Signature marked as active'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
