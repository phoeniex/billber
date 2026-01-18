# Billber - Project Structure

This document provides a detailed overview of the codebase organization and the purpose of each directory and file.

## 📁 File Structure

```text
billber/
├── 📄 Root Configuration
│   ├── package.json              # Main project dependencies and scripts
│   ├── tsconfig.json             # TypeScript compiler settings
│   ├── vite.config.ts            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind CSS styling configuration
│   └── .env                      # Environment variables (Firebase keys, etc.)
│
├── 📂 src/                       # Application Source Code
│   ├── 📄 main.tsx               # Application entry point
│   ├── 📄 App.tsx                # Primary layout and routing logic
│   ├── 📄 index.css              # Global styles and Tailwind imports
│   │
│   ├── 📂 components/            # React Components
│   │   ├── 📂 ui/                # Base UI components (Header, DatePicker, Icons)
│   │   └── 📂 features/          # High-level feature modules
│   │       ├── 📂 bills/         # Bill list, row, and management forms
│   │       ├── 📂 calendar/      # Interactive calendar visualization
│   │       ├── 📂 settings/      # Configuration modals and controls
│   │       └── 📂 notifications/ # Toast and alert systems
│   │
│   ├── 📂 contexts/              # Global State (AuthContext)
│   ├── 📂 hooks/                 # Custom React Hooks
│   │   ├── useBills.ts           # Central bill state & localStorage logic
│   │   ├── useCurrency.ts        # Currency and Locale management
│   │   ├── useTheme.ts           # Dark/Light mode toggle
│   │   └── useBillChecker.ts     # Automated background due-date monitoring
│   │
│   ├── 📂 types/                 # TypeScript interfaces and enums
│   ├── 📂 utils/                 # Pure helper functions (formatting, math)
│   └── 📂 assets/                # Static images and icons
```

## 🎯 Core Logic Flow

### 1. Data Persistence
All bill data is managed via the `useBills` hook, which synchronizes the application state with `localStorage` (or Firebase if configured) to ensure data persists across sessions.

### 2. Categorization Engine
The `BillsList` component uses a categorization engine to group bills into time-based buckets:
- `overdue`: Due date is in the past.
- `thisWeek`: Due within the next 7 days.
- `laterThisMonth`: Due after 7 days but within the current month.
- `upcomingMonth`: Due in future months.

### 3. Localization
The `useCurrency` hook handles global localization, allowing the app to dynamically switch between different currencies and date formatting styles without page reloads.

### 4. Background Monitoring
The `useBillChecker` hook runs in the background to monitor upcoming due dates and triggers the notification system when bills are approaching their deadlines.

## 🚀 Getting Started

1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`
