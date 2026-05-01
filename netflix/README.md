# MERN Netflix Clone

A full-stack Netflix-style app with:
- `api` (Node.js + Express + MongoDB + Cloudinary)
- `admin` (React admin panel for movies/lists/users)
- `client` (React user-facing app)

## Project Structure

```text
NETFLIX/
  api/
  admin/
  client/
  SESSION_NOTES.md
  UPLOAD_FLOW_GUIDE.md
  UPLOAD_FLOW_DIAGRAMS.md
  CLOUDINARY_SYNC_GUIDE.md
```

## Prerequisites

- Node.js (LTS recommended)
- MongoDB Atlas cluster
- Cloudinary account

## API Environment (`api/.env`)

```env
MONGO_URL=your_mongodb_connection_string
MONGO_DB_NAME=test
SECRET_KEY=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8
UPLOAD_MAX_MB=95
```

## Run Locally

### 1) API

```bash
cd api
npm install
npm run dev
```

Expected log:

`MongoDB connected to database: test`

### 2) Admin

```bash
cd ../admin
npm install
npm start
```

Admin URL:

`http://localhost:4000/login`

### 3) Client

```bash
cd ../client
npm install
npm run dev
```

Client URL:

`http://localhost:5173`

## Core Flow

1. Admin uploads files from `New Movie`.
2. API uploads files to Cloudinary.
3. API stores movie metadata + Cloudinary URLs in MongoDB.
4. Client reads lists/movies and renders image/video.

## Useful API Scripts (`api`)

```bash
npm run seed:demo
npm run repair:lists
npm run sync:cloudinary:dry
npm run sync:cloudinary
npm run tag:cloudinary-from-mongo
```

## Common Issues

- **MongoDB connection error / 500 on lists or login**
  - Add current IP in Atlas `Network Access`.
  - Restart API.

- **Admin build/start OpenSSL issue**
  - Admin `start` script already uses:
    - `NODE_OPTIONS=--openssl-legacy-provider`

## Notes

- Current auth password storage in API uses CryptoJS AES (migration to bcrypt is recommended).
- See `SESSION_NOTES.md` for the latest project status and pending tasks.
