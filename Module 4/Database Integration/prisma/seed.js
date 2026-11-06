const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const users = [{ id: 1, name: 'Author' }];

const posts = [
  { title: 'First post', body: 'The contract survives storage changes.', authorId: 1 },
  { title: 'Second post', body: 'Migrations record database design.', authorId: 1 },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { name: user.name },
      update: {},
      create: user,
    });
  }
  const existing = await prisma.post.count();
  if (existing === 0) {
    await prisma.post.createMany({ data: posts });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
