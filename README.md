# My Projects

A single repository for my React and MERN practice work. This repo includes small React UI exercises, hook-based practice apps, and larger full-stack projects with multiple app folders.

## Repository Structure

```text
my-projects/
  assignment-5-usefetch/
  bg-changer/
  brand-page/
  ev-website/
  mern-project/
  netflix/
  password-generator/
```

## Project Overview

### `assignment-5-usefetch`

A React custom hook project built to practice reusable API fetching logic. It demonstrates a `useFetch` hook, loading and error state handling, and rendering remote product data from a public API.

### `bg-changer`

A beginner-friendly React project that changes the full-page background color using buttons and local state. This is a simple practice app focused on `useState`, event handling, and dynamic styling.

### `password-generator`

A React password generator that creates random passwords based on user-selected settings. It supports changing password length, enabling numbers, enabling special characters, and copying the result to the clipboard.

### `ev-website`

A React landing page project for an EV-themed website. It includes rotating hero text, media-based backgrounds, and a simple interactive marketing-style layout using reusable components.

### `brand-page`

A React brand landing page focused on layout and presentation. It contains a navigation bar, a strong hero section, CTA buttons, brand marketplace icons, and product-focused visuals.

### `mern-project`

A full-stack MERN workout tracking app with separate frontend and backend folders. It includes user signup, login, JWT-based authentication, protected workout routes, and CRUD functionality for workout records.

### `netflix`

A larger full-stack Netflix-style project with three separate applications:

- `api` - Express + MongoDB backend
- `client` - React user-facing app
- `admin` - React admin panel for managing content

It also includes Cloudinary-related upload/sync guides and supporting notes for the media workflow.

## How To Run Projects

### Single-App React Projects

These projects are standard Vite apps:

- `assignment-5-usefetch`
- `bg-changer`
- `password-generator`
- `ev-website`
- `brand-page`

Run any one of them like this:

```bash
cd project-folder-name
npm install
npm run dev
```

Vite usually starts on `http://localhost:5173`.

### `mern-project`

This project has two separate parts that run independently.

### Backend

```bash
cd mern-project/backend
npm install
npm run dev
```

Runs on:

`http://localhost:4000`

### Frontend

Open a second terminal:

```bash
cd mern-project/frontend
npm install
npm start
```

Runs on:

`http://localhost:3000`

### Notes

- Create a `backend/.env` file with `PORT`, `MONGO_URI`, and `SECRET`
- The frontend uses the backend API and requires the backend to be running

### `netflix`

This project is split into three apps. Do not run the root `netflix` folder directly for the main app experience. Run the parts below instead.

### API

```bash
cd netflix/api
npm install
npm run dev
```

Runs on:

`http://localhost:9000`

### Client

Open another terminal:

```bash
cd netflix/client
npm install
npm run dev
```

Runs on:

Usually `http://localhost:5173`

### Admin Panel

Open another terminal:

```bash
cd netflix/admin
npm install
npm start
```

Runs on:

`http://localhost:4000`

### Important Admin Note

The `admin` app is a Create React App project and uses `npm start`, not `npm run dev`. Its setup is older than the client app, so you may need Node.js 16 for the admin panel while the API and client can use newer Node versions.

### Notes

- `netflix/api` needs its own `.env` file
- `netflix/client` depends on the API server
- `netflix/admin` also depends on the API server
- If another project is already using port `4000`, the admin panel may need that port to be freed first

## Recommended Order For Multi-App Projects

### For `mern-project`

1. Start the backend
2. Start the frontend
3. Open the frontend in the browser

### For `netflix`

1. Start the API
2. Start the client
3. Start the admin panel if needed

## Extra Notes

- Each project folder has its own README with more detailed project-specific information
- Most smaller React projects in this repo use Vite
- The larger projects use separate folders because their frontend and backend apps are not meant to be started with one single command
