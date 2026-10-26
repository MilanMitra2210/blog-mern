import request from 'supertest';
import { createApp } from '../src/app.js';
import { setupTestDB } from './setup.js';
import { User } from '../src/models/User.js';
import { Role } from '../src/models/Role.js';

describe('Role & User RBAC Integration Tests (Specification Aligned)', () => {
  setupTestDB();
  const app = createApp();

  let adminToken: string;
  let adminUser: any;
  let regularToken: string;
  let regularUser: any;

  beforeEach(async () => {
    // Create admin user
    adminUser = await User.create({
      name: 'Super Admin',
      email: 'admin@quillforge.com',
      password: 'AdminPassword123',
      role: 'ADMIN',
    });

    // Create regular user
    regularUser = await User.create({
      name: 'Regular Member',
      email: 'member@quillforge.com',
      password: 'UserPassword123',
      role: 'USER',
    });

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@quillforge.com', password: 'AdminPassword123' });
    adminToken = adminLogin.body.data.tokens.accessToken;

    const userLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'member@quillforge.com', password: 'UserPassword123' });
    regularToken = userLogin.body.data.tokens.accessToken;
  });

  describe('Section 2: Enforcing Two Types of Users & RBAC at API Level', () => {
    it('should allow Admin to manage all users', async () => {
      // Admin lists users
      const listRes = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.items.length).toBeGreaterThanOrEqual(2);

      // Admin creates user
      const createRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Registered User',
          email: 'newuser@quillforge.com',
          password: 'Password123',
          role: 'USER',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body.data.email).toBe('newuser@quillforge.com');
    });

    it('should forbid Regular User from managing all users', async () => {
      // Regular user tries to list all users
      const listRes = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(listRes.status).toBe(403);
      expect(listRes.body.success).toBe(false);

      // Regular user tries to create another user
      const createRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${regularToken}`)
        .send({
          name: 'Hacked User',
          email: 'hacked@quillforge.com',
          password: 'Password123',
        });

      expect(createRes.status).toBe(403);

      // Regular user tries to delete admin
      const deleteRes = await request(app)
        .delete(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(deleteRes.status).toBe(403);
    });

    it('should allow Regular User to access and update only their own profile', async () => {
      // Own profile
      const ownRes = await request(app)
        .get(`/api/v1/users/${regularUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(ownRes.status).toBe(200);
      expect(ownRes.body.data.email).toBe('member@quillforge.com');

      // Someone else's profile
      const otherRes = await request(app)
        .get(`/api/v1/users/${adminUser._id}`)
        .set('Authorization', `Bearer ${regularToken}`);

      expect(otherRes.status).toBe(403);
    });
  });

  describe('Section 2 & 5: Role & Permissions Catalog API', () => {
    it('should return available permissions grouped by category', async () => {
      const res = await request(app)
        .get('/api/v1/admin/roles/permissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.some((p: any) => p.key === 'blogs:read')).toBe(true);
      expect(res.body.data.some((p: any) => p.key === 'users:write')).toBe(true);
    });

    it('should get seeded default roles when none exist', async () => {
      const res = await request(app)
        .get('/api/v1/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(4);
      expect(res.body.data.some((r: any) => r.name === 'Editor')).toBe(true);
    });

    it('should create a new custom role', async () => {
      const res = await request(app)
        .post('/api/v1/admin/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Social Media Manager',
          description: 'Manages posts and media only',
          permissions: ['blogs:read', 'blogs:write', 'media:read', 'media:write'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Social Media Manager');
      expect(res.body.data.permissions).toHaveLength(4);
    });

    it('should update an existing role', async () => {
      const created = await Role.create({
        name: 'Curator',
        description: 'Old description',
        permissions: ['blogs:read'],
      });

      const res = await request(app)
        .put(`/api/v1/admin/roles/${created._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Chief Curator',
          description: 'Updated curator description',
          permissions: ['blogs:read', 'blogs:write', 'categories:read'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Chief Curator');
      expect(res.body.data.permissions).toContain('categories:read');
    });

    it('should assign a custom role to a user and populate roleRel with its permissions', async () => {
      const customRole = await Role.create({
        name: 'Content Moderator',
        description: 'Moderates comments and user content',
        permissions: ['comments:read', 'comments:write'],
      });

      const createUserRes = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Jane Moderator',
          email: 'jane@example.com',
          password: 'Password123',
          role: 'USER',
          roleId: customRole._id.toString(),
        });

      expect(createUserRes.status).toBe(201);
      expect(createUserRes.body.success).toBe(true);
      expect(createUserRes.body.data.roleId).toBe(customRole._id.toString());
      expect(createUserRes.body.data.roleRel).toBeDefined();
      expect(createUserRes.body.data.roleRel.name).toBe('Content Moderator');
      expect(createUserRes.body.data.roleRel.permissions).toEqual(['comments:read', 'comments:write']);
    });

    it('should delete a role and unlink users assigned to it', async () => {
      const tempRole = await Role.create({
        name: 'Temporary Intern',
        description: 'Temporary role',
        permissions: ['blogs:read'],
      });

      const internUser = await User.create({
        name: 'Intern User',
        email: 'intern@example.com',
        role: 'USER',
        roleId: tempRole._id,
      });

      const deleteRes = await request(app)
        .delete(`/api/v1/admin/roles/${tempRole._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      const refreshedUser = await User.findById(internUser._id);
      expect(refreshedUser?.roleId).toBeNull();
    });
  });
});
