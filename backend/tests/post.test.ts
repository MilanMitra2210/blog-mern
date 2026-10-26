import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';
import { Post } from '../src/models/Post.js';

describe('Post & RBAC Integration Tests', () => {
  setupTestDB();
  const app = createApp();

  let adminToken: string;
  let userToken: string;
  let otherUserToken: string;

  beforeEach(async () => {
    // Register Admin
    const adminRes = await request(app).post('/api/v1/users/register').send({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'AdminPassword123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/users/login').send({
      email: 'admin@test.com',
      password: 'AdminPassword123',
    });
    adminToken = adminLogin.body.data.tokens.accessToken;

    // Register User 1
    const userRes = await request(app).post('/api/v1/users/register').send({
      name: 'Regular User 1',
      email: 'user1@test.com',
      password: 'UserPassword123',
      role: 'USER',
    });
    const userLogin = await request(app).post('/api/v1/users/login').send({
      email: 'user1@test.com',
      password: 'UserPassword123',
    });
    userToken = userLogin.body.data.tokens.accessToken;

    // Register User 2
    const otherRes = await request(app).post('/api/v1/users/register').send({
      name: 'Regular User 2',
      email: 'user2@test.com',
      password: 'UserPassword123',
      role: 'USER',
    });
    const otherLogin = await request(app).post('/api/v1/users/login').send({
      email: 'user2@test.com',
      password: 'UserPassword123',
    });
    otherUserToken = otherLogin.body.data.tokens.accessToken;
  });

  describe('Post Creation & Slug Generation', () => {
    it('should create post and auto-generate URL-friendly slug', async () => {
      const res = await request(app)
        .post('/api/v1/admin/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'My First Incredible Blog Post!',
          content: 'This is the detailed content of the blog post with several technical insights.',
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('my-first-incredible-blog-post');
      expect(res.body.data.readTime).toBeGreaterThanOrEqual(1);
    });
  });

  describe('RBAC & Ownership Enforcement', () => {
    it('should prevent User 2 from updating User 1 post', async () => {
      // User 1 creates post
      const created = await request(app)
        .post('/api/v1/admin/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User 1 Private Post',
          content: 'Original content',
        });
      const postId = created.body.data.id;

      // User 2 attempts to edit it
      const forbiddenRes = await request(app)
        .put(`/api/v1/admin/blogs/${postId}`)
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          title: 'Hacked by User 2',
        });

      expect(forbiddenRes.status).toBe(403);
      expect(forbiddenRes.body.success).toBe(false);
      expect(forbiddenRes.body.detail).toContain('own posts');
    });

    it('should allow Admin to update or delete any user post', async () => {
      // User 1 creates post
      const created = await request(app)
        .post('/api/v1/admin/blogs')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User 1 Post for Admin Review',
          content: 'Original content',
        });
      const postId = created.body.data.id;

      // Admin edits the post
      const adminUpdate = await request(app)
        .put(`/api/v1/admin/blogs/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Moderated by Admin',
        });

      expect(adminUpdate.status).toBe(200);
      expect(adminUpdate.body.data.title).toBe('Moderated by Admin');

      // Admin soft-deletes the post
      const adminDelete = await request(app)
        .delete(`/api/v1/admin/blogs/${postId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminDelete.status).toBe(200);

      // Verify soft delete
      const dbPost = await Post.findById(postId);
      expect(dbPost?.isDeleted).toBe(true);
      expect(dbPost?.deletedAt).toBeDefined();
    });
  });
});
