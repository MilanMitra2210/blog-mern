# QuillForge — Production-Grade MERN Stack Blog System & Admin Panel

A modern, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** application built with **TypeScript**, featuring enterprise-grade authentication, role-based access control (RBAC), advanced blog post management, revision history tracking, live SEO auditing, comment moderation, and real-time reader engagement.

---

## 🌟 Key Features

### 1. User Authentication & Security
- **JWT Authentication:** Dual-token architecture with short-lived Access Tokens (15 min) and Refresh Tokens (7 days) with token rotation.
- **Secure Password Hashing:** Passwords securely hashed with `bcryptjs` (salt factor 10).
- **Social OAuth 2.0:** Google & Facebook OAuth login integration.
- **API Rate Limiting:** Endpoint protection against brute-force attacks using `express-rate-limit`.
- **Environment Driven:** Zero hardcoded secrets; strictly controlled via `.env`.

### 2. Role-Based Access Control (RBAC)
- **Two User Roles:**
  - `ADMIN`: Complete management over all users, posts, comments, media, and platform analytics.
  - `USER`: Regular authors who can create and manage **only their own** posts and comments.
- **API-Level Enforcement:** Middleware (`requireAdmin`, `checkPostOwnership`, `checkCommentOwnership`) strictly enforces permissions at the backend layer.

### 3. Advanced Blog Post Management
- **Full CRUD:** Rich multi-section post builder, excerpts, and category/tag associations.
- **Automatic URL Slugs:** URL-friendly slugs auto-generated using `slugify` with uniqueness collision resolution.
- **Dynamic Read-Time Calculation:** Automatically calculates estimated reading minutes based on word count.
- **Revision History & Tracker:** Automatic version snapshotting on each edit with **1-click restore** functionality.
- **Live SEO Auditor:** Real-time analysis of keyword density, meta title/description length, and heading hierarchy.
- **Soft Deletes:** Non-destructive deletion via `isDeleted` and `deletedAt` timestamps.
- **Likes & Views Analytics:** View counter increments and like reactions.

### 4. Interactive Comments & Moderation
- **Post-Comment References:** Mongoose relationships linking comments directly to blog posts.
- **Nested Replies:** Support for hierarchical comment threads via `parentId`.
- **Admin Moderation:** Dedicated approval and deletion workflow for community safety.
- **Author Ownership:** Users can edit or delete their own comments.

### 5. Dedicated React Admin Dashboard
- **Executive KPIs:** Live display of **Total Users**, **Total Posts**, and **Total Comments**.
- **Reader Engagement Timeline:** Interactive 7-day traffic and engagement charts.
- **Active Reader Tracking:** Real-time reader metrics and stream.
- **Cleaned & Focused:** Unwanted legacy boilerplate (CMS Pages, Enquiries) removed for maximum focus.

### 6. Clean Architecture & Code Quality
- **Layered Structure:** `routes/` ➔ `controllers/` ➔ `services/` ➔ `models/` + `middleware/` + `validations/`.
- **Type-Safe:** Written 100% in **TypeScript** across both backend and frontend.
- **Payload Validation:** Robust request validation using **Joi**.
- **Centralized Error Handling:** Standardized error responses (`{ success: false, detail: "..." }`).

### 7. Bonus: Real-time Communication (Socket.io)
- Integrated **Socket.io** server tracking live connected readers and broadcasting post/comment updates.

---

## 🏗️ Repository Architecture

```
assessment/
├── frontend/               # Next.js 16 (App Router + TypeScript + Tailwind CSS) — Public Reader App
│   ├── src/
│   │   ├── app/            # App router pages: Homepage (/), Article (/blog/[slug])
│   │   ├── components/     # Navbar, LiveReaderBadge, PostCard, CommentsSection, LikeButton
│   │   └── lib/            # Socket.io client & REST API client
│   └── package.json
│
├── admin/                  # React (Vite + TypeScript + Redux Toolkit + Tailwind CSS) — Admin Console
│   ├── src/
│   │   ├── components/     # UI Components, SEO Sidebar, Revision Modal, Dashboard
│   │   ├── pages/          # Blogs, Comments, Users, Media, Dashboard
│   │   ├── router/         # Protected and public routes
│   │   └── services/       # RTK Query API client
│   └── package.json
│
├── backend/                # Node.js + Express.js + Mongoose + TypeScript API
│   ├── src/
│   │   ├── config/         # MongoDB connection
│   │   ├── controllers/    # Express route handlers
│   │   ├── middleware/     # Auth, RBAC, Rate Limiter, Activity Logger, Error Handler
│   │   ├── models/         # Mongoose Schemas (User, Post, Comment, Revision, Media)
│   │   ├── routes/         # Express Router groups
│   │   ├── services/       # Core business logic layer
│   │   ├── socket/         # Socket.io real-time layer
│   │   ├── types/          # Shared TypeScript definitions
│   │   ├── utils/          # API response formatter, slug generator
│   │   ├── validations/    # Joi request validation schemas
│   │   ├── app.ts          # Express application setup
│   │   └── server.ts       # Server entry point & auto-seeder
│   ├── tests/              # Jest + Supertest integration tests
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js:** v18+ or v20+
- **MongoDB:** Running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

---

### Step 1: Start the Backend (API Server)

```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Start in development mode (with auto-reload via tsx)
npm run dev
```

The backend starts at **`http://localhost:8080`**.
> **Default Credentials Bootstrap:** On first start, the database is initialized with default accounts:
> - **Admin:** `admin@quillforge.com` / `Admin@1234`
> - **Regular User:** `user@quillforge.com` / `User@1234`

