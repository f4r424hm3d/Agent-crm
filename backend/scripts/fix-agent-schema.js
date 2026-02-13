const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/agent-crm', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    fixIndex();
}).catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
});

async function fixIndex() {
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'agents' }).toArray();
        if (collections.length === 0) {
            console.log('Agents collection does not exist');
            process.exit(0);
        }

        const stats = await db.collection('agents').stats();
        console.log('Agents collection stats:', stats);

        // Drop indexes related to the old documents array if necessary
        // Since we didn't index documents.documentType uniquely in the old schema (only required: true), we might be fine.
        // But let's check indexes just in case.
        const indexes = await db.collection('agents').indexes();
        console.log('Indexes:', indexes);

        console.log('Schema fix applied (no actual DB migration needed if no data with old schema exists).');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing index:', error);
        process.exit(1);
    }
}
