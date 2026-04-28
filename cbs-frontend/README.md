# 📡 The Broadcast — Frontend

A React + Vite frontend for the **Content Broadcasting System** backend. Editorial / academic aesthetic — built to pair with the Express backend in `content-broadcasting-system/`.

---

## 🛠 Stack

| Layer | Tech |
|-------|------|
| Build | Vite |
| Framework | React 18 |
| Routing | react-router-dom v6 |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| HTTP | Axios |
| Toasts | react-hot-toast |
| Icons | lucide-react |
| Fonts | Fraunces (display), IBM Plex Sans, JetBrains Mono |

---

## 🚀 Quickstart

### 1. Install
```bash
cd cbs-frontend
npm install
```

### 2. Make sure the backend is running
The frontend dev server proxies these paths to `http://localhost:3000`:
- `/auth/*`
- `/content/*`
- `/approval/*`
- `/uploads/*`
- `/health`

So just run the backend on port 3000 (per its README) and you're good.

### 3. Run the frontend
```bash
npm run dev
```
Open <http://localhost:5173>.

### 4. Sign in (demo accounts from backend seed)
| Role | Email | Password |
|------|-------|----------|
| Principal | `principal@school.com` | `principal123` |
| Teacher 1 | `teacher1@school.com` | `teacher123` |
| Teacher 2 | `teacher2@school.com` | `teacher123` |

The login page has one-click fill buttons for these.

---

## 🗺 Routes

| Path | Who | What |
|------|-----|------|
| `/` | Public | Landing page · enter teacher UUID to view live stream |
| `/live/:teacherId` | Public | Live broadcast viewer · auto-polls every 30s |
| `/login` | Public | Sign-in for staff |
| `/teacher` | Teacher | "My broadcasts" — list of own uploaded content |
| `/teacher/upload` | Teacher | Upload form with file dropzone, scheduling, rotation duration |
| `/principal` | Principal | Full library across all teachers, with filters & pagination |
| `/principal/approvals` | Principal | Pending queue · approve / reject with reason |

The router auto-redirects:
- Signed-out users on `/` → public landing
- Signed-in teachers on `/` → `/teacher`
- Signed-in principals on `/` → `/principal`
- Wrong-role access → bounces to your role's home
- 401 from API → clears storage, sends to `/login`

---

## 📂 Structure

```
cbs-frontend/
├── index.html
├── package.json
├── vite.config.js          # Proxies /auth, /content, /approval, /uploads to :3000
├── tailwind.config.js      # Custom palette (parchment / ink / sienna / forest)
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # Entry · BrowserRouter + AuthProvider + Toaster
    ├── App.jsx             # All routes + role guards
    ├── index.css           # Tailwind + base styles + paper grain
    ├── api/
    │   └── client.js       # Axios instance + JWT interceptor + asset resolver
    ├── context/
    │   └── AuthContext.jsx # login/logout/user state, hydrates from localStorage
    ├── components/
    │   ├── Navbar.jsx
    │   ├── ProtectedRoute.jsx
    │   ├── ContentCard.jsx
    │   ├── StatusBadge.jsx
    │   └── EmptyState.jsx
    ├── lib/
    │   └── format.js       # Date / time / countdown helpers
    └── pages/
        ├── Login.jsx
        ├── teacher/
        │   ├── Dashboard.jsx
        │   └── Upload.jsx
        ├── principal/
        │   ├── Dashboard.jsx
        │   └── Approvals.jsx
        └── public/
            ├── BroadcastEntry.jsx
            └── LiveBroadcast.jsx
```

---

## 🎨 Design notes

- **Aesthetic:** editorial / academic — warm parchment background, deep ink text, burnt-sienna accent, with a paper grain overlay. The live broadcast page flips to dark to feel like a kiosk display.
- **Type:** Fraunces for display (variable, expressive serif), IBM Plex Sans for body, JetBrains Mono for technical / metadata.
- **No rounded corners** anywhere — square edges throughout, hairline borders. Differentiates from generic SaaS dashboards.
- **Motion:** restrained — staggered page-load fade-ups, image cross-fade on broadcast rotation, sienna underline indicators on nav.

---

## 🔧 Backend contract (what this expects)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/auth/login` | `{email, password}` → `{token, user}` |
| `GET` | `/auth/me` | Verify session |
| `POST` | `/content/upload` | multipart: `file, title, subject, description?, start_time?, end_time?, rotation_duration?` |
| `GET` | `/content/my?status=&subject=` | Teacher's own content |
| `GET` | `/content?status=&subject=&teacher_id=&page=&limit=` | Principal: all content |
| `GET` | `/content/:id` | Single content |
| `GET` | `/approval/pending` | Principal: pending queue |
| `PATCH` | `/approval/:id` | `{action: 'approve'}` or `{action: 'reject', rejection_reason}` |
| `GET` | `/content/live/:teacher_id?subject=` | Public live feed |
| `GET` | `/content/live/:teacher_id/schedule` | Public schedule preview |
| `GET` | `/uploads/:filename` | Static file serving |

All authenticated routes expect `Authorization: Bearer <token>`. The frontend handles this automatically via the axios interceptor.

---

## 🏗 Production build

```bash
npm run build      # Outputs to dist/
npm run preview    # Local preview of the prod build
```

For a real deployment, set `VITE_API_URL` in `.env` to your backend's origin so the built bundle hits the right host.

```env
VITE_API_URL=https://api.yourschool.com
```
