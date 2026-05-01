# Netflix Project Session Notes

Last updated: 2026-02-25

## Documentation Added

- Upload flow guide:
  - `NETFLIX/UPLOAD_FLOW_GUIDE.md`
- Upload flow diagrams:
  - `NETFLIX/UPLOAD_FLOW_DIAGRAMS.md`
- Cloudinary sync guide:
  - `NETFLIX/CLOUDINARY_SYNC_GUIDE.md`

## Completed In This Session

- Added demo data seeding command for random-rich UI:
  - `API/scripts/seedDemoData.js`
  - `API/package.json` script: `seed:demo`
- Executed seed successfully:
  - 60 demo movies upserted
  - 28 demo lists upserted
  - command: `cd API && npm run seed:demo`
- Improved list randomness query order:
  - `API/routes/lists.js` now matches filters first, then samples.
- Added Cloudinary sync tooling:
  - `API/scripts/syncCloudinaryToMongo.js`
  - `API/scripts/tagCloudinaryFromMongo.js`
  - `API/scripts/repairListContent.js`
  - `API/package.json` scripts:
    - `sync:cloudinary`
    - `sync:cloudinary:dry`
    - `tag:cloudinary-from-mongo`
    - `repair:lists`
- Updated upload pipeline to auto-tag new Cloudinary uploads:
  - `API/routes/upload.js`
  - `admin/src/utils/uploadFile.js`
  - `admin/src/pages/newProduct/NewProduct.jsx`
  - `admin/src/pages/product/Product.jsx`
- Added optional Cloudinary metadata fields in Movie schema:
  - `API/models/Movie.js` -> `cloudinaryMeta`
- Repaired duplicate list content in Mongo:
  - `npm run repair:lists`
  - Lists now use unique IDs (no repeated same card 10x in a row)

- Fixed admin auth routing checks:
  - `admin/src/App.js` now requires `user.isAdmin` + `accessToken`.
  - Added admin logout button in `admin/src/components/topbar/Topbar.jsx`.
- Fixed client featured rendering warnings:
  - Avoids rendering image tags with empty `src` in `client/src/components/featured/Featured.jsx`.
- Improved API error responses for debugging:
  - `API/routes/movies.js` random route
  - `API/routes/lists.js` list route
  - `API/routes/users.js` users/stats routes
- Diagnosed root cause of current 500 errors:
  - MongoDB Atlas connection failing due network access / IP whitelist (`MongooseServerSelectionError`).

- Added auto-refresh random featured media by category in client:
  - `client/src/components/featured/Featured.jsx`
  - Refresh interval set to 12 seconds.
- Added genre-aware random movie API:
  - `API/routes/movies.js` (`/api/movies/random?type=...&genre=...`)
- Updated home page to pass selected genre into featured fetch:
  - `client/src/pages/home/Home.jsx`
- Compared your project with Safak's `mern-netflix-app` and aligned list management.
- Added missing admin list pages:
  - `admin/src/pages/list/List.jsx`
  - `admin/src/pages/list/list.css`
  - `admin/src/pages/newList/newList.css`
- Updated admin routing in `admin/src/App.js`:
  - Added `/list/:listId`
  - Added `/newlist`
- Updated list table page:
  - `admin/src/pages/listList/ListList.jsx`
  - Added Create button and fixed Edit navigation state.
- Added list edit API support:
  - `API/routes/lists.js` now includes `PUT /api/lists/:id`.
- Fixed admin port env formatting:
  - `admin/.env` changed from `PORT = 4000` to `PORT=4000`.

- Added admin list quality guard (type/content mismatch protection):
  - API validation now blocks saving `type=movie` lists with series IDs and vice versa.
  - Added in `API/routes/lists.js` for both `POST /api/lists` and `PUT /api/lists/:id`.
  - Admin `NewList` and `List` pages now filter content options by selected type and show mismatch errors before submit:
    - `admin/src/pages/newList/NewList.jsx`
    - `admin/src/pages/list/List.jsx`

