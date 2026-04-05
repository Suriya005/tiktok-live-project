import './styles/globals.css';
import { SocketProvider } from './contexts/SocketContext';

export const metadata = {
  title: 'TikTok Live Quiz Overlay',
  description: 'Real-time interactive quiz overlay for TikTok Live',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  );
}
