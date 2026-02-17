const mongoose = require('mongoose');
require('dotenv').config();
const { BrochureType, UniversityProgram, BrochureCategory } = require('../models');
const connectDB = require('../config/database');

const seedBrochureModule = async () => {
    try {
        await connectDB();
        console.log('🚀 Connected to MongoDB for brochure seeding');

        // 1. Clear existing data
        await BrochureType.deleteMany({});
        await UniversityProgram.deleteMany({});
        await BrochureCategory.deleteMany({});
        console.log('Sweep: Cleared existing brochure module data');

        // 2. Create Brochure Types
        const types = await BrochureType.insertMany([
            { name: 'Study Abroad' },
            { name: 'Internship' },
            { name: 'Language Program' }
        ]);
        console.log(`✅ Created ${types.length} Brochure Types`);

        // 3. Create University Programs for 'Study Abroad'
        const studyAbroadType = types.find(t => t.name === 'Study Abroad');
        const ups = await UniversityProgram.insertMany([
            { brochure_type_id: studyAbroadType._id, name: 'Asia Pacific University', country: 'MALAYSIA' },
            { brochure_type_id: studyAbroadType._id, name: 'Taylor\'s University', country: 'MALAYSIA' },
            { brochure_type_id: studyAbroadType._id, name: 'University of Westminster', country: 'UK' },
            { brochure_type_id: studyAbroadType._id, name: 'Monash University', country: 'AUSTRALIA' }
        ]);
        console.log(`✅ Created ${ups.length} University Programs`);

        // 4. Create Categories
        const categories = await BrochureCategory.insertMany([
            { brochure_type_id: studyAbroadType._id, name: 'Engineering' },
            { brochure_type_id: studyAbroadType._id, name: 'Business' },
            { brochure_type_id: studyAbroadType._id, name: 'IT & Computing' }
        ]);
        console.log(`✅ Created ${categories.length} Brochure Categories`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding brochure module:', error);
        process.exit(1);
    }
};

seedBrochureModule();
