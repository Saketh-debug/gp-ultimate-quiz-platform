# JWT Authentication Implementation Plan
## GP Ultimate Quiz Platform - Security Upgrade

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Preparation & Dependencies](#phase-1-preparation--dependencies)
3. [Phase 2: Database Schema Changes](#phase-2-database-schema-changes)
4. [Phase 3: Server-Side Authentication Middleware](#phase-3-server-side-authentication-middleware)
5. [Phase 4: Update Auth Routes](#phase-4-update-auth-routes)
6. [Phase 5: Protect All API Routes](#phase-5-protect-all-api-routes)
7. [Phase 6: Socket.IO Authentication](#phase-6-socketio-authentication)
8. [Phase 7: Admin Authentication](#phase-7-admin-authentication)
9. [Phase 8: Client-Side Changes](#phase-8-client-side-changes)
10. [Phase 9: Testing & Migration](#phase-9-testing--migration)
11. [Security Best Practices](#security-best-practices)

---

## Overview

This plan outlines the complete migration from the current plain-text token system to a secure JWT-based authentication system across the entire GP Ultimate Quiz Platform.

### Current Architecture Issues

- **Plain text tokens** stored in database (`users.token`, `admins.token`)
- **No token expiration** - tokens never expire
- **No cryptographic signing** - tokens can be forged
- **No request validation middleware** - each route manually checks tokens
- **Socket.IO unprotected** - anyone can connect and emit events
- **Admin tokens in query params** - exposed in logs and browser history

### Target Architecture

- **JWT tokens** with cryptographic signatures (HMAC-SHA256)
- **Short-lived access tokens** (15-30 minutes) with optional refresh tokens
- **Centralized auth middleware** protecting all routes
- **Socket.IO authentication** via token in handshake
- **Role-based access** (user, admin) embedded in JWT payload
- **Secure token transmission** via Authorization header

---

## Phase 1: Preparation & Dependencies

### 1.1 Install Required Packages

**Location:** `/server/package.json`

**Action:** Add the following dependencies:

```json
{
  "jsonwebtoken": "^9.x.x",
  "bcryptjs": "^2.x.x"
}
```

**Run:** `npm install` in the `/server` directory

### 1.2 Environment Variables

**Location:** `/server/.env`

**Action:** Add the following environment variables:

```
# JWT Configuration
JWT_SECRET=your_super_secret_key_min_32_characters
JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d

# Server Configuration
PORT=3000
NODE_ENV=production
```

**Important:** 
- Generate a strong, random secret (minimum 32 characters)
- Never commit `.env` to version control
- Use different secrets for development and production

### 1.3 Create Utility Files

**Location:** `/server/utils/` (create this directory)

**Files to create:**

1. `/server/utils/generateToken.js` - Function to generate JWT tokens
2. `/server/utils/verifyToken.js` - Function to verify JWT tokens
3. `/server/utils/hashPassword.js` - Functions for password hashing (if implementing passwords later)

---

## Phase 2: Database Schema Changes

### 2.1 Users Table

**Location:** Database migration script (create `/server/scripts/migrate_to_jwt.sql`)

**Current Schema:**
```sql
users (
  id,
  username,
  team_name,
  college,
  token,  -- Plain text token
  rapidfire_score,
  cascade_score,
  dsa_score
)
```

**New Schema:**
```sql
users (
  id,
  username,
  team_name,
  college,
  password_hash,      -- NEW: For future password login (optional)
  refresh_token,      -- NEW: For token refresh flow (optional)
  rapidfire_score,
  cascade_score,
  dsa_score,
  created_at,         -- NEW: Track account creation
  updated_at          -- NEW: Track last update
)
```

**Migration Actions:**

1. Add new columns (`password_hash`, `refresh_token`, `created_at`, `updated_at`)
2. Keep existing `token` column temporarily for backward compatibility during migration
3. Create index on `username` for faster lookups

### 2.2 Admins Table

**Current Schema:**
```sql
admins (
  id,
  username,
  password,  -- Plain text!
  token      -- Plain text!
)
```

**New Schema:**
```sql
admins (
  id,
  username,
  password_hash,  -- NEW: Hashed password
  refresh_token,  -- NEW: For token refresh
  role,           -- NEW: 'super_admin' or 'admin'
  created_at,
  updated_at
)
```

**Migration Actions:**

1. Hash all existing plain-text passwords
2. Add `role` column with default 'admin'
3. Remove plain `password` and `token` columns after migration

### 2.3 Create Refresh Tokens Table (Optional - for production)

**Location:** `/server/scripts/create_refresh_tokens_table.sql`

```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
```

---

## Phase 3: Server-Side Authentication Middleware

### 3.1 Create Auth Middleware

**Location:** `/server/middleware/authMiddleware.js` (create this directory and file)

**Purpose:** Centralized JWT verification for all protected routes

**Implementation Details:**

1. **Function:** `authenticateToken(req, res, next)`
   - Extract JWT from `Authorization: Bearer <token>` header
   - Verify token using `jsonwebtoken.verify()`
   - Attach decoded user data to `req.user`
   - Call `next()` if valid, return 401/403 if invalid

2. **Function:** `authorizeRole(...allowedRoles)`
   - Higher-order function that checks `req.user.role`
   - Returns middleware that blocks unauthorized roles
   - Use for admin-only routes

3. **Error Handling:**
   - Token missing → 401 "Access token required"
   - Token invalid → 401 "Invalid token"
   - Token expired → 401 "Token expired"
   - Insufficient role → 403 "Insufficient permissions"

### 3.2 Create Socket Authentication Middleware

**Location:** `/server/middleware/socketAuthMiddleware.js` (create this file)

**Purpose:** Authenticate Socket.IO connections

**Implementation Details:**

1. Extract token from socket handshake `auth.token`
2. Verify JWT before allowing connection
3. Attach user data to `socket.user`
4. Disconnect socket if authentication fails
5. Log all connection attempts for security auditing

### 3.3 Create Token Utility Functions

**Location:** `/server/utils/tokenUtils.js`

**Functions:**

1. `generateAccessToken(payload)` - Generate short-lived access token
   - Payload: `{ userId, username, role, teamName }`
   - Expires: 30 minutes

2. `generateRefreshToken(payload)` - Generate long-lived refresh token
   - Payload: `{ userId }`
   - Expires: 7 days

3. `verifyToken(token)` - Verify and decode any JWT
   - Returns decoded payload or throws error

4. `invalidateRefreshToken(userId, tokenId)` - Revoke refresh token
   - For logout functionality

---

## Phase 4: Update Auth Routes

### 4.1 Replace `/auth/join` with Proper Login

**Location:** `/server/routes/auth.js`

**Current Behavior:**
- Accepts plain `token` in request body
- Looks up user by plain text token
- Returns user data without any authentication

**New Behavior:**

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "username": "user123",
  "password": "securePassword123"
}
```

**OR (for token-based access code system):**

**Endpoint:** `POST /auth/access-code`

**Request Body:**
```json
{
  "accessCode": "PREGENERATED_CODE_123"
}
```

**Response (for both):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "user123",
    "teamName": "Team Alpha",
    "college": "MIT"
  }
}
```

**Implementation Steps:**

1. Remove old `/auth/join` endpoint
2. Create new login endpoint that:
   - Validates credentials/access code
   - Generates JWT access token
   - Generates JWT refresh token (optional)
   - Stores refresh token in database (if using)
   - Returns tokens and user data

### 4.2 Create Token Refresh Endpoint

**Location:** `/server/routes/auth.js`

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Implementation:**

1. Verify refresh token is valid and not expired
2. Check token hasn't been revoked in database
3. Generate new access token
4. Optionally rotate refresh token
5. Return new tokens

### 4.3 Create Logout Endpoint

**Location:** `/server/routes/auth.js`

**Endpoint:** `POST /auth/logout`

**Request:** Include access token in Authorization header

**Implementation:**

1. Extract user ID from token
2. Revoke refresh token in database
3. Clear any server-side session data
4. Return success response

---

## Phase 5: Protect All API Routes

### 5.1 Apply Auth Middleware to Route Files

**Locations:**

| File | Protection Level | Changes Required |
|------|-----------------|------------------|
| `/server/routes/auth.js` | Partial (login public) | Add middleware to all except login/refresh |
| `/server/routes/question.js` | Protected | Add `authenticateToken` to all routes |
| `/server/routes/rapidfire.js` | Protected | Add `authenticateToken` to all routes |
| `/server/routes/cascade.js` | Protected | Add `authenticateToken` to all routes |
| `/server/routes/dsa.js` | Protected | Add `authenticateToken` to all routes |
| `/server/routes/admin.js` | Admin Only | Add `authenticateToken` + `authorizeRole('admin')` |

### 5.2 Update Route Implementation Pattern

**Current Pattern (rapidfire.js example):**
```javascript
router.post("/join", async (req, res) => {
    const { token } = req.body;
    const userRes = await pool.query("SELECT * FROM users WHERE token = $1", [token]);
    // ... rest of logic
});
```

**New Pattern:**
```javascript
router.post("/join", authenticateToken, async (req, res) => {
    const userId = req.user.userId;  // From JWT payload
    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    // ... rest of logic
});
```

### 5.3 Specific Route Changes

#### `/server/routes/rapidfire.js`

**Routes to update:**
- `POST /join` - Remove token lookup, use `req.user.userId`
- `POST /start-question` - Validate user owns the session
- `POST /time-check` - Validate user owns the session
- `POST /submit-result` - Validate user owns the session

**Additional Security:**
- Add validation that user can only access their own sessions
- Prevent users from submitting for other users' questions

#### `/server/routes/cascade.js`

**Routes to update:**
- `POST /join` - Remove token lookup, use `req.user.userId`
- `POST /submit-result` - Validate user owns the session
- `POST /skip` - Validate user owns the session
- `POST /go-back` - Validate user owns the session
- `POST /return-forward` - Validate user owns the session
- `POST /time-check` - Validate user owns the session
- `POST /update-viewing-index` - Validate user owns the session

#### `/server/routes/dsa.js`

**Routes to update:**
- `POST /join` - Remove token lookup, use `req.user.userId`
- `POST /submit-result` - Validate user owns the session

#### `/server/routes/question.js`

**Action:** Read this file first to understand current implementation, then apply `authenticateToken` middleware to all routes.

#### `/server/index.js` (Main Server File)

**Routes to update:**
- `POST /start-contest` - Should be admin-only, add `authorizeRole('admin')`
- Health check `GET /` - Can remain public

### 5.4 Error Response Standardization

**Create:** `/server/utils/errorResponses.js`

**Standard error format:**
```javascript
{
  success: false,
  error: {
    code: "TOKEN_EXPIRED",
    message: "Your session has expired. Please login again."
  }
}
```

**Error codes:**
- `TOKEN_MISSING` - No token provided
- `TOKEN_INVALID` - Token failed verification
- `TOKEN_EXPIRED` - Token has expired
- `INSUFFICIENT_PERMISSIONS` - User lacks required role
- `SESSION_NOT_FOUND` - User session doesn't exist
- `CONTEST_NOT_STARTED` - Contest hasn't started yet
- `CONTEST_ENDED` - Contest has ended

---

## Phase 6: Socket.IO Authentication

### 6.1 Update Socket.IO Connection Handler

**Location:** `/server/index.js`

**Current Code:**
```javascript
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("register", async ({ userId }) => {
    // No authentication! Anyone can register as any user
  });
});
```

**New Code:**
```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = verifyToken(token);
    socket.user = decoded;  // Attach user to socket
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.user.username} (${socket.id})`);

  socket.on("register", async () => {
    // User already authenticated via middleware
    const userId = socket.user.userId;
    // ... rest of logic
  });
});
```

### 6.2 Update Socket Event Security

**Current Vulnerability:**
- Anyone can emit `register` with any `userId`
- Anyone can receive broadcasts meant for specific users

**Fixes:**

1. **Remove userId from register event** - User ID comes from authenticated socket
2. **Validate socket ownership** - Ensure user can only update their own sessions
3. **Add logging** - Log all socket events for security auditing

### 6.3 Handle Force Logout via Socket

**Location:** `/server/index.js`

**Current Code:**
```javascript
socket.on("register", async ({ userId }) => {
  const s = await pool.query(
    "SELECT socket_id FROM user_sessions WHERE user_id = $1 AND end_time > NOW()",
    [userId]
  );

  if (s.rows.length > 0 && s.rows[0].socket_id) {
    io.to(s.rows[0].socket_id).emit("force_logout");
  }
  // ...
});
```

**Updated Code:**
```javascript
socket.on("register", async () => {
  const userId = socket.user.userId;  // From authenticated socket
  
  const s = await pool.query(
    "SELECT socket_id FROM user_sessions WHERE user_id = $1 AND end_time > NOW()",
    [userId]
  );

  if (s.rows.length > 0 && s.rows[0].socket_id) {
    io.to(s.rows[0].socket_id).emit("force_logout");
  }
  // ...
});
```

---

## Phase 7: Admin Authentication

### 7.1 Update Admin Login

**Location:** `/server/routes/admin.js`

**Current Endpoint:** `POST /admin/login`

**Current Behavior:**
- Accepts plain text username and password
- Returns plain text token

**New Behavior:**

**Request:**
```json
{
  "username": "admin",
  "password": "adminPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "super_admin"
  }
}
```

### 7.2 Protect All Admin Routes

**Location:** `/server/routes/admin.js`

**Routes to protect:**
- `POST /start-round` - Admin only
- `POST /stop-round` - Admin only
- `POST /reset-round` - Admin only
- `GET /status/:roundName` - Can remain public (read-only)
- `GET /leaderboard` - Can remain public (read-only)
- `POST /apply-streak-bonus` - Admin only
- `GET /questions/:round` - Admin only
- `GET /questions/:id/testcases` - Admin only
- `POST /questions` - Admin only
- `PUT /questions/:id` - Admin only
- `DELETE /questions/:id` - Admin only

**Implementation:**
```javascript
router.post("/start-round", authenticateToken, authorizeRole('admin'), async (req, res) => {
  // req.user.adminId and req.user.role available
  // ...
});
```

### 7.3 Remove Token Query Parameter Pattern

**Current Pattern (vulnerable):**
```javascript
const { roundName, token } = req.body;
const adminCheck = await pool.query("SELECT * FROM admins WHERE token = $1", [token]);
if (adminCheck.rows.length === 0) {
  return res.status(403).json({ error: "Unauthorized" });
}
```

**New Pattern:**
```javascript
// Token verified by middleware, admin role checked by authorizeRole
// Just use req.user.adminId directly
const adminId = req.user.adminId;
```

---

## Phase 8: Client-Side Changes

### 8.1 Update API Utility/Helper

**Location:** `/client/src/utils/` (create if doesn't exist)

**Create:** `/client/src/utils/api.js`

**Purpose:** Centralized API calls with automatic token handling

**Implementation:**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Get stored tokens
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function getRefreshToken() {
  return localStorage.getItem('refreshToken');
}

// Store tokens
function setTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

// Clear tokens
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// API call helper with automatic token refresh
async function apiCall(endpoint, options = {}) {
  let accessToken = getAccessToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      ...options.headers,
    },
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // If token expired, try to refresh
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      accessToken = getAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    }
  }

  return response;
}

// Refresh access token
async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      setTokens(data.accessToken, data.refreshToken);
      return true;
    }
  } catch (err) {
    console.error('Token refresh failed:', err);
  }

  clearTokens();
  return false;
}

export { apiCall, setTokens, clearTokens, getAccessToken };
```

### 8.2 Update Login Page

**Location:** `/client/src/pages/Login.jsx`

**Current Behavior:**
- Sends plain token to `/auth/join`
- No token storage

**New Behavior:**
- Send username/password or access code to `/auth/login` or `/auth/access-code`
- Store returned tokens in localStorage
- Redirect to contest page on success

**Changes:**
```javascript
async function handleLogin() {
  const response = await fetch(`${VITE_API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    setTokens(data.accessToken, data.refreshToken);
    // Redirect to contest
  } else {
    const error = await response.json();
    alert(error.error.message);
  }
}
```

### 8.3 Update All Contest Pages

**Locations:**
- `/client/src/pages/Rapidfire.jsx`
- `/client/src/pages/RapidfireContest.jsx`
- `/client/src/pages/Cascade.jsx`
- `/client/src/pages/CascadeContest.jsx`
- `/client/src/pages/DSA.jsx`
- `/client/src/pages/DSAContest.jsx`
- `/client/src/pages/Contest.jsx`
- `/client/src/pages/Rounds.jsx`
- `/client/src/pages/Leaderboard.jsx`

**Pattern for all API calls:**

**Before:**
```javascript
const response = await fetch(`${VITE_API_URL}/rapidfire/join`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: userToken }),
});
```

**After:**
```javascript
const response = await apiCall('/rapidfire/join', {
  method: 'POST',
  body: JSON.stringify({ /* no token needed */ }),
});
```

### 8.4 Update Socket.IO Client Connection

**Location:** Wherever socket connection is initialized (check each contest page)

**Current Pattern:**
```javascript
const socket = io(SERVER_URL);
socket.emit('register', { userId });
```

**New Pattern:**
```javascript
const accessToken = getAccessToken();
const socket = io(SERVER_URL, {
  auth: { token: accessToken }
});

socket.emit('register');  // No userId needed, server extracts from token
```

**Search for socket initialization in:**
- `/client/src/pages/RapidfireContest.jsx`
- `/client/src/pages/CascadeContest.jsx`
- `/client/src/pages/DSAContest.jsx`
- `/client/src/App.jsx`

### 8.5 Update Admin Pages

**Locations:**
- `/client/src/pages/AdminLogin.jsx`
- `/client/src/pages/AdminDashboard.jsx`
- `/client/src/pages/AdminQuestions.jsx`

**Admin Login Changes:**
- Update to use JWT authentication
- Store admin tokens separately or with role indicator

**Admin Dashboard Changes:**
- All API calls to admin endpoints should use the `apiCall` helper
- Tokens sent via Authorization header automatically

### 8.6 Create Auth Context (Recommended)

**Location:** `/client/src/context/AuthContext.jsx` (create this directory)

**Purpose:** Centralized authentication state management

**Implementation:**
```javascript
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = getAccessToken();
    if (token) {
      // Optionally validate token by calling a /auth/me endpoint
      validateToken(token).then(userData => {
        setUser(userData);
        setLoading(false);
      }).catch(() => {
        clearTokens();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setTokens(accessToken, refreshToken);
    setUser(userData);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    // Call logout endpoint to invalidate refresh token
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Usage in App.jsx:**
```javascript
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your routes */}
    </AuthProvider>
  );
}
```

### 8.7 Update Protected Routes

**Locations:**
- `/client/src/components/ProtectedCascadeRoute.jsx`
- `/client/src/components/ProtectedContestRoute.jsx`
- `/client/src/components/ProtectedDSARoute.jsx`

**Add authentication check:**
- Verify user is logged in (has valid token)
- Redirect to login if not authenticated

---

## Phase 9: Testing & Migration

### 9.1 Migration Strategy

**Option A: Big Bang Migration (Simpler)**
1. Deploy all changes at once
2. Invalidate all existing plain-text tokens
3. Users must re-login with new system

**Option B: Gradual Migration (Recommended for production)**
1. Run both systems in parallel
2. Support both plain tokens and JWT during transition
3. Gradually phase out plain tokens
4. Force all users to migrate within 1 week

### 9.2 Migration Script

**Location:** `/server/scripts/migrate_users_to_jwt.js`

**Purpose:** Generate initial passwords/access codes for existing users

**Steps:**
1. Export all existing users with their plain tokens
2. Generate secure access codes or passwords for each user
3. Hash and store in `password_hash` column
4. Notify users of new credentials via email/SMS

### 9.3 Testing Checklist

#### Backend Tests

- [ ] Login endpoint returns valid JWT
- [ ] Invalid credentials return 401
- [ ] Expired tokens return 401 with correct error code
- [ ] Protected routes reject unauthenticated requests
- [ ] Protected routes accept valid JWT
- [ ] Admin routes reject non-admin users
- [ ] Socket.IO rejects unauthenticated connections
- [ ] Socket.IO accepts authenticated connections
- [ ] Token refresh works correctly
- [ ] Logout invalidates refresh token

#### Frontend Tests

- [ ] Login stores tokens in localStorage
- [ ] API calls include Authorization header
- [ ] Token refresh happens automatically on 401
- [ ] Logout clears tokens and redirects
- [ ] Socket connection includes auth token
- [ ] Protected routes redirect to login when not authenticated
- [ ] Admin pages require admin role

#### Integration Tests

- [ ] Full contest flow works (login → join → submit → leaderboard)
- [ ] Multiple users can participate simultaneously
- [ ] Force logout works when same user logs in elsewhere
- [ ] Admin can start/stop rounds
- [ ] Admin can manage questions

### 9.4 Rollback Plan

**If issues occur:**

1. Keep backup of original code in separate git branch
2. Keep database backup before migration
3. Have rollback script to restore plain-token system
4. Monitor error logs closely for first 24 hours

---

## Security Best Practices

### 1. Token Security

- **Use HTTPS in production** - Never transmit tokens over HTTP
- **Set secure cookie flags** - If using cookies (HttpOnly, Secure, SameSite)
- **Short token expiration** - 15-30 minutes for access tokens
- **Implement token rotation** - New refresh token on each refresh
- **Revoke on logout** - Invalidate refresh tokens server-side

### 2. Password Security (if implementing)

- **Minimum 8 characters** - Enforce strong password policy
- **Hash with bcrypt** - Use salt rounds of 10-12
- **Rate limit login attempts** - Prevent brute force attacks
- **Never log passwords** - Sanitize all logs

### 3. API Security

- **Rate limiting** - Use `express-rate-limit` to prevent abuse
- **Input validation** - Validate all request bodies
- **SQL injection prevention** - Continue using parameterized queries
- **CORS configuration** - Restrict to your frontend domain only

### 4. Socket Security

- **Authenticate on connection** - Don't allow anonymous connections
- **Validate all events** - Ensure user can only act on their own data
- **Rate limit events** - Prevent spam/flood attacks
- **Log socket activity** - For security auditing

### 5. Monitoring & Logging

- **Log authentication failures** - Track potential attacks
- **Log admin actions** - Audit trail for administrative changes
- **Monitor token usage** - Detect unusual patterns
- **Set up alerts** - Notify on suspicious activity

### 6. Production Checklist

- [ ] HTTPS enabled
- [ ] JWT_SECRET is strong and unique
- [ ] CORS restricted to frontend domain
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info
- [ ] Database credentials secured
- [ ] Regular security audits scheduled

---

## File Change Summary

### Files to Create

**Server:**
```
/server/utils/tokenUtils.js
/server/utils/errorResponses.js
/server/middleware/authMiddleware.js
/server/middleware/socketAuthMiddleware.js
/server/scripts/migrate_to_jwt.sql
/server/scripts/migrate_users_to_jwt.js
```

**Client:**
```
/client/src/utils/api.js
/client/src/context/AuthContext.jsx
```

### Files to Modify

**Server:**
```
/server/package.json          - Add dependencies
/server/.env                  - Add JWT configuration
/server/index.js              - Update Socket.IO auth, protect routes
/server/routes/auth.js        - Complete rewrite for JWT
/server/routes/admin.js       - Add auth middleware
/server/routes/rapidfire.js   - Add auth middleware, remove token lookup
/server/routes/cascade.js     - Add auth middleware, remove token lookup
/server/routes/dsa.js         - Add auth middleware, remove token lookup
/server/routes/question.js    - Add auth middleware
```

**Client:**
```
/client/src/pages/Login.jsx           - Update for JWT login
/client/src/pages/AdminLogin.jsx      - Update for JWT login
/client/src/pages/RapidfireContest.jsx - Update API calls, socket auth
/client/src/pages/CascadeContest.jsx   - Update API calls, socket auth
/client/src/pages/DSAContest.jsx       - Update API calls, socket auth
/client/src/pages/Contest.jsx          - Update API calls
/client/src/pages/Rounds.jsx           - Update API calls
/client/src/pages/Leaderboard.jsx      - Update API calls
/client/src/pages/AdminDashboard.jsx   - Update API calls
/client/src/pages/AdminQuestions.jsx   - Update API calls
/client/src/App.jsx                    - Add AuthProvider wrapper
/client/src/components/Protected*Route.jsx - Add auth checks
```

---

## Estimated Timeline

| Phase | Description | Estimated Time |
|-------|-------------|----------------|
| 1 | Dependencies & Setup | 1-2 hours |
| 2 | Database Migration | 2-3 hours |
| 3 | Auth Middleware | 3-4 hours |
| 4 | Auth Routes | 3-4 hours |
| 5 | Protect API Routes | 6-8 hours |
| 6 | Socket.IO Auth | 2-3 hours |
| 7 | Admin Auth | 2-3 hours |
| 8 | Client-Side Changes | 8-10 hours |
| 9 | Testing & Migration | 4-6 hours |
| **Total** | | **31-43 hours** |

**Recommended:** Spread over 5-7 days with thorough testing between phases.

---

## Conclusion

This implementation plan provides a comprehensive roadmap for upgrading your quiz platform's authentication from plain-text tokens to secure JWT-based authentication. Following this plan will:

1. **Prevent unauthorized API access** - Only authenticated users can send requests
2. **Protect against token forgery** - Cryptographic signatures prevent tampering
3. **Enable secure session management** - Token expiration and refresh flow
4. **Secure real-time communications** - Socket.IO authentication
5. **Provide audit trails** - Better logging and monitoring capabilities

**Next Steps:**
1. Review this plan thoroughly
2. Set up a development/staging environment for testing
3. Create database backups before any migration
4. Implement phases sequentially with testing after each
5. Deploy to production during low-traffic period
6. Monitor closely for the first 24-48 hours

---

**Document Version:** 1.0
**Created:** March 19, 2026
**Platform:** GP Ultimate Quiz Platform
