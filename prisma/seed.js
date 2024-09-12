const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    // Hash the password for the admin user
    const hashedPassword = await bcrypt.hash('12345678', 10);

    // Create an organization
    const org = await prisma.organization.create({
        data: {
            org_name: 'Algorisys Technologies',
            first_name: 'FirstName',
            last_name: 'LastName',
            email: 'firstname.lastname@algorisys.com',
            admin: true,
            org_size: 100,
            usage: 'High',
            users: {
                create: {
                    name: 'firstname@algorisys.com',
                    password: hashedPassword,
                    group_name: 'admin',
                    isActive: true,
                    role_id: 1,
                },
            },
        },
    });

    console.log('Seed data created:', org);
}

main()
    .then(() => {
        console.log('Seeding completed.');
    })
    .catch((e) => {
        console.error('Seeding error:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
