require('dotenv').config();
const connectDB = require('./src/config/database');
const Student = require('./src/models/Student');
const Agent = require('./src/models/Agent');

async function fixAllStudentReferrals() {
    try {
        await connectDB();
        console.log('✅ Connected to MongoDB\n');

        // Get all agents
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

        const validAgentId = agents[0]._id.toString();

        // Find all students with invalid referredBy
        const allStudents = await Student.find({}).select('_id firstName lastName email referredBy');
        console.log(`\nFound ${allStudents.length} students total\n`);

        let updatedCount = 0;
        for (const student of allStudents) {
            if (student.referredBy) {
                // Check if the referredBy agent exists
                const agentExists = await Agent.findById(student.referredBy);

                if (!agentExists) {
                    console.log(`❌ Student ${student.firstName} ${student.lastName} has invalid referredBy: ${student.referredBy}`);
                    console.log(`   Updating to: ${validAgentId}`);

                    student.referredBy = validAgentId;
                    await student.save();
                    updatedCount++;
                    console.log(`   ✅ Updated\n`);
                } else {
                    console.log(`✅ Student ${student.firstName} ${student.lastName} has valid referredBy: ${agentExists.firstName} ${agentExists.lastName}\n`);
                }
            } else {
                console.log(`ℹ️  Student ${student.firstName} ${student.lastName} has no referredBy\n`);
            }
        }

        console.log(`\n✅ Fixed ${updatedCount} student(s) with invalid referrals`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixAllStudentReferrals();
