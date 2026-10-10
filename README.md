# HandoffHub

A structured, encrypted project handoff platform for developers and clients.

HandoffHub gives developers and clients a dedicated space to manage the entire software delivery lifecycle — from requirements and milestones through to the final handoff of credentials and deployment details — without creating accounts or exposing sensitive information to the server.

---

## What It Solves

Most project handoffs happen across a messy mix of email threads, chat apps, and shared documents. Credentials get sent in plaintext. Milestones get lost in conversation. There is no single record of what was delivered, reviewed, and approved.

HandoffHub brings everything into one temporary, encrypted space:

- The **developer** creates a project, documents the scope and milestones, and shares an access key with the client.
- The **client** joins using the project ID and access key, reviews work, approves milestones, and requests changes — all in one place.
- When the project is complete, the developer delivers deployment credentials and environment variables using **end-to-end encryption**. The server stores only a ciphertext blob and never sees plaintext secrets.

---

## Features

| Section | What you can do |
|---|---|
| **Overview** | Document project description, technology stack, timeline, and notes |
| **Milestones** | Create milestones with deadlines, track status (Pending → In Progress → Under Review → Approved / Changes Requested), and visualise overall progress |
| **Deliverables** | Share repository links, live demos, design files, API docs, and other resources — organised by type and milestone |
| **Credentials** | Share API keys, environment variables, and deployment secrets end-to-end encrypted — exported as a `.env` file with one click |
| **Discussion** | Real-time, end-to-end encrypted chat for project communication — clarify features, post updates, resolve questions |
| **Team** | See who is connected, copy the project ID, and track the session expiry countdown |

### Security model

- All sensitive data (credentials, overview, milestones, deliverables) is encrypted with **AES-256-GCM** in the browser before leaving the device.
- The encryption key is distributed between participants using **ECDH (P-256)** key exchange and **HKDF-SHA-256** pairwise key derivation — the server never sees it.
- The server stores only an opaque AES-GCM ciphertext blob in Redis. No plaintext values ever reach the server.
- Sessions are **JWT cookies** that expire with the project. No user accounts are created.
- Access keys are stored as **bcrypt hashes** (cost 12). Even the access key itself cannot be recovered from the server.

---

## Tech Stack

### Frontend

| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 6 | Build tool, dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router | 6 | Client-side routing |
| Socket.IO Client | 4 | Real-time communication |
| Framer Motion | 13 | Animations |
| Lucide React | 0.475 | Icons |
| Zustand | 5 | Theme state persistence |
| Axios | 1.7 | HTTP client |
| Web Crypto API | — | AES-GCM encryption, ECDH key exchange (browser-native) |
| IndexedDB | — | Persistent crypto key storage (browser-native) |

### Backend

| Library | Version | Purpose |
|---|---|---|
| Node.js | ≥18 | Runtime |
| Express | 5 | HTTP server |
| Socket.IO | 4 | Real-time events |
| MongoDB + Mongoose | 9 | Room metadata storage |
| Redis | 6 | Encrypted data blob storage (TTL-bound) |
| JSON Web Token | 9 | Session authentication |
| bcrypt | 6 | Access key hashing |
| Pino | 10 | Structured logging |
| express-rate-limit | 7 | Rate limiting |

---

## Project Structure

