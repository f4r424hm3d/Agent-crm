const { sequelize } = require('../src/config/database');

async function recreateStudentsTable() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Disable foreign key checks
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
        console.log('✅ Disabled foreign key checks');

        // Drop the existing students table
        await sequelize.query('DROP TABLE IF EXISTS students;');
        console.log('✅ Dropped old students table');

        // Create new students table with updated schema
        await sequelize.query(`
      CREATE TABLE students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15),
        agent_id INT,
        date_of_birth DATE,
        nationality VARCHAR(100),
        passport_number VARCHAR(50),
        gender ENUM('male', 'female', 'other'),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(100),
        country VARCHAR(100),
        postal_code VARCHAR(20),
        emergency_contact_name VARCHAR(100),
        emergency_contact_phone VARCHAR(15),
        emergency_contact_relationship VARCHAR(50),
        education_level VARCHAR(100),
        previous_institution VARCHAR(200),
        field_of_study VARCHAR(100),
        gpa DECIMAL(3, 2),
        english_proficiency VARCHAR(50),
        english_test_score VARCHAR(50),
        status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
        console.log('✅ Created new students table with updated schema');

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

recreateStudentsTable();
