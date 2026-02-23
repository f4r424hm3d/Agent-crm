const Counter = require('../models/Counter');

/**
 * Generates a unique Agent Code in the format AGXXXX
 * Starts from AG1001
 * Uses the Counter model for thread-safe incrementing
 */
const generateAgentCode = async () => {
    try {
        const sequenceDoc = await Counter.findOneAndUpdate(
            { id: 'agentCode' },
            { $inc: { seq: 1 } },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        // If it's a new counter, it might start from 0 if default is 0.
        // The requirement is to start from 1001.
        if (sequenceDoc.seq < 1001) {
            sequenceDoc.seq = 1001;
            await sequenceDoc.save();
        }

        return `AG${sequenceDoc.seq}`;
    } catch (error) {
        console.error('Error generating agent code:', error);
        throw new Error('Failed to generate agent code');
    }
};

module.exports = { generateAgentCode };