```
HandoffHub/
├── client/                        # React frontend (Vite)
│   ├── public/
│   │   ├── logo.png
│   │   └── nav.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── createRoom/        # Create / Join forms + layout
│   │   │   │   ├── CreateRoomForm.jsx
│   │   │   │   ├── CreateRoomLayout.jsx
│   │   │   │   └── JoinRoomForm.jsx
│   │   │   ├── landing/           # Landing page sections
│   │   │   │   ├── CTA.jsx
│   │   │   │   ├── Features.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   ├── Hero.jsx
│   │   │   │   ├── HowItWorks.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Stats.jsx
│   │   │   └── room/              # Project workspace panels
│   │   │       ├── ChatPanel.jsx         # E2EE discussion
│   │   │       ├── DeliverablesPanel.jsx # Links & resources
│   │   │       ├── EnvFilesPanel.jsx     # Encrypted credentials
│   │   │       ├── MembersPanel.jsx      # Team + expiry info
│   │   │       ├── MilestonesPanel.jsx   # Milestone tracking
│   │   │       └── OverviewPanel.jsx     # Project overview
│   │   ├── config/
│   │   │   └── env.js             # VITE_API_BASE_URL
│   │   ├── crypto/                # Browser-side E2EE layer
│   │   │   ├── chatKeyManager.js  # Chat AES key lifecycle
│   │   │   ├── decryptData.js     # AES-GCM decryption
│   │   │   ├── ecdhKeyManager.js  # ECDH key pair generation
│   │   │   ├── encryptData.js     # AES-GCM encryption
│   │   │   ├── indexedDb.js       # IndexedDB crypto key store
│   │   │   ├── keyDerivation.js   # HKDF pairwise key derivation
│   │   │   ├── keyManager.js      # Key import/export helpers
│   │   │   ├── KeyWrap.js         # Wrap/unwrap AES keys
│   │   │   └── roomKeyManager.js  # Room AES key + ECDH identity
│   │   ├── hooks/
│   │   │   └── useTheme.js        # Dark/light theme (Zustand)
│   │   ├── layout/
│   │   │   ├── Header.jsx         # Top bar with project ID
│   │   │   └── RoomLayout.jsx     # Main workspace orchestrator
│   │   ├── pages/
│   │   │   ├── CreateRoomPage.jsx
│   │   │   ├── JoinRoomPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RoomCreatedPage.jsx
│   │   │   └── RoomNotFound.jsx
│   │   ├── services/
│   │   │   ├── envApi.js          # Encrypted data REST calls
│   │   │   ├── roomApi.js         # Room REST calls (Axios)
│   │   │   └── socket.js          # Socket singleton (unused)
│   │   └── styles/
│   │       └── globals.css        # Design tokens + Tailwind
│   ├── .env.development
│   ├── .env.production
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── server/                        # Node.js / Express backend
    ├── src/
    │   ├── config/
    │   │   ├── db.js              # MongoDB connection
    │   │   ├── env.js             # Environment variable validation
    │   │   └── redis.js           # Redis client
    │   ├── controllers/
    │   │   ├── envController.js   # Encrypted data CRUD
    │   │   └── roomController.js  # Room create / join / get
    │   ├── middleware/
    │   │   ├── authenticateSession.js  # JWT cookie validation
    │   │   ├── rateLimiter.js          # IP-based rate limits
    │   │   ├── roomAccess.js           # Active room check
    │   │   ├── roomMiddleware.js       # Room lookup
    │   │   └── socketAuth.js           # Socket.IO JWT auth
    │   ├── models/
    │   │   └── Room.js            # Mongoose schema + TTL index
    │   ├── routes/
    │   │   ├── index.js
    │   │   └── v1/
    │   │       ├── envRoutes.js   # GET/POST/DELETE /env
    │   │       └── roomRoutes.js  # Room REST routes
    │   ├── services/
    │   │   ├── cleanupService.js  # Periodic expiry cleanup
    │   │   ├── envStore.js        # Redis read/write helpers
    │   │   └── socketService.js   # Socket.IO event handlers
    │   └── utils/
    │       ├── accessKey.js       # Key generation + bcrypt
    │       ├── logger.js          # Pino logger
    │       ├── roomId.js          # 6-char random room ID
    │       ├── roomToken.js       # JWT generation
    │       └── sessionCookie.js   # Cookie options
    ├── .env
    ├── package.json
    └── server.js                  # Entry point
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- MongoDB (local or Atlas)
- Redis (local or managed, e.g. Upstash)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/HandoffHub.git
cd HandoffHub
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/`:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/handoffhub
CLIENT_URL=http://localhost:5174
NODE_ENV=development
LOG_LEVEL=info
JWT_SECRET=your-256-bit-secret-here
REDIS_URL=redis://127.0.0.1:6379
```

> **Tip — generate a strong JWT secret:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

Start the server:

```bash
npm run dev      # nodemon (hot reload)
# or
npm start        # production
```

The server will be available at `http://localhost:3000`.

### 3. Set up the client

