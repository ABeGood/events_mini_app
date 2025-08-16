// src/hooks/useTelegramApp.ts - App-level concerns only
import { useCallback, useEffect, useState } from 'react';
import type { TelegramWebApp } from '../types/telegram';

export const useTelegramApp = () => {
    const [isWebAppReady, setIsWebAppReady] = useState(false);
    const [loadAttempts, setLoadAttempts] = useState(0);

    // Helper to safely access Telegram WebApp
    const getTelegramWebApp = useCallback((): TelegramWebApp | null => {
        return window.Telegram?.WebApp || null;
    }, []);

    // Check for WebApp availability with retries
    useEffect(() => {
        const checkWebApp = () => {
            const webApp = getTelegramWebApp();
            if (webApp) {
                console.log('✅ Telegram WebApp detected:', webApp.version);
                setIsWebAppReady(true);
                return true;
            }
            return false;
        };

        // Immediate check
        if (checkWebApp()) return;

        // Retry mechanism for script loading
        const retryInterval = setInterval(() => {
            setLoadAttempts(prev => prev + 1);
            
            if (checkWebApp()) {
                clearInterval(retryInterval);
                return;
            }

            // Stop retrying after 10 attempts (5 seconds)
            if (loadAttempts >= 10) {
                console.warn('❌ Telegram WebApp not available after 5 seconds');
                console.warn('This usually means:');
                console.warn('1. App is not running inside Telegram');
                console.warn('2. Telegram script failed to load');
                console.warn('3. Network connectivity issues');
                clearInterval(retryInterval);
            }
        }, 500);

        return () => clearInterval(retryInterval);
    }, [getTelegramWebApp, loadAttempts]);

    // App-level Telegram setup
    const initializeTelegramApp = useCallback(() => {
        const webApp = getTelegramWebApp();

        if (webApp) {
            try {
                // Expand the app to full height
                webApp.expand();

                // Set app ready
                webApp.ready();

                // Disable vertical swipes if available
                if (typeof webApp.disableVerticalSwipes === 'function') {
                    webApp.disableVerticalSwipes();
                }

                console.log('Telegram WebApp initialized successfully');
                return true;
            } catch (error) {
                console.warn('Telegram WebApp initialization failed:', error);
                return false;
            }
        } else {
            console.warn('Telegram WebApp not available. Possible reasons:');
            console.warn('1. Running in development mode (outside Telegram)');
            console.warn('2. Telegram script not loaded');
            console.warn('3. App not opened through Telegram');
            return false;
        }
    }, [getTelegramWebApp]);

    // Simple haptic feedback utility (without gesture complexity)
    const triggerHaptic = useCallback((
        type: 'impact' | 'notification' | 'selection',
        style?: 'light' | 'medium' | 'heavy' | 'error' | 'success' | 'warning'
    ) => {
        try {
            const webApp = getTelegramWebApp();
            const haptic = webApp?.HapticFeedback;
            if (!haptic) return;

            switch (type) {
                case 'impact':
                    haptic.impactOccurred((style as 'light' | 'medium' | 'heavy') || 'light');
                    break;
                case 'notification':
                    haptic.notificationOccurred((style as 'error' | 'success' | 'warning') || 'success');
                    break;
                case 'selection':
                    haptic.selectionChanged();
                    break;
            }
        } catch (error) {
            console.warn('Haptic feedback failed:', error);
        }
    }, [getTelegramWebApp]);

    // Utility methods for common Telegram WebApp operations
    const telegramUtils = useCallback(() => {
        const webApp = getTelegramWebApp();

        return {
            isAvailable: !!webApp,
            showAlert: (message: string, callback?: () => void) => webApp?.showAlert?.(message, callback),
            showConfirm: (message: string, callback?: (confirmed: boolean) => void) => webApp?.showConfirm?.(message, callback),
            platform: webApp?.platform || 'unknown',
            version: webApp?.version || 'unknown'
        };
    }, [getTelegramWebApp]);

    // Helper functions for vertical swipes control
    const disableVerticalSwipes = useCallback(() => {
        const webApp = getTelegramWebApp();
        if (webApp && typeof webApp.disableVerticalSwipes === 'function') {
            webApp.disableVerticalSwipes();
        }
    }, [getTelegramWebApp]);

    const enableVerticalSwipes = useCallback(() => {
        const webApp = getTelegramWebApp();
        if (webApp && typeof webApp.enableVerticalSwipes === 'function') {
            webApp.enableVerticalSwipes();
        }
    }, [getTelegramWebApp]);

    return {
        initializeTelegramApp,
        triggerHaptic,
        telegramUtils,
        disableVerticalSwipes,
        enableVerticalSwipes,
        isWebAppReady,
        loadAttempts
    };
};