require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const seedSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Super Admin credentials
        const superAdminData = {
            email: 'superadmin@gmail.com',
            password: '12345678', // Will be automatically hashed by User model pre-save hook
            name: 'Super Administrator',
            role: 'SUPER_ADMIN',
            phone: '9999999999',
            status: 'active'
        };

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ email: superAdminData.email });

        if (existingAdmin) {
            console.log('⚠️  Super Admin already exists, updating...');

            // Update existing super admin
            existingAdmin.name = superAdminData.name;
            existingAdmin.role = superAdminData.role;
            existingAdmin.phone = superAdminData.phone;
            existingAdmin.status = superAdminData.status;
            existingAdmin.password = superAdminData.password; // This will trigger password hashing

            await existingAdmin.save();
            console.log('✅ Super Admin updated successfully!');
        } else {
            // Create new super admin
            const newAdmin = await User.create(superAdminData);
            console.log('✅ Super Admin created successfully!');
        }

        console.log('\n📧 Email:', superAdminData.email);
        console.log('🔑 Password:', superAdminData.password);
        console.log('👤 Role: SUPER_ADMIN\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding super admin:', error.message);
        process.exit(1);
    }
};

// Run the seed function
seedSuperAdmin();
