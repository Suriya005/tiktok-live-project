# TikTok Live Quiz Frontend

Next.js React application for OBS overlay display and admin control panel.

## Requirements

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file (copy from `.env.example`):
```bash
cp .env.example .env.local
# Edit .env.local with your backend URL
```

3. Start development server:
```bash
npm run dev
```

4. Access:
- Overlay: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## Build for Production

```bash
npm run build
npm start
```

## Pages

### `/` - Quiz Overlay
Real-time question display, winner notifications, and gift alerts. Perfect for OBS overlay.

### `/admin` - Admin Panel
Manage questions, start/skip questions, connect to TikTok, and monitor leaderboard.

## Features

### Overlay Display
- Real-time question display with category and points
- Animated winner notifications with points
- Gift notification system
- Coin progress bar for hint unlock
- Hint display when triggered
- Connection status indicator

### Admin Panel
- TikTok Live connection management
- Question creation interface
- Question list with quick start
- Real-time leaderboard (top 10)
- Quiz control (skip question)
- Session management

## Socket.io Connection

Frontend automatically connects to backend Socket.io server on load.

**Environment Variables:**
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (default: http://localhost:5000)
- `NEXT_PUBLIC_SOCKET_URL` - Socket.io server URL (default: http://localhost:5000)

## Component Structure

```
app/
├── components/
│   ├── Overlay.jsx      - Main overlay display component
│   └── AdminPanel.jsx   - Admin control panel component
├── contexts/
│   └── SocketContext.js - Socket.io connection provider
├── services/
│   └── api.js          - API client functions
├── styles/
│   ├── globals.css     - Global styles
│   └── overlay.css     - Overlay-specific styles
├── admin/
│   └── page.js         - Admin page
├── layout.js           - Root layout
└── page.js            - Overlay page
```

## Styling

The project uses custom CSS with:
- Cyberpunk/neon theme (cyan, yellow, green, magenta)
- Smooth animations (slideIn, fadeIn, slideUp, pulse)
- Responsive design
- Dark gradient backgrounds
- Glowing effects

## Troubleshooting

**Cannot connect to backend**
- Ensure backend server is running on port 5000
- Check `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
- Check browser console for connection errors

**Questions not loading**
- Verify backend is running
- Check MongoDB connection in backend
- View browser console for API errors

**Overlay not showing correctly**
- Check if port 3000 is available
- Try clearing browser cache
- Check z-index conflicts in console

## Deployment

### Docker

```bash
docker build -t tiktok-quiz-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_BACKEND_URL=http://your-backend:5000 tiktok-quiz-frontend
```

### Vercel

```bash
vercel
```

Set environment variables in Vercel dashboard:
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_SOCKET_URL`
