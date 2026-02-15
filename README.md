# Sessions Marketplace

A full-stack web application for browsing and booking sessions, built with React (Vite) + Django REST Framework + PostgreSQL, fully containerized with Docker.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Axios, React Router
- **Backend**: Django 4.2, Django REST Framework, SimpleJWT
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker Compose, Nginx reverse proxy
- **Authentication**: Google & GitHub OAuth + JWT tokens

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Nginx (:80)                   │
│  /api/* → backend  │  /auth/* → backend         │
│  /*     → frontend │  /admin/* → backend        │
├──────────┬─────────┴────────┬───────────────────┤
│ Frontend │                  │    Backend         │
│ React    │                  │    Django/DRF      │
│ (:5173)  │                  │    (:8000)         │
├──────────┴──────────────────┴───────────────────┤
│               PostgreSQL (:5432)                │
└─────────────────────────────────────────────────┘
```

## Prerequisites
- Docker & Docker Compose

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repo-url> && cd ahoum
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your OAuth credentials (optional — mock login works without them).

3. **Start Everything**:
   ```bash
   docker-compose up --build
   ```
   This starts all 4 containers. Migrations run automatically.

4. **Access the app**:
   - **App**: http://localhost
   - **API**: http://localhost/api/
   - **Admin**: http://localhost/admin/

5. **Create a superuser** (optional, for Django admin):
   ```bash
   docker-compose exec backend python manage.py createsuperuser
   ```

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `http://localhost/auth/complete/google-oauth2/`
4. Copy Client ID and Secret into `.env`

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set callback URL: `http://localhost/auth/complete/github/`
4. Copy Client ID and Secret into `.env`

## Demo Flow

### 1. Login as Creator
1. Open http://localhost
2. Click **Login**
3. Click **Demo Login as Creator**
4. Go to **Dashboard** → Click **Create Session**
5. Fill in session details and submit

### 2. Login as User
1. Logout (or open incognito window)
2. Click **Login** → **Demo Login as User**
3. Browse sessions on the **Home** page
4. Click **View Details** on a session
5. Click **Book Now** to book
6. Go to **Dashboard** to see your booking

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions/` | List all sessions |
| POST | `/api/sessions/` | Create session (Creator only) |
| GET | `/api/sessions/:id/` | Session detail |
| GET | `/api/sessions/my_sessions/` | Creator's sessions |
| GET | `/api/bookings/` | List user's bookings |
| POST | `/api/bookings/` | Book a session |
| GET | `/api/auth/me/` | Current user profile |
| PATCH | `/api/auth/me/` | Update profile |
| POST | `/api/auth/mock-login/` | Dev mock login |
| POST | `/api/auth/login/` | JWT token obtain |
| POST | `/api/auth/refresh/` | JWT token refresh |

## Roles

| Role | Permissions |
|------|------------|
| **User** | Browse sessions, book sessions, view bookings, edit profile |
| **Creator** | All User permissions + create/manage sessions, view bookings on their sessions |
