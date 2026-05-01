# MERN Project

A full-stack workout tracking app built with MongoDB, Express, React, and Node.js. The project includes user authentication and protected workout CRUD operations.

## Overview

This project is structured as a classic MERN application:

- `backend` provides the REST API, authentication, and MongoDB integration
- `frontend` provides the React UI for signup, login, and workout management

The frontend stores the logged-in user in local storage, sends the JWT token with protected requests, and updates workout state through React context.

## Features

- User signup with email validation and strong-password checks
- User login with JWT-based authentication
- Password hashing with `bcrypt`
- Protected workout routes with auth middleware
- Create, read, update, and delete workout entries
- Workout records are scoped to the authenticated user
- Frontend auth state stored in local storage
- React context for workouts and authentication state

## Tech Stack

### Frontend

- React
- React Router
- Context API
- Create React App

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcrypt
- dotenv

## Project Structure

```text
mern-project/
  backend/
    controllers/
    middleware/
    models/
    routes/
    server.js
  frontend/
    src/
      components/
      context/
      hooks/
      pages/
  docker-compose.yml
```

## API Endpoints

### Auth

- `POST /api/user/signup` - create a new user account
- `POST /api/user/login` - log in and receive a JWT

### Workouts

All workout routes require an `Authorization: Bearer <token>` header.

- `GET /api/workouts` - get all workouts for the logged-in user
- `GET /api/workouts/:id` - get one workout
- `POST /api/workouts` - create a workout
- `PATCH /api/workouts/:id` - update a workout
- `DELETE /api/workouts/:id` - delete a workout

## Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=4000
MONGO_URI=your_mongodb_connection_string
SECRET=your_jwt_secret
```

## Running the Project Locally

### 1. Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:4000`.

### 2. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000`.

## Frontend Flow

- Users can sign up or log in from dedicated auth pages
- Successful auth stores the user object in local storage
- The home page fetches workouts for the logged-in user
- Users can add a workout from the form and delete workouts from the list

## Notes

- The frontend package uses a proxy to `http://localhost:4000`
- Workout creation requires `title`, `load`, and `reps`
- Signup requires a valid email and a strong password

## Possible Improvements

- add edit controls in the frontend UI for workout updates
- add loading and empty-state screens
- improve backend error handling and validation messages
- add tests for auth and workout routes
