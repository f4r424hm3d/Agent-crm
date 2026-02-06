const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

async function backupDatabase() {
    let connection;

    try {
        // Connect to MySQL
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to MySQL database');

        // Get all tables
        const [tables] = await connection.query('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);

        console.log(`Found ${tableNames.length} tables:`, tableNames);

        let sqlDump = `-- MySQL Backup for ${process.env.DB_NAME}\n`;
        sqlDump += `-- Created: ${new Date().toISOString()}\n\n`;
        sqlDump += `-- =============================================\n\n`;

        // Export each table
        for (const tableName of tableNames) {
            console.log(`Backing up table: ${tableName}`);

            // Get CREATE TABLE statement
            const [createTable] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
            sqlDump += `-- Table: ${tableName}\n`;
            sqlDump += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
            sqlDump += createTable[0]['Create Table'] + ';\n\n';

            // Get table data
            const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);

            if (rows.length > 0) {
                sqlDump += `-- Data for table: ${tableName}\n`;

                for (const row of rows) {
                    const columns = Object.keys(row);
                    const values = Object.values(row).map(val => {
                        if (val === null) return 'NULL';
                        if (typeof val === 'number') return val;
                        if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
                        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "\\'")}'`;
                        return `'${String(val).replace(/'/g, "\\'")}'`;
                    });

                    sqlDump += `INSERT INTO \`${tableName}\` (\`${columns.join('`, `')}\`) VALUES (${values.join(', ')});\n`;
                }

                sqlDump += '\n';
            }

            sqlDump += `-- =============================================\n\n`;
        }

        // Write to file
        const backupPath = path.join(__dirname, '..', 'backup_mysql.sql');
        await fs.writeFile(backupPath, sqlDump, 'utf8');

        console.log(`✅ Backup completed successfully!`);
        console.log(`📁 Backup file: ${backupPath}`);

        // Also create a JSON backup for easier MongoDB import
        const jsonBackup = {};
        for (const tableName of tableNames) {
            const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
            jsonBackup[tableName] = rows;
        }

        const jsonBackupPath = path.join(__dirname, '..', 'backup_mysql.json');
        await fs.writeFile(jsonBackupPath, JSON.stringify(jsonBackup, null, 2), 'utf8');

        console.log(`📁 JSON Backup file: ${jsonBackupPath}`);

    } catch (error) {
        console.error('❌ Backup failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

backupDatabase();
