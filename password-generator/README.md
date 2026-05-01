# Password Generator

A React app that generates random passwords based on user-selected options such as length, numbers, and special characters.

## Overview

This project is built as a hands-on React hooks exercise. It demonstrates how to generate derived UI data from state changes and how to interact with the clipboard using a referenced input element.

## Features

- Adjustable password length using a range slider
- Optional inclusion of numbers
- Optional inclusion of special characters
- Auto-regenerates the password whenever options change
- One-click copy to clipboard
- Uses React hooks for logic and UI updates

## Tech Stack

- React
- Vite
- Tailwind CSS
- ESLint

## Project Structure

```text
password-generator/
  src/
    App.jsx
    main.jsx
  public/
  package.json
```

## Hook Usage

This project uses several React hooks:

- `useState` for password options and generated output
- `useCallback` for memoized generator and copy functions
- `useEffect` to regenerate the password when settings change
- `useRef` to select and copy the password field

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

## Current Rules

- Minimum password length: `6`
- Maximum password length: `100`
- Base character set: uppercase and lowercase English letters
- Numbers and special symbols are optional

## Possible Improvements

- add a password strength meter
- add an option to avoid ambiguous characters
- show a success message after copying
- include separate toggles for uppercase and lowercase letters
