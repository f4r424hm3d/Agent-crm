const { sequelize } = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function seedAgents() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Clear existing agents
        await sequelize.query('DELETE FROM agents;');
        console.log('✅ Cleared agents table');

        // Reset auto increment
        await sequelize.query('ALTER TABLE agents AUTO_INCREMENT = 1;');
        console.log('✅ Reset auto increment');

        // Hash password
        const password = await bcrypt.hash('12345678', 10);

        // Sample agent data
        const agents = [
            {
                email: 'agent@gmail.com',
                password,
                first_name: 'Rajesh',
                last_name: 'Kumar',
                phone: '+91 98765 43210',
                alternate_phone: '+91 87654 32109',
                designation: 'Director',
                experience: '10+ years',
                qualification: 'MBA',
                company_name: 'Global Education Consultants',
                company_type: 'Private Limited',
                registration_number: 'REG123456',
                established_year: 2015,
                website: 'https://globaledu.com',
                address: '123, MG Road, Commercial Complex',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                country: 'India',
                specialization: JSON.stringify(['MBBS Admissions', 'Medical Counseling', 'Visa Assistance']),
                services_offered: JSON.stringify(['Admission Counseling', 'Visa Processing', 'Accommodation Assistance']),
                current_students: '100-250',
                team_size: '11-25',
                annual_revenue: '1-5 Crores',
                partnership_type: 'Authorized Representative',
                expected_students: '51-100',
                marketing_budget: '5-10 Lakhs',
                why_partner: 'Looking to expand our medical education services and help more students achieve their dreams.',
                references: 'Dr. Sharma - 9876543210, Prof. Patel - 9876543211',
                additional_info: 'We have successfully placed 500+ students in top medical universities.',
                terms_accepted: true,
                data_consent: true,
                terms_accepted_at: new Date(),
                data_consent_at: new Date(),
                status: 'active',
                approval_status: 'approved',
                approved_at: new Date(),
            },
            {
                email: 'agent1@gmail.com',
                password,
                first_name: 'Priya',
                last_name: 'Sharma',
                phone: '+91 98765 43211',
                alternate_phone: '+91 87654 32110',
                designation: 'Senior Consultant',
                experience: '6-10 years',
                qualification: 'M.Sc',
                company_name: 'Career Plus Education',
                company_type: 'Partnership',
                registration_number: 'REG123457',
                established_year: 2018,
                website: 'https://careerplusedu.com',
                address: '456, Park Street, Business Tower',
                city: 'Delhi',
                state: 'Delhi',
                pincode: '110001',
                country: 'India',
                specialization: JSON.stringify(['International Admissions', 'Student Support', 'Career Guidance']),
                services_offered: JSON.stringify(['University Selection', 'Application Processing', 'Financial Planning']),
                current_students: '51-100',
                team_size: '6-10',
                annual_revenue: '25 Lakhs - 1 Crore',
                partnership_type: 'Regional Partner',
                expected_students: '26-50',
                marketing_budget: '1-5 Lakhs',
                why_partner: 'We want to provide better opportunities for students aspiring for medical careers abroad.',
                references: 'Ms. Verma - 9876543212, Mr. Singh - 9876543213',
                additional_info: 'Specialized in European medical universities.',
                terms_accepted: true,
                data_consent: true,
                terms_accepted_at: new Date(),
                data_consent_at: new Date(),
                status: 'active',
                approval_status: 'approved',
                approved_at: new Date(),
            },
            {
                email: 'agent2@gmail.com',
                password,
                first_name: 'Amit',
                last_name: 'Patel',
                phone: '+91 98765 43212',
                alternate_phone: '+91 87654 32111',
                designation: 'Manager',
                experience: '3-5 years',
                qualification: 'B.Tech',
                company_name: 'Future Scholars',
                company_type: 'Proprietorship',
                registration_number: 'REG123458',
                established_year: 2020,
                website: 'https://futurescholars.com',
                address: '789, Anna Salai, Office Complex',
                city: 'Chennai',
                state: 'Tamil Nadu',
                pincode: '600001',
                country: 'India',
                specialization: JSON.stringify(['NEET Coaching', 'Abroad Studies', 'Scholarship Guidance']),
                services_offered: JSON.stringify(['Test Preparation', 'Career Counseling', 'Document Verification']),
                current_students: '1-50',
                team_size: '1-5',
                annual_revenue: '10-25 Lakhs',
                partnership_type: 'Referral Partner',
                expected_students: '10-25',
                marketing_budget: 'Under 1 Lakh',
                why_partner: 'To expand our reach and provide quality medical education guidance.',
                references: 'Dr. Reddy - 9876543214',
                additional_info: 'Focus on South Indian students.',
                terms_accepted: true,
                data_consent: true,
                terms_accepted_at: new Date(),
                data_consent_at: new Date(),
                status: 'active',
                approval_status: 'approved',
                approved_at: new Date(),
            },
            {
                email: 'agent3@gmail.com',
                password,
                first_name: 'Sneha',
                last_name: 'Desai',
                phone: '+91 98765 43213',
                alternate_phone: '+91 87654 32112',
                designation: 'Founder',
                experience: '15+ years',
                qualification: 'Ph.D',
                company_name: 'MedPath Consultancy',
                company_type: 'LLP',
                registration_number: 'REG123459',
                established_year: 2010,
                website: 'https://medpath.com',
                address: '321, Brigade Road, Corporate Hub',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                country: 'India',
                specialization: JSON.stringify(['University Partnerships', 'Student Mentoring', 'Documentation']),
                services_offered: JSON.stringify(['Scholarship Guidance', 'Travel Arrangements', 'Post-arrival Support']),
                current_students: '250-500',
                team_size: '26-50',
                annual_revenue: '5+ Crores',
                partnership_type: 'Exclusive Partner',
                expected_students: '101-200',
                marketing_budget: '25+ Lakhs',
                why_partner: 'We have a proven track record and want to collaborate with the best institutions.',
                references: 'Prof. Menon - 9876543215, Dr. Iyer - 9876543216, Ms. Nair - 9876543217',
                additional_info: 'Partner with 20+ international medical universities. Placement rate: 98%.',
                terms_accepted: true,
                data_consent: true,
                terms_accepted_at: new Date(),
                data_consent_at: new Date(),
                status: 'active',
                approval_status: 'approved',
                approved_at: new Date(),
            },
            {
                email: 'agent4@gmail.com',
                password,
                first_name: 'Vikram',
                last_name: 'Singh',
                phone: '+91 98765 43214',
                alternate_phone: '+91 87654 32113',
                designation: 'Consultant',
                experience: '1-2 years',
                qualification: 'MBA',
                company_name: 'EduBridge Services',
                company_type: 'Private Limited',
                registration_number: 'REG123460',
                established_year: 2022,
                website: 'https://edubridge.com',
                address: '654, SG Highway, Business Center',
                city: 'Ahmedabad',
                state: 'Gujarat',
                pincode: '380001',
                country: 'India',
                specialization: JSON.stringify(['Pre-departure Support', 'MBBS Admissions', 'Medical Counseling']),
                services_offered: JSON.stringify(['Admission Counseling', 'Visa Processing', 'Travel Arrangements']),
                current_students: '51-100',
                team_size: '6-10',
                annual_revenue: '10-25 Lakhs',
                partnership_type: 'Franchise Partner',
                expected_students: '26-50',
                marketing_budget: '1-5 Lakhs',
                why_partner: 'New in the market and looking for credible partnerships to grow our business.',
                references: 'Mr. Shah - 9876543218',
                additional_info: 'Young and dynamic team focused on excellent student support.',
                terms_accepted: true,
                data_consent: true,
                terms_accepted_at: new Date(),
                data_consent_at: new Date(),
                status: 'active',
                approval_status: 'pending',
                approved_at: null,
            },
        ];

        // Insert agents
        for (const agent of agents) {
            await sequelize.query(
                `INSERT INTO agents (
          email, password, first_name, last_name, phone, alternate_phone,
          designation, experience, qualification, company_name, company_type,
          registration_number, established_year, website, address, city, state,
          pincode, country, specialization, services_offered, current_students,
          team_size, annual_revenue, partnership_type, expected_students,
          marketing_budget, why_partner, \`references\`, additional_info,
          terms_accepted, data_consent, terms_accepted_at, data_consent_at,
          status, approval_status, approved_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                {
                    replacements: [
                        agent.email, agent.password, agent.first_name, agent.last_name,
                        agent.phone, agent.alternate_phone, agent.designation, agent.experience,
                        agent.qualification, agent.company_name, agent.company_type,
                        agent.registration_number, agent.established_year, agent.website,
                        agent.address, agent.city, agent.state, agent.pincode, agent.country,
                        agent.specialization, agent.services_offered, agent.current_students,
                        agent.team_size, agent.annual_revenue, agent.partnership_type,
                        agent.expected_students, agent.marketing_budget, agent.why_partner,
                        agent.references, agent.additional_info, agent.terms_accepted,
                        agent.data_consent, agent.terms_accepted_at, agent.data_consent_at,
                        agent.status, agent.approval_status, agent.approved_at,
                    ],
                }
            );
            console.log(`✅ Inserted agent: ${agent.email}`);
        }

        console.log('\n✅ Seeding completed successfully!');
        console.log('📋 Created 5 agent records:');
        console.log('   - agent@gmail.com (password: 12345678)');
        console.log('   - agent1@gmail.com (password: 12345678)');
        console.log('   - agent2@gmail.com (password: 12345678)');
        console.log('   - agent3@gmail.com (password: 12345678)');
        console.log('   - agent4@gmail.com (password: 12345678)');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedAgents();
