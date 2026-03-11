# Daily Journal

A modern, responsive daily journaling application built with React, TypeScript, and Vite. It allows users to write daily entries, view past entries, and get a monthly summary of their journaling habits.

## Features

- **Dashboard:** Overview of your journal entries.
- **New Entry:** Write and save a new journal entry for the day.
- **View & Edit:** Read past entries and make changes if needed.
- **Monthly Summary:** View summaries and statistics of your monthly journaling activities.
- **Settings:** Customize your journaling experience.
- **Responsive Design:** Optimized for both desktop and mobile viewing.

## Tech Stack

- **Framework:** React 18, Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **Routing:** React Router DOM
- **Data Fetching:** React Query (@tanstack/react-query)
- **Forms & Validation:** React Hook Form + Zod
- **Icons & Utilities:** lucide-react, date-fns, sonner, recharts

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have Node.js and npm (or bun) installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone <YOUR_GIT_URL>
   cd daily-journal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the URL provided in the terminal).

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to find and fix issues.
- `npm run preview`: Previews the production build locally.
- `npm run test`: Runs tests using Vitest.
