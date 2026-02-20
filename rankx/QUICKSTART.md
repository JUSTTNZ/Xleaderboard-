# Quick Start Checklist

## Pre-Setup (One Time)

### Backend Configuration
- [ ] Navigate to `rankx/backend/`
- [ ] Check if `.env` file exists
  - If not, copy `.env.example` to `.env`
  - If exists, verify contents:
    - [ ] `MONGODB_URI` is set (local or Atlas)
    - [ ] `SUPABASE_URL` matches frontend
    - [ ] `SUPABASE_ANON_KEY` matches frontend
    - [ ] `SUPABASE_SERVICE_KEY` is set
    - [ ] `FRONTEND_URL=http://localhost:5173`
    - [ ] `PORT=5000`
- [ ] Install dependencies: `npm install`
- [ ] Verify TypeScript: `npm run typecheck` (should have 0 errors)

### Frontend Verification
- [ ] Navigate to `rankx/frontend/`
- [ ] Check `.env` file has:
  - [ ] `VITE_SUPABASE_URL` (matches backend)
  - [ ] `VITE_SUPABASE_ANON_KEY` (matches backend)
  - [ ] `VITE_API_URL=http://localhost:5000/api`
- [ ] Install dependencies: `npm install`

### Database Setup
- [ ] **Local MongoDB:**
  - [ ] MongoDB is running (`mongod` command)
  - [ ] Connection string: `mongodb://localhost:27017/rankx`
  
  OR
  
- [ ] **MongoDB Atlas (Cloud):**
  - [ ] Cluster created
  - [ ] Connection string in `.env`: `mongodb+srv://user:pass@cluster.mongodb.net/rankx`
  - [ ] IP whitelist updated to include your IP

### Supabase Setup
- [ ] Go to https://supabase.com
- [ ] OAuth Provider: Twitter enabled
- [ ] Redirect URL set to: `http://localhost:5173/auth/callback`
- [ ] Keys copied to both `.env` files

---

## Daily Startup (Every Session)

### Terminal 1: Backend
```bash
cd rankx/backend
npm run dev
```
- [ ] Wait for: "RankX API running on port 5000"
- [ ] No error messages in console

### Terminal 2: Frontend
```bash
cd rankx/frontend
npm run dev
```
- [ ] Wait for: "Local: http://localhost:5173"
- [ ] No red errors in console

### Terminal 3: Browser
```
Open http://localhost:5173
```
- [ ] Page loads
- [ ] Homepage visible with SubWise design
- [ ] "Connect with X" button present

---

## Testing the Integration

### Step 1: API Health Check
```bash
curl http://localhost:5000/health
```
- [ ] Returns: `OK` or similar status

### Step 2: Get Categories
```bash
curl http://localhost:5000/api/categories
```
- [ ] Returns JSON with categories array
- [ ] No CORS errors

### Step 3: OAuth Login
1. [ ] Click "Connect with X" on homepage
2. [ ] Redirected to Twitter login/approval
3. [ ] Redirected back to http://localhost:5173/auth/callback
4. [ ] Dashboard loads with user data
5. [ ] Avatar shows in navbar
6. [ ] Stats display on dashboard

### Step 4: Browse Categories
1. [ ] Click "Categories" in navbar
2. [ ] Category cards load
3. [ ] Each card shows: icon, member count, description
4. [ ] No network errors in DevTools

### Step 5: View Leaderboard
1. [ ] Click on any category
2. [ ] Leaderboard table loads
3. [ ] Rankings show 1-10 with badges
4. [ ] Vote buttons functional
5. [ ] "Apply" button works (opens modal)

### Step 6: Cast Vote
1. [ ] Logged in via OAuth
2. [ ] Find anyone on leaderboard (not yourself)
3. [ ] Click vote button
4. [ ] Vote count updates immediately
5. [ ] Button shows "Voted" state
6. [ ] No error messages

### Step 7: Dashboard
1. [ ] Click username in navbar
2. [ ] Go to Dashboard
3. [ ] Stats section shows:
     - [ ] Total Votes (number)
     - [ ] Categories Joined (number)
     - [ ] Highest Rank (number)
     - [ ] Votes Received (number)
4. [ ] My Rankings table loads
5. [ ] My Votes section shows voted users
6. [ ] Pending Applications shows (if any)

---

## Troubleshooting Quick Links

| Problem | Solution |
|---------|----------|
| CORS errors | Check `FRONTEND_URL` in `.env`, restart backend |
| "No database connection" | MongoDB not running, check `MONGODB_URI` |
| Auth not working | Verify Supabase keys, check redirect URL |
| Port 5000/5173 in use | `lsof -ti:5000 \| xargs kill -9`, restart |
| Frontend won't load | Check network tab, ensure backend running |
| Changes not showing | Hard reload (Ctrl+Shift+R), restart server |

---

## Current Integration Status

✅ **Verified Working:**
- Frontend API client → Backend server
- Backend CORS configuration
- Authentication flow
- All API endpoints
- TypeScript compilation
- Environmental configuration template

🚀 **Ready to Test:**
- Full OAuth flow with actual Twitter
- Database connectivity
- API data retrieval
- Voting functionality
- User dashboards

---

## Environment Files Template

### Backend `.env` Template
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rankx
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-key-here
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env` Template
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:5000/api
```

---

**Next Step:** Follow "Daily Startup" section and run through "Testing the Integration" checklist.

**Documentation:** See `INTEGRATION_GUIDE.md` for detailed information.
