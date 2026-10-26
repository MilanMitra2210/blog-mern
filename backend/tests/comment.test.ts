import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';

describe('Comment & Moderation Integration Tests', () => {
  setupTestDB();
  const app = createApp();

  let adminToken: string;
  let postId: string;

  beforeEach(async () => {
    // Register Admin
    await request(app).post('/api/v1/users/register').send({
      name: 'Admin User',
      email: 'admin@comments.com',
      password: 'AdminPassword123',
      role: 'ADMIN',
    });
    const adminLogin = await request(app).post('/api/v1/users/login').send({
      email: 'admin@comments.com',
      password: 'AdminPassword123',
    });
    adminToken = adminLogin.body.data.tokens.accessToken;

    // Create a Post
    const postRes = await request(app)
      .post('/api/v1/admin/blogs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Post for Comments Discussion',
        content: 'Content waiting for feedback',
        isPublished: true,
      });
    postId = postRes.body.data.id;
  });

  it('should create comment associated with post', async () => {
    const res = await request(app)
      .post('/api/v1/comments')
      .send({
        postId,
        authorName: 'Commenter Dave',
        authorEmail: 'dave@reader.com',
        content: 'Fascinating perspective on clean architecture!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Fascinating perspective on clean architecture!');
    expect(res.body.data.postTitle).toBe('Post for Comments Discussion');
  });

  it('should allow admin to moderate and approve comments', async () => {
    const commentRes = await request(app)
      .post('/api/v1/comments')
      .send({
        postId,
        authorName: 'Guest',
        authorEmail: 'guest@reader.com',
        content: 'A thoughtful comment',
      });
    const commentId = commentRes.body.data.id;

    const approveRes = await request(app)
      .put(`/api/v1/admin/comments/${commentId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.approved).toBe(true);
  });
});
