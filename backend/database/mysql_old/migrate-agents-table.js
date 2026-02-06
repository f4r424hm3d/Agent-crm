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

        // Create new agents table with updated schema
        await sequelize.query(`
      CREATE TABLE agents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        company_name VARCHAR(200) NOT NULL,
        company_address TEXT,
        contact_person VARCHAR(100),
        country VARCHAR(100),
        city VARCHAR(100),
        years_of_experience INT,
        description TEXT,
        bank_name VARCHAR(200),
        account_number VARCHAR(50),
        account_holder_name VARCHAR(100),
        ifsc_code VARCHAR(20),
        swift_code VARCHAR(20),
        status ENUM('active', 'inactive') DEFAULT 'active',
        approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        approval_notes TEXT,
        approved_by INT,
        approved_at DATETIME,
        rejected_at DATETIME,
        last_login DATETIME,
        documents JSON,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
        console.log('✅ Created new agents table with updated schema');

        // Re-enable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
        console.log('✅ Re-enabled foreign key checks');

        console.log('\n✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

recreateAgentsTable();
