# Upload Flow Guide (API + Cloudinary + Admin + Client)

Last updated: 2026-02-22

## 1) Perfect mental model

- Admin frontend sends requests to API.
- API uploads files to Cloudinary.
- API stores movie record in MongoDB with Cloudinary URLs.
- Client frontend reads those URLs and displays media.

Your project already follows this flow.

Key files involved:
- `admin/src/utils/uploadFile.js`
- `admin/src/pages/newProduct/NewProduct.jsx`
- `API/routes/upload.js`
- `API/routes/movies.js`
- `client/src/components/listItem/ListItem.jsx`
- `client/src/pages/watch/Watch.jsx`

## 2) What goes where

Cloudinary stores actual files:
- poster/thumbnail (`img`)
- title image (`imgTitle`)
- small thumbnail (`imgSm`)
- trailer (`trailer`)
- full video (`video`)

MongoDB stores metadata + links:
- `title`, `desc`, `genre`, `year`, `limit`, `isSeries`, etc.
- Cloudinary URLs for `img`, `imgTitle`, `imgSm`, `trailer`, `video`

Frontend stores nothing permanent for media:
- it uploads files
- receives URLs
- sends final JSON payload

## 3) What to do first (every new upload)

1. Ensure API is running with Cloudinary env configured:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

2. Login in admin panel with admin account.
3. Open admin New Movie form (`/newproduct`).
4. Select files + fill movie metadata.
5. Click Create:
- each file -> `POST /api/upload`
- API uploads to Cloudinary and returns URL
- admin sends final movie JSON -> `POST /api/movies`
- API saves movie document in MongoDB
6. Client fetches movie and renders media from saved URLs.

## 4) Your confusion solved in one line

Do not upload directly from browser to MongoDB.

Upload media to Cloudinary through API, then save only URLs + metadata in MongoDB.

## 5) Very small request-by-request timeline

```text
Admin UI
  |
  | 1) POST /api/upload   (file=thumbnail)
  v
API (/routes/upload.js)
  |
  | -> Cloudinary upload -> returns { url: thumbUrl }
  v
Admin UI keeps thumbUrl
  |
  | 2) POST /api/upload   (file=trailer)
  v
API
  |
  | -> Cloudinary upload -> returns { url: trailerUrl }
  v
Admin UI keeps trailerUrl
  |
  | 3) POST /api/movies   (JSON + Bearer token)
  |    {
  |      title, desc, year, genre, isSeries,
  |      img: thumbUrl,
  |      trailer: trailerUrl,
  |      ...other urls
  |    }
  v
API (/routes/movies.js)
  |
  | -> save Movie in MongoDB
  v
MongoDB Movie document (stores URLs only)
  |
  | 4) GET /api/movies/find/:id   (or /api/lists, /api/movies/random)
  v
Client UI renders:
  <img src={movie.img} />
  <video src={movie.trailer} />
  <video src={movie.video} />
```

That is the complete flow:

upload file(s) first -> get Cloudinary URL(s) -> create movie with those URLs.

## 6) Where each field is created

Admin form input stage (no API call yet):
- Text metadata state is created in `admin/src/pages/newProduct/NewProduct.jsx` (`movie` state + `handleChange`).
- File state is created in `admin/src/pages/newProduct/NewProduct.jsx` (`files` state + `handleFileChange`).

Inputs in admin form:
- Media fields: `img`, `imgTitle`, `imgSm`, `trailer`, `video`
- Metadata fields: `title`, `desc`, `year`, `genre`, `limit`, `isSeries`

File upload stage:
- Frontend sends multipart request in `admin/src/utils/uploadFile.js` to `POST /api/upload`.
- API receives file and uploads to Cloudinary in `API/routes/upload.js`.
- API returns `secure_url` as `{ url: ... }`.

Payload build stage:
- `handleCreate` in `admin/src/pages/newProduct/NewProduct.jsx` builds `payload` from metadata.
- It adds URL fields from upload responses:
  - `payload.img`
  - `payload.imgTitle`
  - `payload.imgSm`
  - `payload.trailer`
  - `payload.video`

Mongo save stage:
- Frontend posts payload to `POST /api/movies` via `admin/src/context/movieContext/apiCalls.js`.
- Backend reads values and saves `new Movie(...)` in `API/routes/movies.js`.
- Schema fields are defined in `API/models/Movie.js`.

