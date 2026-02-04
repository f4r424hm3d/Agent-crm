const { sequelize } = require('../src/config/database');
const Setting = require('../src/models/Setting');

async function seedSettings() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Create table if not exists (sync)
        await Setting.sync({ force: false }); // Don't drop if exists, usually migration does this but this is a helper

        const defaultSettings = [
            // General
            { key: 'platform_name', value: 'Britannica Overseas', group: 'general', type: 'string', description: 'Name of the platform' },
            { key: 'support_email', value: 'support@britannica.com', group: 'general', type: 'string', description: 'Support contact email' },
            { key: 'currency', value: 'INR', group: 'general', type: 'string', description: 'Default currency' },

            // Security
            { key: 'enable_2fa', value: 'false', group: 'security', type: 'boolean', description: 'Enable Two-Factor Authentication globally' },
            { key: 'password_policy', value: 'medium', group: 'security', type: 'string', description: 'Password strength requirement' },

            // Email (SMTP)
            { key: 'smtp_host', value: 'smtp.gmail.com', group: 'email', type: 'string', description: 'SMTP Host' },
            { key: 'smtp_port', value: '587', group: 'email', type: 'number', description: 'SMTP Port' },
            { key: 'smtp_user', value: '', group: 'email', type: 'string', description: 'SMTP User' },
            { key: 'smtp_pass', value: '', group: 'email', type: 'string', description: 'SMTP Password' },

            // Agent
            { key: 'auto_approve_agents', value: 'false', group: 'agent', type: 'boolean', description: 'Automatically approve new agent registrations' },
            { key: 'default_commission_rate', value: '10', group: 'agent', type: 'number', description: 'Default commission percentage' },
        ];

        for (const item of defaultSettings) {
            const [setting, created] = await Setting.findOrCreate({
                where: { key: item.key },
                defaults: item
            });

            if (created) {
                console.log(`✅ Created setting: ${item.key}`);
            } else {
                console.log(`ℹ️ Setting exists: ${item.key}`);
            }
        }

        console.log('✅ Settings seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding settings failed:', error);
        process.exit(1);
    }
}

seedSettings();
