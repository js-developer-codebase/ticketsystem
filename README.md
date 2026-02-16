# Ticket Support System

A modern, full-stack support ticket management system built with Next.js 15, TypeScript, and MongoDB.

## Features

- **Authentication**: Secure JWT-based authentication with role-based access control (Admin/User).
- **Ticket Management**: Create, view, edit, and soft-delete tickets with status and priority levels.
- **Infinite Scrolling**: Modern UI with infinite scroll for efficient ticket browsing using React Query.
- **Responsive Design**: Clean and professional UI built with Tailwind CSS and shadcn/ui.
- **Advanced UI/UX**: Smooth micro-animations powered by Framer Motion.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/), [Lucide React Icons](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Forms**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Backend**: [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Auth**: [JWT](https://jwt.io/), [BcryptJS](https://github.com/dcodeIO/bcrypt.js)

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB instance (Local or Atlas)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/js-developer-codebase/ticketsystem.git
   cd ticket-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable UI components (shadcn/ui).
- `src/context`: React Context providers (Auth).
- `src/models`: Mongoose database schemas.
- `src/services`: Business logic layer.
- `src/repositories`: Data access layer.
- `src/middleware`: Authentication and authorization logic.
