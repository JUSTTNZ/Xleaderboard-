# Frontend-Backend Integration Guide

RankX is fully integrated with a TypeScript Express backend and MongoDB database. Follow this guide to set up and run both servers.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│         Frontend (React + TypeScript)               │
│         Port: 5173 (Vite dev server)                │
│         Base: http://localhost:5173                 │
│                                                     │
│  - Pages: Landing, Categories, Leaderboard, etc.   │
│  - Auth: Supabase OAuth (Twitter)                   │
│  - API: Axios (calls backend at :5000)              │
│                                                     │
└─────────────────┬───────────────────────────────────┘
                  │
         HTTP Requests (CORS enabled)
                  │
┌─────────────────▼───────────────────────────────────┐
│                                                     │
│    Backend (Express + TypeScript)                   │
│    Port: 5000                                       │
│    Base: http://localhost:5000/api                  │
│                                                     │
│  - Auth: Supabase user verification                 │
│  - Database: MongoDB (local or remote)              │
│  - Routes: /auth, /categories, /votes, etc.         │
│  - Middleware: CORS, JWT auth, error handling       │
│                                                     │
└─────────────────┬───────────────────────────────────┘
                  │
              Database
                  │
         ┌────────▼────────┐
         │                 │
         │    MongoDB      │
         │   rankx_db      │
         │                 │
         └─────────────────┘
```

## Prerequisites

### System Requirements
- Node.js 18+ with npm
- MongoDB (local or Atlas)
- Git

### Environment Variables

Both frontend and backend need proper environment configuration.

#### Frontend (.env)
```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_API_URL=http://localhost:5000/api
```

**Location:** `rankx/frontend/.env`

#### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rankx
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/rankx

SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_KEY=<your-supabase-service-key>

FRONTEND_URL=http://localhost:5173
```

**Location:** `rankx/backend/.env`

## Setup Instructions

### 1. Install Dependencies

```bash
# Install backend dependencies
cd rankx/backend
npm install

# Install frontend dependencies (in another terminal)
cd rankx/frontend
npm install
```

### 2. Verify MongoDB Connection

**Option A: Local MongoDB**
```bash
# Ensure MongoDB is running
mongod

# Verify connection
mongo rankx
```

**Option B: MongoDB Atlas (Cloud)**
1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Get connection string
3. Set `MONGODB_URI` in backend `.env`

### 3. Configure Supabase

1. Go to https://supabase.com
2. Create project or use existing
3. Enable Twitter OAuth provider in Authentication settings
4. Set redirect URL to: `http://localhost:5173/auth/callback`
5. Copy keys into both frontend and backend `.env` files

### 4. Seed Initial Data (Optional)

```bash
cd rankx/backend
npm run seed
```

This creates sample categories for testing.

## Running the Application

### Terminal 1: Start Backend Server

```bash
cd rankx/backend
npm run dev
```

Expected output:
```
> backend@1.0.0 dev
> tsx watch src/server.ts

RankX API running on port 5000
```

### Terminal 2: Start Frontend Dev Server

```bash
cd rankx/frontend
npm run dev
```

Expected output:
```
> frontend@0.0.0 dev
> vite

  VITE v7.3.1  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Terminal 3: (Optional) Test API Endpoints

```bash
# Health check
curl http://localhost:5000/health

# Get all categories
curl http://localhost:5000/api/categories

# Get specific category
curl http://localhost:5000/api/categories/developers
```

## API Endpoints

### Authentication
- `POST /api/auth/callback` - Handle OAuth callback
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - List all categories
- `GET /api/categories/:slug` - Get category details with leaderboard
- `POST /api/categories/:slug/apply` - Apply to join category

### Voting
- `POST /api/votes` - Cast/change/remove vote
  ```json
  {
    "category_id": "...",
    "voted_for_id": "..."
  }
  ```

### Dashboard
- `GET /api/dashboard` - Get user dashboard data (auth required)

### Profile
- `GET /api/profile/:handle` - Get user profile

## Testing the Integration

### 1. Test Homepage Load
```bash
curl http://localhost:5173
# Should load HTML with React app
```

### 2. Test Category Listing
```bash
curl http://localhost:5000/api/categories
# Should return: { "success": true, "categories": [...] }
```

### 3. Test Authentication Flow
1. Go to http://localhost:5173
2. Click "Connect with X"
3. Should redirect to Supabase OAuth
4. Should return to the app authenticated
5. Dashboard should load with user data

### 4. Test Voting (Authenticated)
```bash
# Get a category first
curl http://localhost:5000/api/categories | jq '.categories[0]._id'

# Cast a vote (replace with real token)
curl -X POST http://localhost:5000/api/votes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"category_id":"...", "voted_for_id":"..."}'
```

## Troubleshooting

### CORS Errors
**Problem:** "Access to XMLHttpRequest has been blocked by CORS policy"

**Solution:**
1. Check backend is running on port 5000
2. Verify `FRONTEND_URL` in backend `.env` is `http://localhost:5173`
3. Check CORS configuration in `src/server.ts`

