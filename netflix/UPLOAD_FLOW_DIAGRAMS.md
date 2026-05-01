# Upload Flow Diagrams

Last updated: 2026-02-22

## 1) Architecture Diagram

```text
[Admin Frontend]
      |
      | HTTP requests
      v
[API Backend] ------------> [Cloudinary]
      |                          |
      | save metadata + URLs     | stores real files
      v                          |
   [MongoDB] <-------------------
      |
      | GET endpoints
      v
[Client Frontend]
```

## 2) Request Sequence Diagram

```text
Step 1:
Admin -> POST /api/upload (img file)
API -> Cloudinary upload
API <- Cloudinary secure_url
Admin <- {url}

Step 2:
Admin -> POST /api/upload (trailer/video file)
API -> Cloudinary upload
API <- Cloudinary secure_url
Admin <- {url}

Step 3:
Admin -> POST /api/movies (metadata + URLs)
API -> MongoDB insert movie document
Admin <- 201 created

Step 4:
Client -> GET /api/movies/find/:id (or list/random endpoints)
API -> MongoDB read
Client <- movie JSON with URLs
Client -> render/play media from URL
```

## 3) Field Lifecycle Diagram

```text
Media fields (img/imgTitle/imgSm/trailer/video):
Admin file input -> /api/upload -> Cloudinary file -> secure_url -> MongoDB field

Metadata fields (title/desc/year/genre/limit/isSeries):
Admin text input -> /api/movies JSON -> MongoDB field
```

## 4) Ownership Diagram

```text
Cloudinary:
  - binary media (images/videos)

MongoDB:
  - metadata
  - cloudinary URLs (and optionally public_id)

Frontend:
  - temporary form/file state only
```