```bash
cd ../client
npm install
```

Create a `.env.development` file in `client/`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5174`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | Yes | Port the Express server listens on |
| `MONGO_URI` | Yes | MongoDB connection string |
| `CLIENT_URL` | Yes | Frontend origin for CORS (e.g. `http://localhost:5174`) |
| `NODE_ENV` | Yes | `development` or `production` |
| `LOG_LEVEL` | Yes | Pino log level (`info`, `debug`, `warn`, `error`) |
| `JWT_SECRET` | Yes | Secret used to sign session JWTs — keep this strong and private |
| `REDIS_URL` | Yes | Redis connection URL |

### Client (`client/.env.development` / `.env.production`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Backend API base URL (e.g. `http://localhost:3000`) |

---

## API Reference

### Room (Project) Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/rooms` | — | Create a new project space |
| `GET` | `/api/v1/rooms/:roomId/status` | — | Public status check |
| `GET` | `/api/v1/rooms/:roomId` | Session cookie | Get project details + participant info |
| `POST` | `/api/v1/rooms/:roomId/join` | — | Verify access key + issue session |

### Data (Encrypted Blob) Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/rooms/:roomId/env` | Session cookie | Save encrypted project data blob |
| `GET` | `/api/v1/rooms/:roomId/env` | Session cookie | Retrieve encrypted project data blob |
| `DELETE` | `/api/v1/rooms/:roomId/env` | Session cookie | Wipe encrypted data from Redis |

### Health Check

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service liveness check |

---

## Socket.IO Events

All real-time communication goes through Socket.IO. The client connects with `withCredentials: true` so the `session` cookie is sent for authentication.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join-room` | — | Join the Socket.IO room after connecting |
| `key:publish` | `{ publicKey }` | Broadcast ECDH public key to peers |
| `room:key:request` | — | Ask peers to send the room AES key |
| `room:key:share` | `{ recipientParticipantId, wrappedKey, iv }` | Send wrapped room key to a peer |
| `chat:key:request` | — | Ask peers to send the chat AES key |
| `chat:key:share` | `{ recipientParticipantId, wrappedKey, iv }` | Send wrapped chat key to a peer |
| `chat:send` | `{ ciphertext, iv }` | Send an AES-GCM encrypted message |
| `leave-room` | — | Cleanly remove self from the room |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `room:members` | `{ participants, participantCount }` | Updated participant list |
| `key:existing-participants` | `{ participants }` | Public keys of participants already in the room |
| `key:participant-public` | `{ participantId, displayName, publicKey }` | A new participant published their public key |
| `room:key:share` | `{ senderParticipantId, recipientParticipantId, wrappedKey, iv }` | Wrapped room key (client filters by recipientParticipantId) |
| `chat:key:request` | `{ participantId, displayName }` | A peer needs the chat key |
| `chat:key:share` | `{ senderParticipantId, recipientParticipantId, wrappedKey, iv }` | Wrapped chat key (unicast to recipient sockets) |
| `chat:message` | `{ messageId, participantId, displayName, ciphertext, iv, timestamp }` | Encrypted message broadcast |
| `env:updated` | `{ roomId, updatedBy }` | Project data blob was updated by another participant |
| `room:expired` | `{ roomId, message }` | Project has passed its expiry time |

---

## How the Encryption Works

```
Browser A (Developer)                     Browser B (Client)
─────────────────────                     ─────────────────

1. Generate ECDH key pair                 1. Generate ECDH key pair
   (stored in IndexedDB)                     (stored in IndexedDB)

2. Publish public key via                 2. Publish public key via
   socket "key:publish"                      socket "key:publish"

3. Receive B's public key                 3. Receive A's public key

4. Derive shared secret                   4. Derive shared secret
   ECDH(A.private, B.public)                 ECDH(B.private, A.public)
   ──────────────────────────────────────────► (same value, both sides)

5. Derive pairwise AES key                5. Derive pairwise AES key
   HKDF-SHA-256(sharedSecret)                HKDF-SHA-256(sharedSecret)

6. Room creator wraps the room            6. Receives wrapped room key,
   AES-256-GCM key with                      unwraps using pairwise key,
   pairwise key → sends via socket           saves to IndexedDB