### MongoDB Connection Failed
**Problem:** "MongoNetworkError" or "connection refused"

**Solution:**
1. Verify MongoDB is running: `mongod` or check Atlas status
2. Check `MONGODB_URI` in `.env` is correct
3. Test with: `mongo "mongodb://localhost:27017/rankx"`

### API Returning 401
**Problem:** "Invalid token" or "No token"

**Solution:**
1. Ensure user is logged in via Supabase
2. Check token is stored in localStorage
3. Verify Supabase keys in `.env`
4. Clear browser storage and re-login

### Port Already in Use
**Problem:** "EADDRINUSE :::5000" or :::5173

**Solution:**
```bash
# Find process using port (Windows)
netstat -tulpn | grep :5000

# Kill process
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

### Changes Not Reflecting

**Frontend:**
- Clear browser cache (Ctrl+Shift+Delete)
- Hard reload (Ctrl+Shift+R)

**Backend:**
- Restart server (Ctrl+C, then npm run dev)
- Check logs for errors

## Development Workflow

### Making Backend Changes
1. Edit files in `rankx/backend/src/`
2. Server auto-restarts via tsx watch
3. Test with curl or Postman
4. Frontend will auto-reload when calling updated endpoints

### Making Frontend Changes
1. Edit files in `rankx/frontend/src/`
2. Browser auto-reloads via Vite HMR
3. Check console for errors
4. Network tab to verify API calls

### Database Changes
1. Modify models in `rankx/backend/src/models/`
2. Create data seed script if needed
3. Run seed: `npm run seed`
4. Restart backend server

## Production Deployment

### Frontend (Vercel/Netlify)
```bash
# Build
npm run build

# Output: dist/ folder ready to deploy
```

### Backend (Heroku/Railway)
```bash
# Set environment variables
PORT=5000
MONGODB_URI=<production-mongodb>
FRONTEND_URL=<production-frontend-url>

# Deploy
git push heroku main
```

### Environment Variables for Production
- Update `FRONTEND_URL` to production domain
- Use production MongoDB (Atlas)
- Update Supabase redirect URLs
- Set secure Supabase keys (service key should be server-only)

## Key Features Integrated

✅ **Authentication** - Supabase OAuth with Twitter
✅ **Categories** - Browse and filter categories
✅ **Voting** - Vote for creators with ranking calculation
✅ **Dashboard** - User statistics and activity
✅ **Profiles** - Public user profiles with rankings
✅ **Responsive Design** - SubWise monochrome styling
✅ **Error Handling** - CORS, auth, validation errors
✅ **Data Validation** - TypeScript types on both ends
✅ **Auto-refresh Tokens** - Supabase handles token management

## API Response Examples

### GET /api/categories
```json
{
  "success": true,
  "categories": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Developers",
      "slug": "developers",
      "description": "Best software developers",
      "icon": "Code",
      "member_count": 45,
      "total_votes": 1230,
      "is_active": true,
      "top_members": [
        {
          "handle": "username",
          "display_name": "User Name",
          "avatar_url": "https://..."
        }
      ]
    }
  ]
}
```

### GET /api/dashboard
```json
{
  "stats": {
    "total_votes": 85,
    "categories_count": 3,
    "highest_rank": 5,
    "votes_cast": 12
  },
  "rankings": [
    {
      "category": {
        "name": "Developers",
        "slug": "developers",
        "icon": "Code"
      },
      "rank": 5,
      "vote_count": 28,
      "rank_change": 2
    }
  ],
  "votes": [...],
  "pending_applications": [...]
}
```

## Performance Tips

1. **Database Indexing** - MongoDB indexes are set on slug, user, category
2. **Vote Caching** - Rankings are recalculated server-side
3. **Image Optimization** - Use Twitter avatars directly (cached by Twitter CDN)
4. **Frontend Bundle** - Already optimized with Vite code splitting

## Security Notes

- ✅ CORS properly configured
- ✅ Auth tokens stored securely (localStorage)
- ✅ API requires Bearer token for protected routes
- ✅ MongoDB is not accessible from frontend
- ✅ Supabase service key kept server-side only
- ⚠️  Before production: Add rate limiting, HTTPS enforcement, environment secrets management

## Support & Debugging

### Enable Verbose Logging
```bash
# Backend
DEBUG=* npm run dev

# Frontend
# Check browser DevTools → Console tab
```

### Common Command Reference
```bash
# Backend
npm run dev          # Start dev server
npm run typecheck    # Check TypeScript
npm run seed        # Seed database

# Frontend
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview build
```

---

**Status:** ✅ Fully Integrated and Ready for Development

**Last Updated:** February 20, 2026
