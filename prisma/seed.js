import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'Algorisys',
      description: 'A technology company',
      applications: {
        create: [
          {
            name: 'App One',
            description: 'First application',
            url: 'https://appone.techcorp.com',
            imageUrl: 'https://example.com/appone.png',
          },
          {
            name: 'App Two',
            description: 'Second application',
            url: 'https://apptwo.techcorp.com',
            imageUrl: 'https://example.com/apptwo.png',
          },
        ],
      },
    },
  });

 

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      orgs: {
        create: {
          organizationId: org1.id,
          role: 'Admin',
        },
      },
    },
  });

 



  console.log({ user1});
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
