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

### Initial Setup Workflow

Follow these steps to get the project running locally on your machine along with its backend (Supabase).

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

3. **Set up Environment Variables:**
   - Copy the example environment file to create your local version:
     ```bash
     cp .env.example .env
     ```
   - Open your new `.env` file and replace the placeholder values with your Supabase project credentials.

4. **Set up Supabase Backend:**
   - Create a new project on [Supabase.com](https://supabase.com/).
   - Go to the **SQL Editor** in your Supabase Dashboard.
   - Open the `supabase-setup.sql` file from this repository and run the SQL script to create the required tables, Row Level Security (RLS) policies, and storage buckets.
   - Go to **Project Settings -> API** to get your `Project URL` and `anon public` key. Paste these into your `.env` file.

5. **Set up OAuth Providers (Social Login):**
   - Head over to **Authentication -> Providers** in your Supabase Dashboard.
   - Enable **Google**:
     - Create an OAuth Client in the Google Cloud Console.
     - Provide the required `Client ID` and `Client Secret` to Supabase.
   - Enable **GitHub**:
     - Create an OAuth App in GitHub Developer Settings.
     - Provide the `Client ID` and `Client Secret` to Supabase.
   - Enable **Apple**:
     - Follow the Supabase guides to upload your Apple Service ID and secret key.
   - *Note: No additional client-side environment variables are needed for OAuth; the `VITE_SUPABASE_URL` is enough because Supabase handles provider secure keys on its servers.*

6. **Start the development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

7. Open your browser and navigate to `http://localhost:5173`.

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Runs ESLint to find and fix issues.
- `npm run preview`: Previews the production build locally.
- `npm run test`: Runs tests using Vitest.
