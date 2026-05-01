# Brand Page

A simple React landing page for a shoe brand with a clean hero layout, call-to-action buttons, and marketplace branding.

## Overview

This project is a UI-focused practice build. It recreates a marketing-style landing page with a navigation bar, a bold headline, product imagery, and quick shopping actions.

## Features

- Header navigation with logo, menu links, and login button
- Hero section with strong product-focused headline
- Primary and secondary call-to-action buttons
- Marketplace icons for Amazon and Flipkart
- Product image section for a catalog-style landing page

## Tech Stack

- React
- Vite
- CSS
- ESLint

## Project Structure

```text
brand-page/
  public/
    images/
  src/
    Components/
      Hero.jsx
      Navigation.jsx
    App.jsx
    App.css
    main.jsx
  package.json
```

## Component Breakdown

- `Navigation.jsx` renders the logo, menu items, and login button
- `Hero.jsx` renders the headline, description, action buttons, and shopping platform logos
- `public/images` stores the static branding and product assets used by the page

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

## Project Goal

This project is best viewed as a front-end layout exercise for practicing:

- component-based page structure
- static landing page composition
- asset handling in `public/`
- CTA-first UI design
