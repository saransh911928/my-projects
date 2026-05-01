# EV Website

A React landing page project for an electric vehicle themed website with rotating hero content and switchable media backgrounds.

## Overview

This project focuses on building a visually rich single-page experience. The homepage rotates through different hero text combinations, allows manual slide selection, and can switch from static background images to a looping background video.

## Features

- Auto-rotating hero text content
- Manual hero navigation using dot controls
- Switch between image backgrounds and a looping video
- Dedicated reusable components for navbar, hero section, and background
- Simple animated landing-page experience built with React state

## Tech Stack

- React
- Vite
- CSS
- ESLint

## Project Structure

```text
ev-website/
  src/
    Components/
      Background/
      Hero/
      Navbar/
    App.jsx
    main.jsx
  public/
  package.json
```

## How It Works

- `App.jsx` stores the current hero slide index and video play state.
- The hero text rotates automatically every 3 seconds.
- The `Background` component chooses between three images or a video based on state.
- The `Hero` component lets the user switch slides and toggle play/pause behavior.

## Getting Started

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal, usually `http://localhost:5173`.

## Available Scripts

- `npm run dev` - start the development server
- `npm run build` - create a production build
- `npm run preview` - preview the production build locally
- `npm run lint` - run ESLint

## Good Practice Areas in This Project

- breaking UI into reusable components
- passing state and setters through props
- using `useEffect` for timed UI changes
- handling media-rich landing page layouts
