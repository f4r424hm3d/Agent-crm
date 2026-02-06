const mongoose = require('mongoose');
const Agent = require('./src/models/Agent');
const Student = require('./src/models/Student');

async function fixAgentReference() {
    try {
        await mongoose.connect('mongodb://localhost:27017/agent-crm');
        console.log('Connected to MongoDB');

        // Get the student
        const student = await Student.findOne({ email: 'saini001ritik@gmail.com' });
        console.log('\nStudent found:', {
            name: `${student.firstName} ${student.lastName}`,
            referredBy: student.referredBy
        });

        // Check if the referred agent exists
        const referredAgent = await Agent.findById(student.referredBy);

        if (referredAgent) {
            console.log('\nReferred Agent exists:', {
                name: `${referredAgent.firstName} ${referredAgent.lastName}`,
                email: referredAgent.email
            });
        } else {
            console.log(`\nReferred Agent with ID ${student.referredBy} does NOT exist!`);

            // List all existing agents
            const allAgents = await Agent.find({}).select('_id firstName lastName email');
            console.log('\nAll agents in database:', allAgents.length);

            if (allAgents.length > 0) {
                console.log('\nExisting agents:');
                allAgents.forEach((agent, index) => {
                    console.log(`${index + 1}. ${agent.firstName} ${agent.lastName} - ${agent.email} (ID: ${agent._id})`);
                });

                // Use the first agent as referral
                console.log(`\nUpdating student's  referredBy to first agent...`);
                student.referredBy = allAgents[0]._id;
                await student.save();
                console.log('✅ Updated successfully!');
            } else {
                console.log('\nNo agents found in database. Creating a demo agent...');

                const demoAgent = new Agent({
                    firstName: 'Demo',
                    lastName: 'Agent',
                    email: 'demo.agent@example.com',
                    phone: '1234567890',
                    status: 'active',
                    role: 'agent'
                });

                await demoAgent.save();
                console.log('✅ Demo agent created:', demoAgent._id);

                student.referredBy = demoAgent._id;
                await student.save();
                console.log('✅ Student referral updated to demo agent!');
            }
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixAgentReference();
