# BG Changer

A small React practice project that changes the full-page background color with a set of preset buttons.

## Overview

This app is a simple state-management exercise built with React and Vite. A single `useState` value controls the page background, and clicking a color button updates the whole screen instantly.

## Features

- Full-screen background color switching
- Preset color palette with quick action buttons
- Floating control bar fixed near the bottom of the page
- Utility-first styling with Tailwind CSS classes
- Fast development workflow with Vite

## Tech Stack

- React
- Vite
- Tailwind CSS
- ESLint

## Project Structure

```text
bg-changer/
  src/
    App.jsx
    main.jsx
  public/
  package.json
```

## How It Works

- The current background color is stored in React state.
- Each button calls `setColor(...)` with a different preset value.
- The selected color is applied inline to the main full-screen wrapper.

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

## Learning Focus

This project is useful for practicing:

- `useState`
- event handling in React
- dynamic inline styles
- basic UI layout with Tailwind CSS