---

### Step 2: Start the Admin Panel (React Frontend)

In a separate terminal:

```bash
cd admin

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

The Admin Panel opens at **`http://localhost:5174`**.

---

### Step 3: Start the Reader Publication (Next.js Frontend)

In a third terminal:

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Next.js development server
npm run dev
```

The Reader Publication opens at **`http://localhost:3003`** (featuring real-time socket reader tracking, live view beacons, comments, and direct links from the Admin table).

---

## 🔑 Default Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@quillforge.com` | `Admin@1234` | Full access to Dashboard, Blogs, Comments, Users, Media |
| **Regular User** | `user@quillforge.com` | `User@1234` | Can create and edit only their own posts |

---

## 🧪 Running Automated Tests

The backend includes comprehensive integration tests with Jest, Supertest, and an in-memory MongoDB server:

```bash
cd backend
npm test
```

### Test Coverage Highlights:
- **Authentication:** Registration, login, duplicate email handling, JWT issuance, token rotation.
- **RBAC & Ownership:** Prevents unauthorized users from editing or deleting others' posts; confirms admin override privileges.
- **Post & Slug Generation:** Automatic slug creation and word-count-based read time.
- **Comments Moderation:** Comment submission, post relationships, and admin approval workflows.

---

## 📡 API Endpoints Overview (`/api/v1`)

### Authentication & Users
- `POST /api/v1/users/register` — Register a new account
- `POST /api/v1/users/login` — Login and receive Access + Refresh tokens *(rate-limited)*
- `GET  /api/v1/users/me` — Get current authenticated user profile
- `POST /api/v1/users/refresh-token` — Refresh access token
- `POST /api/v1/users/social/google` — Google OAuth 2.0 login
- `POST /api/v1/users/social/facebook` — Facebook OAuth 2.0 login
- `GET  /api/v1/users` — List all users *(Admin only)*
- `PUT  /api/v1/users/:id` — Update user details or suspend account
- `DELETE /api/v1/users/:id` — Soft-delete user account *(Admin only)*

### Blog Posts
- `GET  /api/v1/blogs` — Public paginated blog post query
- `GET  /api/v1/blogs/:id` — Get single post by ID
- `GET  /api/v1/blogs/slug/:slug` — Get single post by URL slug
- `POST /api/v1/admin/blogs` — Create new post *(Authenticated)*
- `PUT  /api/v1/admin/blogs/:id` — Update post *(Owner or Admin)*
- `DELETE /api/v1/admin/blogs/:id` — Soft-delete post *(Owner or Admin)*
- `GET  /api/v1/admin/blogs/:id/revisions` — Retrieve post revision history
- `POST /api/v1/admin/blogs/:id/revisions/:revisionId/restore` — Restore a prior revision
- `POST /api/v1/blogs/:id/like` — Like a blog post

### Comments
- `GET  /api/v1/comments/post/:postId` — Get approved comments for a post
- `POST /api/v1/comments` — Submit a comment (supports nested replies)
- `GET  /api/v1/admin/comments` — List comments for moderation *(Admin only)*
- `PUT  /api/v1/admin/comments/:id/approve` — Approve comment *(Admin only)*
- `DELETE /api/v1/admin/comments/:id` — Delete comment *(Owner or Admin)*

### Dashboard & Analytics
- `GET /api/v1/dashboard/stats` — Total users, posts, comments, views, likes & timeline
- `GET /api/v1/dashboard/analytics/posts` — Post performance breakdown table
- `GET /api/v1/admin/analytics/realtime/stream` — SSE stream for active reader counter
# blog-mern
