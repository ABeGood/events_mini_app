// Debug component to show Telegram WebApp info
import React from 'react';
import { useTelegramApp } from '../../hooks/useTelegramApp';

export const TelegramDebug: React.FC = () => {
  const { isWebAppReady, loadAttempts } = useTelegramApp();
  const webApp = window.Telegram?.WebApp;
  
  // Show loading state
  if (!webApp && loadAttempts > 0 && loadAttempts < 10) {
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'orange', 
        color: 'white', 
        padding: '5px 10px', 
        borderRadius: '5px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        <div>Loading... ({loadAttempts}/10)</div>
        <div>Waiting for Telegram</div>
      </div>
    );
  }
  
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
        <div>WebApp: NULL</div>
        <div>Attempts: {loadAttempts}</div>
        <div>Script: {window.Telegram ? '✅' : '❌'}</div>
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
      <div>WebApp: ✅ ({loadAttempts === 0 ? 'instant' : `${loadAttempts} retries`})</div>
      <div>Version: {webApp.version}</div>
      <div>Platform: {webApp.platform}</div>
      <div>VSwipes: {typeof webApp.disableVerticalSwipes === 'function' ? '✅' : '❌'}</div>
      <div>Ready: {isWebAppReady ? '✅' : '⏳'}</div>
    </div>
  );
};