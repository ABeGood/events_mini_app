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
        telegramUtils
    };
};