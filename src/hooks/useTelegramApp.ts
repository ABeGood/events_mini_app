// src/hooks/useTelegramApp.ts - App-level concerns only
import { useCallback } from 'react';
import type { TelegramWebApp } from '../types/telegram';

export const useTelegramApp = () => {
    // Helper to safely access Telegram WebApp
    const getTelegramWebApp = useCallback((): TelegramWebApp | null => {
        return window.Telegram?.WebApp || null;
    }, []);

    // App-level Telegram setup
    const initializeTelegramApp = useCallback(() => {
        const webApp = getTelegramWebApp();

        if (webApp) {
            try {
                // Expand the app to full height
                webApp.expand();

                // Set app ready
                webApp.ready();

                console.log('Telegram WebApp initialized');
                return true;
            } catch (error) {
                console.warn('Telegram WebApp initialization failed:', error);
                return false;
            }
        } else {
            console.warn('Telegram WebApp not available - running in development mode?');
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

    // Disable Telegram app-level vertical swipes (swipe-to-minimize)
    const disableAppSwipes = useCallback(() => {
        const webApp = getTelegramWebApp();

        if (webApp) {
            try {
                // Method 1: Disable vertical swipes (if available in newer versions)
                if (typeof webApp.disableVerticalSwipes === 'function') {
                    webApp.disableVerticalSwipes();
                }

                // Method 2: Ensure app is fully expanded and locked
                webApp.expand();

                // Method 3: Disable closing confirmation to prevent accidental exits
                if (typeof webApp.disableClosingConfirmation === 'function') {
                    webApp.disableClosingConfirmation();
                }

                console.log('Telegram app swipes disabled');
            } catch (error) {
                console.warn('Failed to disable app swipes:', error);
            }
        }
    }, [getTelegramWebApp]);

    // Re-enable Telegram app-level vertical swipes
    const enableAppSwipes = useCallback(() => {
        const webApp = getTelegramWebApp();

        if (webApp) {
            try {
                // Re-enable vertical swipes (if available)
                if (typeof webApp.enableVerticalSwipes === 'function') {
                    webApp.enableVerticalSwipes();
                }

                // Re-enable closing confirmation
                if (typeof webApp.enableClosingConfirmation === 'function') {
                    webApp.enableClosingConfirmation();
                }

                console.log('Telegram app swipes enabled');
            } catch (error) {
                console.warn('Failed to enable app swipes:', error);
            }
        }
    }, [getTelegramWebApp]);

    // Helper function to prevent default touch behavior
    const preventDefaultTouch = useCallback((e: TouchEvent) => {
        // Only prevent if swipe is starting from bottom area (where bottom sheet is)
        const touch = e.touches?.[0] || e.changedTouches?.[0];
        if (touch && touch.clientY > window.innerHeight * 0.6) {
            e.preventDefault();
        }
    }, []);

    // Dynamic prevention of app swipes during bottom sheet interactions
    const preventAppSwipes = useCallback((prevent: boolean = true) => {
        if (prevent) {
            // Prevent default touch behavior at document level
            document.addEventListener('touchstart', preventDefaultTouch, { passive: false });
            document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
            document.addEventListener('touchend', preventDefaultTouch, { passive: false });
        } else {
            // Remove event listeners
            document.removeEventListener('touchstart', preventDefaultTouch);
            document.removeEventListener('touchmove', preventDefaultTouch);
            document.removeEventListener('touchend', preventDefaultTouch);
        }
    }, [preventDefaultTouch]);

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

    return {
        initializeTelegramApp,
        triggerHaptic,
        disableAppSwipes,
        enableAppSwipes,
        preventAppSwipes,
        telegramUtils
    };
};