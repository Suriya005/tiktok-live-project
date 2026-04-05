'use client';

import Overlay from '../components/Overlay';

export default function OverlayPage() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Overlay />
    </div>
  );
}
