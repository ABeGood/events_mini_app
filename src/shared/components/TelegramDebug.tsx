// Debug component to show Telegram WebApp info
import React from 'react';

export const TelegramDebug: React.FC = () => {
  const webApp = window.Telegram?.WebApp;
  
  if (!webApp) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'red', 
        color: 'white', 
        padding: '5px 10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        WebApp: NULL
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: 'green', 
      color: 'white', 
      padding: '5px 10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999
    }}>
      <div>WebApp: ✅</div>
      <div>Version: {webApp.version}</div>
      <div>Platform: {webApp.platform}</div>
      <div>VSwipes: {typeof webApp.disableVerticalSwipes === 'function' ? '✅' : '❌'}</div>
    </div>
  );
};