// Test helper: stubs @prisma/client before any module loads it.
const postsStore = [];
let nextId = 1;

const prismaStub = {
  $disconnect: async () => {},
  post: {
    findMany: async () => postsStore.map((p) => ({ ...p })),
    findUnique: async ({ where }) => postsStore.find((p) => p.id === where.id) || null,
    create: async ({ data }) => {
      const post = { id: nextId++, body: '', ...data };
      postsStore.push(post);
      return { ...post };
    },
    update: async ({ where, data }) => {
      const post = postsStore.find((p) => p.id === where.id);
      if (!post) {
        const error = new Error('Record not found');
        error.code = 'P2025';
        throw error;
      }
      Object.assign(post, data);
      return { ...post };
    },
    delete: async ({ where }) => {
      const index = postsStore.findIndex((p) => p.id === where.id);
      if (index === -1) {
        const error = new Error('Record not found');
        error.code = 'P2025';
        throw error;
      }
      postsStore.splice(index, 1);
      return {};
    },
    count: async () => postsStore.length,
    createMany: async ({ data }) => {
      for (const item of data) prismaStub.post.create({ data: item });
      return { count: data.length };
    },
  },
  user: {
    upsert: async () => ({}),
  },
};

function resetPosts(seed) {
  postsStore.length = 0;
  nextId = 1;
  if (seed) postsStore.push(...seed.map((p) => ({ ...p })));
  nextId = postsStore.reduce((max, p) => Math.max(max, p.id), 0) + 1;
}

require.cache[require.resolve('@prisma/client')] = {
  id: '@prisma/client',
  filename: require.resolve('@prisma/client'),
  loaded: true,
  exports: { PrismaClient: function PrismaClient() { return prismaStub; } },
};

module.exports = { prismaStub, resetPosts };
