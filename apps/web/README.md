# Chat App Frontend

A modern, real-time chat application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **User Authentication**: Sign up and sign in with username, email, and password
- **Real-time Chat**: WebSocket-based messaging with instant delivery
- **Room Management**: Create and join chat rooms
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support

## Getting Started

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Start the development server**:
   ```bash
   pnpm dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with username, email, and password
2. **Sign In**: Use your credentials to log in
3. **Create Room**: Click "Create Room" to create a new chat room
4. **Join Room**: Click on any room in the sidebar to join it
5. **Chat**: Type messages and press Enter or click Send

## Backend Requirements

Make sure the backend services are running:
- HTTP Backend (port 3001): `pnpm dev --filter=http-backend`
- WebSocket Backend (port 8080): `pnpm dev --filter=ws-backend`

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **WebSocket** - Real-time communication
- **Turborepo** - Monorepo management

## Project Structure

```
apps/web/
├── app/
│   ├── page.tsx          # Landing page
│   ├── login/page.tsx    # Sign in page
│   ├── signup/page.tsx   # Sign up page
│   ├── chat/page.tsx     # Main chat interface
│   └── globals.css       # Global styles
├── tailwind.config.js    # Tailwind configuration
└── package.json
```