import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';
import { Post } from '../src/models/Post.js';
import { User } from '../src/models/User.js';

describe('Blog Meta & Management Integration Tests (Categories, Authors, Tags, Redirects, Import)', () => {
  setupTestDB();
  const app = createApp();

  let adminToken: string;
  let testPostId: string;

  beforeEach(async () => {
    // Register Admin
    await request(app).post('/api/v1/users/register').send({
      name: 'Admin Tester',
      email: 'admin@meta.com',
      password: 'AdminPassword123',
      role: 'ADMIN',
    });

    const loginRes = await request(app).post('/api/v1/users/login').send({
      email: 'admin@meta.com',
      password: 'AdminPassword123',
    });
    adminToken = loginRes.body.data.tokens.accessToken;

    const user = await User.findOne({ email: 'admin@meta.com' });
    const post = await Post.create({
      title: 'Target Blog For Redirects',
      slug: 'target-blog-for-redirects',
      content: 'Sample content',
      excerpt: 'Sample excerpt',
      author: user!._id,
      isPublished: true,
    });
    testPostId = post._id.toString();
  });

  it('should create, list, update, and delete blog categories', async () => {
    // 1. Create Category
    const createRes = await request(app)
      .post('/api/v1/admin/blogs/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Artificial Intelligence',
        description: 'AI & Machine Learning articles',
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Artificial Intelligence');
    const categoryId = createRes.body.data.id;

    // 2. List Categories (Public)
    const listRes = await request(app).get('/api/v1/blogs/categories');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.some((c: any) => c.name === 'Artificial Intelligence')).toBe(true);

    // 3. Update Category
    const updateRes = await request(app)
      .put(`/api/v1/admin/blogs/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Gen AI & Deep Learning' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe('Gen AI & Deep Learning');

    // 4. Delete Category
    const deleteRes = await request(app)
      .delete(`/api/v1/admin/blogs/categories/${categoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('should create, list, update, and delete blog authors', async () => {
    // 1. Create Author
    const createRes = await request(app)
      .post('/api/v1/admin/blogs/authors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Ada Lovelace',
        bio: 'Pioneering computer programmer',
        designation: 'Senior Computing Fellow',
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.data.name).toBe('Ada Lovelace');
    const authorId = createRes.body.data.id;

    // 2. List Authors (Public)
    const listRes = await request(app).get('/api/v1/blogs/authors');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    // 3. Update Author
    const updateRes = await request(app)
      .put(`/api/v1/admin/blogs/authors/${authorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ designation: 'Chief Mathematician' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.designation).toBe('Chief Mathematician');

    // 4. Delete Author
    const deleteRes = await request(app)
      .delete(`/api/v1/admin/blogs/authors/${authorId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('should create, get, list, update, and delete blog tags', async () => {
    // 1. Create Tag
    const createRes = await request(app)
      .post('/api/v1/admin/blogs/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Architecture' });
    expect(createRes.status).toBe(201);
    const tagId = createRes.body.data.id;

    // 2. Get Tag By ID
    const getRes = await request(app)
      .get(`/api/v1/admin/blogs/tags/${tagId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.name).toBe('Architecture');

    // 3. List Tags (Public)
    const listRes = await request(app).get('/api/v1/blogs/tags');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body.data)).toBe(true);

    // 4. Update Tag
    const updateRes = await request(app)
      .put(`/api/v1/admin/blogs/tags/${tagId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'System Design' });
    expect(updateRes.status).toBe(200);

    // 5. Delete Tag
    const deleteRes = await request(app)
      .delete(`/api/v1/admin/blogs/tags/${tagId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('should create, list, and delete blog redirects', async () => {
    // 1. Create Redirect
    const createRes = await request(app)
      .post('/api/v1/admin/blogs/redirects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        old_slug: 'legacy-intro-url',
        blog_id: testPostId,
      });
    expect(createRes.status).toBe(201);

    // 2. Get Redirect Map
    const mapRes = await request(app).get('/api/v1/blogs/redirects/map');
    expect(mapRes.status).toBe(200);
    expect(mapRes.body.data['legacy-intro-url']).toBe('target-blog-for-redirects');

    // 3. Access Old Slug and receive 301 redirect
    const redirectSlugRes = await request(app).get('/api/v1/blogs/slug/legacy-intro-url');
    expect(redirectSlugRes.status).toBe(301);
    expect(redirectSlugRes.headers.location).toBe('/blog/target-blog-for-redirects');

    // 4. Delete Redirect
    const deleteRes = await request(app)
      .delete('/api/v1/admin/blogs/redirects/legacy-intro-url')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it('should import a blog post from markdown/json file and download template', async () => {
    // 1. Download template
    const templateRes = await request(app).get('/api/v1/admin/blogs/import/template');
    expect(templateRes.status).toBe(200);
    expect(templateRes.text).toContain('Meta Title:');

    // 2. Import JSON format post
    const sampleJson = JSON.stringify({
      title: 'Imported Cloud Architecture Post',
      excerpt: 'A post imported via automated file pipeline.',
      content: '<p>Cloud architecture details</p>',
    });

    const importRes = await request(app)
      .post('/api/v1/admin/blogs/import')
      .set('Authorization', `Bearer ${adminToken}`)
      .attach('file', Buffer.from(sampleJson), 'article.json');

    expect(importRes.status).toBe(201);
    expect(importRes.body.data.title).toBe('Imported Cloud Architecture Post');
  });

  it('should provide geo, utm, and engagement metrics for analytics modal', async () => {
    const geoRes = await request(app)
      .get(`/api/v1/admin/analytics/geo?entityId=${testPostId}&entityType=blog`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(geoRes.status).toBe(200);
    expect(Array.isArray(geoRes.body.data)).toBe(true);

    const utmRes = await request(app)
      .get(`/api/v1/admin/analytics/utm?entityId=${testPostId}&entityType=blog`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(utmRes.status).toBe(200);
    expect(Array.isArray(utmRes.body.data)).toBe(true);

    const engagementRes = await request(app)
      .get(`/api/v1/admin/analytics/engagement?entityId=${testPostId}&entityType=blog`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(engagementRes.status).toBe(200);
    expect(engagementRes.body.data.milestone100).toBeDefined();
  });
});