- Added admin non-random lists endpoint and connected admin table to it:
  - `GET /api/lists/all` (admin-only) in `API/routes/lists.js`
  - `admin/src/context/listContext/apiCalls.js` now fetches `/api/lists/all` with token.
  - Client home still uses `/api/lists` random behavior (unchanged).

- Completed admin route/navigation cleanup:
  - Sidebar entries now route to actual paths:
    - `admin/src/components/sidebar/Sidebar.jsx`
  - Added placeholder pages for non-implemented modules and wired routes in:
    - `admin/src/App.js`
    - `admin/src/pages/placeholder/Placeholder.jsx`
    - `admin/src/pages/placeholder/placeholder.css`
  - Topbar logo now routes to `/`:
    - `admin/src/components/topbar/Topbar.jsx`

- Completed client auth + route flow (Netflix-like):
  - Real flow now works: `/register` -> `/login` -> `/` (protected app).
  - `client/src/App.jsx` now uses localStorage-backed auth state and protected routes.
  - Login connected to API:
    - `client/src/pages/login/Login.jsx`
  - Register connected to API:
    - `client/src/pages/register/Register.jsx`
    - `client/src/pages/register/register.scss`

- Wired client navigation/buttons to real routes:
  - Navbar links and logout/settings actions:
    - `client/src/components/navbar/Navbar.jsx`
    - `client/src/components/navbar/navbar.scss`
  - Featured buttons:
    - `Play` -> `/watch`
    - `Info` -> `/details/:id`
    - file: `client/src/components/featured/Featured.jsx`
  - Added details/account pages:
    - `client/src/pages/details/Details.jsx`
    - `client/src/pages/details/details.scss`
    - `client/src/pages/account/Account.jsx`
    - `client/src/pages/account/account.scss`
  - Watch/ListItem routing and empty-media fallback fixes:
    - `client/src/components/listItem/ListItem.jsx`
    - `client/src/pages/watch/Watch.jsx`
    - `client/src/pages/watch/watch.scss`
  - Home now receives logout handler:
    - `client/src/pages/home/Home.jsx`

- End-to-end smoke test status (after Atlas IP allowlist fix + API restart):
  - Admin routes:
    - `GET http://localhost:4000/login` -> `200`
    - `GET http://localhost:4000/lists` -> `200`
  - Client routes:
    - `GET http://localhost:5173/login` -> `200`
    - `GET http://localhost:5173/register` -> `200`
    - `GET http://localhost:5173/movies` -> `200`
  - API routes:
    - `GET /api/lists/all` (no token) -> `401` expected
    - `GET /api/lists` -> `200`
    - `GET /api/movies/random?type=movie` -> `200`
  - Auth:
    - `POST /api/auth/register` -> `201`
    - `POST /api/auth/login` -> `200` (token returned)
    - `GET /api/lists/all` with non-admin token -> `403` expected

## Current Important Notes

- Admin user access is required for protected endpoints.
- Dashboard cards use backend APIs:
  - `GET /api/users/stats` (User Analytics)
  - `GET /api/users?new=true` (New Join Members)
- If these cards are blank:
  - Check browser Network tab for `401/403/500`.
  - `401/403` means missing/invalid admin token.
  - `200` with `[]` means DB has no matching data.

## Known Gaps (Still Pending)

- `admin/src/pages/userList/UserList.jsx` is still using `dummyData`, not real API users.
- Password handling still uses CryptoJS AES in `API/routes/auth.js` (recommended: bcrypt hashing migration).
- Build warnings remain in movie upload loops (`no-loop-func`) but build succeeds.

## Run Commands

From `NETFLIX/API`:

```bash
npm start
```

From `NETFLIX/admin`:

```bash
npm start
```

Admin login URL:

`http://localhost:4000/login`

## Resume Prompt For Next Session

Use this to continue quickly:

`Continue Netflix clone work from NETFLIX/SESSION_NOTES.md. First convert admin UserList to fetch real users from /api/users with admin token, then migrate auth password storage from CryptoJS AES to bcrypt, and finally clean the upload progress loop warnings in NewProduct/Product.`
