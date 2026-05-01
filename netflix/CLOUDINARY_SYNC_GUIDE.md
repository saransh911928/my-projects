# Cloudinary To Mongo Sync Guide

Last updated: 2026-02-22

## What was added

- Auto-tagging metadata in upload route:
  - `API/routes/upload.js`
  - New uploads now include tags/context like `movie:...`, `type:...`, `genre:...`, `role:...`
- Cloudinary sync script:
  - `API/scripts/syncCloudinaryToMongo.js`
- Cloudinary bootstrap tagger from Mongo URLs:
  - `API/scripts/tagCloudinaryFromMongo.js`

## NPM commands

From `NETFLIX/API`:

```bash
npm run sync:cloudinary:dry
npm run sync:cloudinary
npm run tag:cloudinary-from-mongo
```

## Recommended run order

1. Upload new movies/media from admin (new uploads are now auto-tagged).
2. Run dry run:

```bash
npm run sync:cloudinary:dry
```

3. If output looks correct, run write mode:

```bash
npm run sync:cloudinary
```

4. Restart API and refresh client/admin.

## Important note about old assets

- Old Cloudinary assets uploaded before this update may not have required tags/context.
- In that case sync script will show:
  - `Grouped movie keys: 0`
  - `Skipped assets without movie tag/context: ...`
- Old assets can still be used directly via URLs already stored in Mongo.

## Optional env knobs

- `CLOUD_SYNC_LIST_SIZE` (default: `10`)
- `CLOUD_SYNC_DRY_RUN=true` (same as `--dry-run`)
- `CLOUD_TAG_DRY_RUN=true` for tagger preview mode

## Category behavior

Random/category fetch uses Mongo fields:
- `genre`
- `isSeries`

So make sure these are set correctly in movie docs. Cloudinary stores files; Mongo controls category queries.
