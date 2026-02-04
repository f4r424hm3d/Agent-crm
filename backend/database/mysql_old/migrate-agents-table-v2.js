const { sequelize } = require('../src/config/database');

async function recreateAgentsTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        console.log('✅ Disabled foreign key checks');

        // Drop the existing agents table
        await sequelize.query('DROP TABLE IF EXISTS agents;');
        console.log('✅ Dropped old agents table');

        // Create new agents table with comprehensive partner application schema
        await sequelize.query(`
      CREATE TABLE agents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        
        -- Authentication
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        
        -- Personal Information
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        alternate_phone VARCHAR(20),
        designation VARCHAR(100) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        qualification VARCHAR(100) NOT NULL,
        
        -- Company Information
        company_name VARCHAR(200) NOT NULL,
        company_type VARCHAR(100) NOT NULL,
        registration_number VARCHAR(100),
        established_year INT NOT NULL,
        website VARCHAR(255),
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        country VARCHAR(100) NOT NULL DEFAULT 'India',
        
        -- Specialization & Services (JSON)
        specialization JSON,
        services_offered JSON,
        
        -- Business Metrics
        current_students VARCHAR(50) NOT NULL,
        team_size VARCHAR(50) NOT NULL,
        annual_revenue VARCHAR(50),
        
        -- Partnership Details
        partnership_type VARCHAR(100) NOT NULL,
        expected_students VARCHAR(50) NOT NULL,
        marketing_budget VARCHAR(50),
        why_partner TEXT NOT NULL,
        \`references\` TEXT,
        additional_info TEXT,
        
        -- Consent & Terms
        terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
        data_consent BOOLEAN NOT NULL DEFAULT FALSE,
        terms_accepted_at DATETIME,
        data_consent_at DATETIME,
        
        -- Status
        status ENUM('active', 'inactive') DEFAULT 'active',
        approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approval_notes TEXT,
        approved_by INT,
        approved_at DATETIME,
        rejected_at DATETIME,
        last_login DATETIME,
        
        -- Documents
        documents JSON,
        
        -- Timestamps
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
        console.log('✅ Created new agents table with comprehensive partner schema');

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('✅ Re-enabled foreign key checks');

        console.log('\n✅ Migration completed successfully!');
        console.log('📋 New fields added:');
        console.log('   - Personal: first_name, last_name, alternate_phone, designation, experience, qualification');
        console.log('   - Company: company_type, registration_number, established_year, website, address, state, pincode');
        console.log('   - Services: specialization, services_offered (JSON arrays)');
        console.log('   - Metrics: current_students, team_size, annual_revenue');
        console.log('   - Partnership: partnership_type, expected_students, marketing_budget, why_partner, references, additional_info');
        console.log('   - Consent: terms_accepted, data_consent, terms_accepted_at, data_consent_at');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

recreateAgentsTable();
