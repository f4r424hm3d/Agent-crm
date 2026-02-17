// Mock data for brochure module testing

export const mockBrochureTypes = [
    { id: 1, name: 'University Brochure', upCount: 75 },
    { id: 2, name: 'MBBS Abroad', upCount: 135 },
    { id: 3, name: 'Engineering Programs', upCount: 42 },
];

export const mockCategories = [
    { id: 1, name: 'Video', brochure_type_id: 1 },
    { id: 2, name: 'Fee Structure', brochure_type_id: 1 },
    { id: 3, name: 'Course Details', brochure_type_id: 2 },
    { id: 4, name: 'Admission Process', brochure_type_id: 2 },
];

export const mockUniversityPrograms = {
    1: [ // University Brochure
        {
            id: 1,
            brochure_type_id: 1,
            country: 'MALAYSIA',
            name: 'Asia Pacific University of Technology & Innovation',
            brochureCount: 3,
        },
        {
            id: 2,
            brochure_type_id: 1,
            country: 'MALAYSIA',
            name: 'International Medical University (IMU)',
            brochureCount: 3,
        },
        {
            id: 3,
            brochure_type_id: 1,
            country: 'MALAYSIA',
            name: 'Management and Science University',
            brochureCount: 3,
        },
        {
            id: 4,
            brochure_type_id: 1,
            country: 'MALAYSIA',
            name: 'Quest International University Perak',
            brochureCount: 6,
        },
        {
            id: 5,
            brochure_type_id: 1,
            country: 'MALAYSIA',
            name: 'AIMST University',
            brochureCount: 17,
        },
    ],
    2: [ // MBBS Abroad
        {
            id: 6,
            brochure_type_id: 2,
            country: 'RUSSIA',
            name: 'Kazan Federal University',
            brochureCount: 5,
        },
        {
            id: 7,
            brochure_type_id: 2,
            country: 'RUSSIA',
            name: 'Peoples Friendship University',
            brochureCount: 8,
        },
    ],
    3: [ // Engineering Programs
        {
            id: 8,
            brochure_type_id: 3,
            country: 'USA',
            name: 'MIT',
            brochureCount: 12,
        },
    ],
};

export const mockBrochures = {
    1: [ // Asia Pacific University
        {
            id: 1,
            up_id: 1,
            category_id: 1,
            title: 'University Overview Video',
            file_url: 'https://example.com/apu-overview.pdf',
            date: '2026-02-15',
            created_at: '2026-02-15T10:00:00Z',
        },
        {
            id: 2,
            up_id: 1,
            category_id: 2,
            title: 'Fee Structure 2026',
            file_url: 'https://example.com/apu-fees.pdf',
            date: '2026-02-14',
            created_at: '2026-02-14T10:00:00Z',
        },
    ],
    2: [ // IMU
        {
            id: 3,
            up_id: 2,
            category_id: 1,
            title: 'Campus Tour Video',
            file_url: 'https://example.com/imu-tour.pdf',
            date: '2026-02-13',
            created_at: '2026-02-13T10:00:00Z',
        },
    ],
};

// Helper function to get UP details
export const getUPDetails = (upId) => {
    for (const typeId in mockUniversityPrograms) {
        const up = mockUniversityPrograms[typeId].find(u => u.id == upId);
        if (up) {
            const type = mockBrochureTypes.find(t => t.id == typeId);
            return {
                ...up,
                brochure_type_name: type?.name || 'Unknown',
            };
        }
    }
    return null;
};

// Helper function to get category name
export const getCategoryName = (categoryId) => {
    const category = mockCategories.find(c => c.id == categoryId);
    return category?.name || 'Unknown';
};