7. All panel data (overview,              7. Decrypts same blob with
   milestones, deliverables,                 room AES key — reads all
   credentials) encrypted                    project sections
   with room AES key →
   stored in Redis

8. Chat uses a separate AES key           8. Same chat key exchange
   (same distribution mechanism)             → decrypts messages live
```

**Server's view:** Only sees base64url ciphertext blobs, wrapped key bytes, and ECDH public keys. No AES keys, no plaintext project data, no chat messages.

---

## Data Storage Model

### MongoDB — `Room` document

```js
{
  roomId:        String,   // 6-char unique project ID (e.g. "AB12CD")
  roomName:      String,   // Project name (3–40 chars)
  displayName:   String,   // Creator's display name
  accessKeyHash: String,   // bcrypt hash of the 8-char access key
  expiresAt:     Date,     // TTL — MongoDB auto-deletes expired docs
  status:        String,   // "active" | "expired" | "destroyed"
  createdAt:     Date,
  updatedAt:     Date
}
```

### Redis — encrypted data blob

```
Key:   room:{roomId}:env
Value: { ciphertext: "...", iv: "..." }   ← AES-256-GCM ciphertext
TTL:   remaining room lifetime (seconds)
```

The value is a single encrypted JSON array. Each panel stores its data as a named entry inside this array:

```js
[
  { id: "__project_overview__",     key: "__project_overview__",     value: "..." },
  { id: "__project_milestones__",   key: "__project_milestones__",   value: "..." },
  { id: "__project_deliverables__", key: "__project_deliverables__", value: "..." },
  { id: 1720000000001,              key: "DATABASE_URL",             value: "..." },
  // ... more credentials
]
```

The server never parses or inspects this array — it stores and returns it as-is.

---

## Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/v1/rooms` (create) | 15 requests | 15 minutes per IP |
| `POST /api/v1/rooms/:id/join` | 60 requests | 15 minutes per IP |

---

## Session Model

- On `createRoom`: a JWT is issued with `role: "owner"` and set as an `HttpOnly` cookie named `session`.
- On `joinRoom`: a JWT is issued with `role: "member"` and set as an `HttpOnly` cookie named `session`.
- The JWT payload: `{ roomId, participantId, displayName, role }`.
- Cookie expiry matches the project's `expiresAt`.
- In production: `Secure: true`, `SameSite: none` (required for cross-origin).
- In development: `Secure: false`, `SameSite: lax`.

---

## Production Deployment

### Server checklist

- Set `NODE_ENV=production`.
- Use a strong, randomly generated `JWT_SECRET` (32+ bytes).
- Use a managed MongoDB service (e.g. MongoDB Atlas).
- Use a managed Redis service (e.g. Upstash, Redis Cloud).
- Set `CLIENT_URL` to your exact frontend origin.
- Run behind a reverse proxy (Nginx / Caddy) with TLS termination.

### Client checklist

- Create `client/.env.production` with `VITE_API_BASE_URL=https://your-api.example.com`.
- Run `npm run build` — output goes to `client/dist/`.
- Deploy `dist/` to a static host (Vercel, Netlify, Cloudflare Pages, etc.).
- The `client/vercel.json` already contains SPA rewrite rules for Vercel.

### CORS

The server's CORS and Socket.IO CORS both read from `CLIENT_URL`. Make sure this matches your deployed frontend URL exactly (including protocol and port if non-standard).

---

## Important Limitations

- **Sessions are temporary.** Projects expire after 24 hours by default. All encrypted data in Redis is automatically deleted when the TTL expires.
- **Chat is not persisted.** Messages live only in React state. Refreshing the page clears the chat history.
- **Keys are browser-local.** ECDH identity and AES keys are stored in IndexedDB. Clearing browser storage means the project data (while still in Redis) becomes inaccessible from that browser.
- **One device per participant.** Each `join` generates a new `participantId` and a new ECDH identity. Joining from two different browsers creates two separate participants.
- **No file uploads.** Deliverables are links (URLs), not uploaded files.

---

## License

MIT — see [LICENSE](LICENSE) for details.