Client render stage:
- `img` shown in `client/src/components/listItem/ListItem.jsx` and `client/src/components/featured/Featured.jsx`.
- `trailer` preview shown in `client/src/components/listItem/ListItem.jsx`.
- full `video` played in `client/src/pages/watch/Watch.jsx`.

## 7) Field ownership map

- `title`, `desc`, `year`, `genre`, `limit`, `isSeries`:
  - created in admin form
  - stored directly in MongoDB

- `img`, `imgTitle`, `imgSm`, `trailer`, `video`:
  - created as local files in admin
  - uploaded to Cloudinary
  - URL stored in MongoDB

Cloudinary stores files. MongoDB stores URLs + metadata.

## 8) 30-second verification checklist (Atlas + browser)

1. Upload from admin (`/newproduct` or edit page).
2. In Network tab:
- `/api/upload` -> `200` + `{ url: ... }`
- `/api/movies` -> `201` on create
3. In Atlas `movies` collection:
- metadata fields present
- media fields are Cloudinary URLs
4. Open one URL in browser:
- image renders
- video/trailer plays
5. Check client UI:
- list card image renders
- hover trailer works
- watch page plays full video

## 9) Optional recommendations (priority)

1. Security hardening
- replace AES password encryption with bcrypt in auth routes
- never return password fields in auth responses

2. Route protection
- prevent non-admin privilege escalation (`isAdmin`)
- protect sensitive user routes with verify/admin checks

3. Upload hardening
- add verify middleware on `API/routes/upload.js` (admin only)
- add multer file type/size limits

4. Media lifecycle
- store Cloudinary `public_id` with each media field in MongoDB
- helps safe replace/delete of old media

5. Validation and API config
- add Joi/Zod validation before DB writes
- remove hardcoded API URLs; use env variables + shared axios instance

6. Tests
- smoke path: upload -> create movie -> fetch movie -> render
- auth/authorization route tests

## 10) Flow diagrams

High-level architecture:

```text
[Admin Frontend]
      |
      | HTTP (multipart + JSON)
      v
[API Backend] ---------> [Cloudinary]
      |                      |
      | save URLs + meta     | stores binary files
      v                      |
   [MongoDB] <---------------
      |
      | read APIs
      v
[Client Frontend]
```

Detailed sequence:

```text
Admin(NewProduct) -> API(/api/upload): file(img)
API(/api/upload) -> Cloudinary: upload_stream
Cloudinary -> API(/api/upload): secure_url(img)
API(/api/upload) -> Admin(NewProduct): {url}

Admin(NewProduct) -> API(/api/upload): file(trailer/video/...)
API(/api/upload) -> Cloudinary: upload_stream
Cloudinary -> API(/api/upload): secure_url(...)
API(/api/upload) -> Admin(NewProduct): {url}

Admin(NewProduct) -> API(/api/movies): metadata + media URLs
API(/api/movies) -> MongoDB: insert Movie document
MongoDB -> API(/api/movies): created movie
API(/api/movies) -> Admin(NewProduct): 201 Created

Client(List/Watch) -> API(/api/movies|/api/lists): GET
API -> MongoDB: query movie/list
MongoDB -> API: movie data with URLs
API -> Client: JSON
Client -> Cloudinary URLs: media render/play
```

Field lifecycle diagram:

```text
file input (admin) -> File object -> /api/upload -> Cloudinary file
                    -> returned secure_url -> payload field -> MongoDB URL field

text input (admin) -> payload field -> /api/movies -> MongoDB metadata field
```

## 11) Recommended project structure (for clarity)

```text
NETFLIX/
  API/
    routes/
      upload.js
      movies.js
      users.js
      lists.js
    models/
      Movie.js
      User.js
      List.js
    utils/
      cloudinary.js
    verifyToken.js
    index.js

  admin/
    src/
      pages/
        newProduct/NewProduct.jsx
        product/Product.jsx
        productList/ProductList.jsx
      utils/
        uploadFile.js
      context/
        movieContext/
        listContext/
        authContext/

  client/
    src/
      components/a
        listItem/ListItem.jsx
        featured/Featured.jsx
      pages/
        watch/Watch.jsx
```
