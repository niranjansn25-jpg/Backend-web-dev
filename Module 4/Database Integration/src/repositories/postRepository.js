const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findAll() {
  return prisma.post.findMany({ orderBy: { id: 'asc' } });
}

async function findById(id) {
  return prisma.post.findUnique({ where: { id: Number(id) } });
}

async function create(fields) {
  return prisma.post.create({
    data: {
      title: fields.title,
      body: fields.body || '',
      authorId: fields.authorId,
    },
  });
}

async function update(id, patch) {
  try {
    return await prisma.post.update({
      where: { id: Number(id) },
      data: patch,
    });
  } catch (error) {
    if (error.code === 'P2025') return null;
    throw error;
  }
}

async function remove(id) {
  try {
    await prisma.post.delete({ where: { id: Number(id) } });
    return true;
  } catch (error) {
    if (error.code === 'P2025') return false;
    throw error;
  }
}

module.exports = { findAll, findById, create, update, remove };
