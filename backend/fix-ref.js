require('dotenv').config();
const connectDB = require('./src/config/database');
const Student = require('./src/models/Student');
const Agent = require('./src/models/Agent');

async function fixAgentReference() {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Get the student
        const student = await Student.findOne({ email: 'saini001ritik@gmail.com' });
        if (!student) {
            console.log('❌ Student not found!');
            process.exit(0);
        }

        console.log(`Student: ${student.firstName} ${student.lastName}`);
        console.log(`Current referredBy ID: ${student.referredBy}\n`);

        // List all agents
        const agents = await Agent.find({}).select('_id firstName lastName email').lean();
        console.log(`Found ${agents.length} agents in database:\n`);

        if (agents.length === 0) {
            console.log('No agents found. Please create an agent first.');
            process.exit(0);
        }

        agents.forEach((agent, index) => {
            console.log(`${index + 1}. ${agent.firstName} ${agent.lastName} - ${agent.email}`);
            console.log(`   ID: ${agent._id}\n`);
        });

        // Update to first agent
        console.log(`Updating student's referredBy to: ${agents[0].firstName} ${agents[0].lastName}...`);
        student.referredBy = agents[0]._id.toString();
        await student.save();
        console.log('✅ Updated successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixAgentReference();
