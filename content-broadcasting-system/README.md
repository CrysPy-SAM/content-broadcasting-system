# 📡 Content Broadcasting System

A backend-only educational content broadcasting system where teachers upload subject-based content (images/materials), the principal approves them, and students access live content via a public API with subject-based scheduling and rotation.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | PostgreSQL |
| Auth | JWT + bcryptjs |
| File Uploads | Multer (local storage) |
| Security | Helmet, CORS, express-rate-limit |
| Environment | dotenv |

---

## 📁 Project Structure

```
content-broadcasting-system/
├── src/
│   ├── app.js                    # Express app entry
│   ├── config/
│   │   └── database.js           # PostgreSQL pool
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── content.controller.js
│   │   ├── approval.controller.js
│   │   └── broadcast.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── content.routes.js
│   │   ├── approval.routes.js
│   │   └── broadcast.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── content.service.js
│   │   ├── approval.service.js
│   │   └── scheduling.service.js  # Core rotation logic
│   ├── models/
│   │   ├── user.model.js
│   │   ├── content.model.js
│   │   └── schedule.model.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT + RBAC
│   │   ├── upload.middleware.js    # Multer
│   │   ├── validation.middleware.js
│   │   └── rateLimiter.middleware.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── response.js
│   │   ├── migrate.js             # DB migrations
│   │   └── seed.js               # Seed initial users
│   └── uploads/                  # Stored image files
├── architecture-notes.txt
├── package.json
├── .env.example
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone <repo-url>
cd content-broadcasting-system
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=content_broadcasting
DB_USER=postgres
DB_PASSWORD=yourpassword

JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=10485760
UPLOAD_PATH=./src/uploads
```

### 3. Create Database

```bash
psql -U postgres -c "CREATE DATABASE content_broadcasting;"
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Seed Initial Users

```bash
npm run seed
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| Principal | principal@school.com | principal123 |
| Teacher 1 | teacher1@school.com | teacher123 |
| Teacher 2 | teacher2@school.com | teacher123 |

### 6. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:3000
```

---

### 🔐 Auth Routes

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "teacher1@school.com",
  "password": "teacher123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": "uuid", "name": "Teacher One", "role": "teacher" }
  }
}
```

#### Get Profile
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### 📤 Content Routes (Teacher)

#### Upload Content
```http
POST /content/upload
Authorization: Bearer <teacher-token>
Content-Type: multipart/form-data

file: <image file>
title: "Chapter 5 - Algebra"
subject: "maths"
description: "Optional description"
start_time: "2024-01-15T09:00:00Z"
end_time: "2024-01-15T17:00:00Z"
rotation_duration: 5
```

> `start_time` and `end_time` must both be provided together.  
> Without them, content is uploaded but won't be shown in broadcast.  
> `rotation_duration` = how many minutes this content shows per rotation cycle.

#### View My Content
```http
GET /content/my
Authorization: Bearer <teacher-token>

# Optional filters:
GET /content/my?status=approved
GET /content/my?subject=maths
```

---

### 📋 Content Routes (Principal)

#### View All Content
```http
GET /content
Authorization: Bearer <principal-token>

# Filters:
GET /content?status=pending
GET /content?status=approved
GET /content?subject=science
GET /content?teacher_id=<uuid>
GET /content?page=1&limit=20
```

#### View Single Content
```http
GET /content/:id
Authorization: Bearer <token>
```

---

### ✅ Approval Routes (Principal Only)

#### View Pending Content
```http
GET /approval/pending
Authorization: Bearer <principal-token>
```

#### Approve Content
```http
PATCH /approval/:content_id
Authorization: Bearer <principal-token>
Content-Type: application/json

{
  "action": "approve"
}
```

#### Reject Content
```http
PATCH /approval/:content_id
Authorization: Bearer <principal-token>
Content-Type: application/json

{
  "action": "reject",
  "rejection_reason": "Content is not curriculum-aligned."
}
```

---

### 📡 Broadcast Routes (Public — No Auth Required)

#### Get Live Content for a Teacher
```http
GET /content/live/:teacher_id

# Optional: filter by subject
GET /content/live/:teacher_id?subject=maths
```

**Response (active content):**
```json
{
  "success": true,
  "message": "Live content fetched successfully",
  "data": {
    "teacher": { "id": "uuid", "name": "Teacher One" },
    "broadcast_time": "2024-01-15T10:07:32.000Z",
    "active_content": {
      "maths": {
        "id": "content-uuid",
        "title": "Chapter 5 - Algebra",
        "subject": "maths",
        "file_url": "/uploads/content-1705312052123.jpg",
        "file_type": "jpg",
        "rotation_order": 0,
        "duration_minutes": 5,
        "scheduled_until": "2024-01-15T10:10:00.000Z"
      }
    }
  }
}
```

**Response (no content):**
```json
{
  "success": true,
  "message": "No content available",
  "data": null
}
```

#### Get Schedule Preview
```http
GET /content/live/:teacher_id/schedule
```

---

## 🔄 Scheduling Logic

The rotation algorithm is time-based and deterministic:

1. All approved, time-window-active content per subject is fetched
2. Total cycle = sum of all content durations (in ms)
3. `position = unix_epoch_ms % total_cycle_ms`
4. Walk through items by cumulative duration → find active item
5. Loops continuously without any cron job

**Example:**
```
Subject: Maths
  Content A → 5 min
  Content B → 5 min  
  Content C → 5 min
  Total cycle: 15 min

  t=0-5min  → A is live
  t=5-10min → B is live
  t=10-15min→ C is live
  t=15min   → A again (loops)
```

Each subject rotates **independently**. Science and Maths have separate cycles.

---

## 🛡️ Edge Cases Handled

| Case | Behavior |
|------|----------|
| Teacher not found | Returns "No content available" |
| No approved content | Returns "No content available" |
| Approved but no time window set | Not shown (not scheduled) |
| Outside start/end time window | Not shown |
| Invalid subject filter | Returns empty (not error) |
| File type not allowed | 400 error with details |
| File too large | 400 error |
| Token expired | 401 with message |
| Wrong role accessing route | 403 Forbidden |
| Double approval | 400 - already approved |
| Reject without reason | 400 validation error |

---

## 🔒 Security

- All private routes protected with JWT
- Password hashed with bcrypt (10 salt rounds)
- Rate limiting on all routes
- Stricter limits on auth routes (brute force protection)
- Helmet.js for HTTP security headers
- CORS configured
- No sensitive data in responses (password_hash never returned)
- File type and size validation before saving

---

## 📊 Assumptions & Notes

- **Subjects** are stored as lowercase strings (no enum constraint — flexible for any subject name)
- **Without start_time/end_time**: content is uploaded but will never appear in broadcast (by design per assignment spec)
- **rotation_duration** defaults to 5 minutes if not provided
- **Uploaded files** are served statically at `/uploads/<filename>`
- **Teacher ID** in the broadcast URL is the UUID from the users table
- The seed script creates users; in production, a separate admin registration flow would be needed

---

## 🚀 Optional Bonus Features (Implemented)

- ✅ Rate Limiting (express-rate-limit on all routes)
- ✅ Pagination & Filters (status, subject, teacher_id, page, limit)
- 🔲 Redis Caching (architecture documented, implementation optional)
- 🔲 S3 Upload (documented in architecture-notes.txt)
