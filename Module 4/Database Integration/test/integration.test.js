process.env.DATABASE_URL ||= 'postgresql://stub:stub@localhost:5432/stub';

const { test, beforeEach } = require('node:test');
const assert = require('node:assert');
const { resetPosts } = require('./helpers/prismaStub');

const postRepository = require('../src/repositories/postRepository');
const postService = require('../src/services/postService');

beforeEach(() => {
  resetPosts([
    { id: 1, title: 'First post', body: 'The contract survives storage changes.', authorId: 1 },
    { id: 2, title: 'Second post', body: 'Migrations record database design.', authorId: 1 },
  ]);
});

test('findAll returns all posts', async () => {
  const posts = await postRepository.findAll();
  assert.equal(posts.length, 2);
  assert.equal(posts[0].title, 'First post');
});

test('findById returns a post or null', async () => {
  const post = await postRepository.findById(1);
  assert.equal(post.title, 'First post');
  assert.equal(await postRepository.findById(999), null);
});

test('create persists a new post', async () => {
  const created = await postRepository.create({ title: 'New', body: 'B', authorId: 1 });
  assert.equal(created.id, 3);
  assert.equal((await postRepository.findAll()).length, 3);
});

test('update patches fields and returns null for missing id', async () => {
  const updated = await postRepository.update(1, { title: 'Changed' });
  assert.equal(updated.title, 'Changed');
  assert.equal(updated.body, 'The contract survives storage changes.');
  assert.equal(await postRepository.update(999, { title: 'X' }), null);
});

test('remove deletes and reports missing ids', async () => {
  assert.equal(await postRepository.remove(2), true);
  assert.equal(await postRepository.remove(2), false);
  assert.equal((await postRepository.findAll()).length, 1);
});

// Service layer contract
test('service createPost rejects missing title with 422', async () => {
  await assert.rejects(
    () => postService.createPost({ body: 'no title' }),
    (error) => error.statusCode === 422
  );
});

test('service passes through repository contract', async () => {
  assert.equal((await postService.listPosts()).length, 2);
  const post = await postService.createPost({ title: 'S', body: 'B', authorId: 1 });
  assert.deepEqual(await postService.getPost(post.id), post);
  assert.equal(await postService.updatePost(post.id, { title: 'S2' }).then((p) => p.title), 'S2');
  assert.equal(await postService.removePost(post.id), true);
  assert.equal(await postService.getPost(post.id), null);
});
