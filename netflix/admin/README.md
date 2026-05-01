# Netflix Admin Panel

**CRA + npm Setup**

This admin panel is built using **Create React App (CRA)** with **npm** package manager.

## ⚠️ Important Prerequisites

- **Node.js 16.20.2** required for Admin
- **npm 8.x** (not yarn)
- API and Client folders can use Node 22
- NVM for Windows: https://github.com/coreybutler/nvm-windows

## 📋 Requirements

- Node.js 16.20.2
- npm 8.x
- NVM (for Node version management)

## 🔧 Setup Steps (Sequence Matters)

### Step 1️⃣ - Navigate to Admin Folder

```bash
cd C:\Users\YCN\Desktop\React\NETFLIX\admin
```

### Step 2️⃣ - Switch Node Version (Admin Only)

```bash
nvm use 16.20.2
```

**Verify:**
```bash
node -v
# Output: v16.20.2
```

### Step 3️⃣ - Clean Previous Installation

Remove any yarn lock files and node_modules:

```powershell
Remove-Item yarn.lock -Force
Remove-Item node_modules -Recurse -Force
```

### Step 4️⃣ - Install Dependencies with npm

```bash
npm install
```

⚠️ **Note:** CRA + Material UI v4 will show warnings — this is normal and can be ignored.

### Step 5️⃣ - Verify npm Version

Node 16 requires npm 8.x:

```bash
npm install -g npm@8
```

**Verify:**
```bash
npm -v
# Output: 8.x
```





 ▶️ Run the Project

Start the development server:

```bash
npm start
```

The app will run at: **http://localhost:4000**

## 📦 Available npm Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server with hot reload |
| `npm test` | Run test suite in interactive watch mode |
| `npm run build` | Build production-optimized bundle |
| `npm run eject` | Expose all config files (⚠️ irreversible) |

> **Note:** `npm run dev` is not available in CRA projects. Use `npm start` instead.

## 📌 Key Reminders

- ✅ Uses **npm only** (no yarn)
- ✅ CRA-based with react-scripts
- ✅ Node 16 for Admin folder
- ✅ Node 22 for API and Client folders
- ✅ Material UI v4 warnings are expected

## 🔗 Useful Resources

- [Create React App Docs](https://facebook.github.io/create-react-app/docs/getting-started)
- [Deployment Guide](https://facebook.github.io/create-react-app/docs/deployment)
- [Build Troubleshooting](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
- [React Documentation](https://reactjs.org/)


---------------------------------------------------------------------------------------------------------------------------


# Netflix Admin Panel

**CRA + npm Setup**

This admin panel is built using **Create React App (CRA)** with **npm** as the package manager.

## ⚠️ Important Prerequisites

- **Node.js 16.20.2** (Admin only)
- **npm 8.x** (required for Node 16 compatibility)
- ❌ **Yarn is not used**
- API and Client folders can use **Node 22**
- NVM for Windows: https://github.com/coreybutler/nvm-windows

## 📋 Requirements

- Node.js 16.20.2  
- npm 8.x  
- NVM (Node Version Manager)

> **Why Node 16?**  
> This Admin panel uses Create React App with legacy dependencies (react-scripts, Material UI v4), which are not fully compatible with Node 22.

---

## 🔧 Setup Steps (Sequence Matters)

### Step 1️⃣ – Navigate to Admin Folder

```bash
cd C:\Users\YCN\Desktop\React\NETFLIX\admin
Step 2️⃣ – Switch Node Version (Admin Only)
nvm use 16.20.2
Verify:

node -v
# v16.20.2
Step 3️⃣ – Ensure Correct npm Version
Node 16 requires npm 8.x:

npm install -g npm@8
Verify:

npm -v
# 8.x
Step 4️⃣ – Clean Previous Installation
Remove yarn artifacts and old dependencies:

Remove-Item yarn.lock -Force
Remove-Item node_modules -Recurse -Force
⚠️ PowerShell command (Windows)
Remove files manually if using macOS/Linux.

Step 5️⃣ – Install Dependencies
npm install
⚠️ Note:
CRA + Material UI v4 may show warnings. These are expected and safe to ignore.

▶️ Run the Project
npm start
The application runs at:

👉 http://localhost:4000

(PORT is explicitly set in the project configuration)

📦 Available npm Commands
Command	Purpose
npm start	Start development server with hot reload
npm test	Run tests in watch mode
npm run build	Create production build
npm run eject	Expose CRA config (⚠️ irreversible)
Note:
npm run dev is not available in CRA projects.

📌 Key Reminders
✅ npm only (no yarn)

✅ CRA-based (react-scripts)

✅ Node 16 for Admin

✅ Node 22 for API & Client

✅ Material UI v4 warnings are expected