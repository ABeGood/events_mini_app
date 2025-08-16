// src/hooks/useTelegramApp.ts - Enhanced iPhone support
import { useCallback, useEffect } from 'react';
import type { TelegramWebApp } from '../types/telegram';

export const useTelegramApp = () => {
    // Helper to safely access Telegram WebApp
    const getTelegramWebApp = useCallback((): TelegramWebApp | null => {
        return window.Telegram?.WebApp || null;
    }, []);

    // Detect if running on iPhone
    const isIPhone = useCallback(() => {
        return /iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
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

                // iPhone-specific initialization
                if (isIPhone()) {
                    // Force full viewport on iPhone
                    webApp.setHeaderColor?.('#000000');

                    // Disable closing confirmation immediately
                    if (typeof webApp.disableClosingConfirmation === 'function') {
                        webApp.disableClosingConfirmation();
                    }
                }

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
    }, [getTelegramWebApp, isIPhone]);

    // Simple haptic feedback utility
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


    // Track swipe direction for better prevention
    let touchStartY = 0;
    const handleTouchStart = useCallback((e: TouchEvent) => {
        touchStartY = e.touches[0]?.clientY || 0;

        // Check if touch is within a BottomSheet component
        const target = e.target as HTMLElement;
        const isInBottomSheet = target.closest('[data-bottomsheet="true"]');
        
        // If inside BottomSheet, let it handle its own gestures
        if (isInBottomSheet) {
            return;
        }

        // Prevent default immediately on iPhone for certain areas
        if (isIPhone()) {
            const touch = e.touches[0];
            if (touch && touch.clientY < window.innerHeight * 0.2) {
                e.preventDefault();
            }
        }
    }, [isIPhone]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isIPhone()) return;

        const touch = e.touches[0];
        if (!touch) return;

        // Check if touch is within a BottomSheet component
        const target = e.target as HTMLElement;
        const isInBottomSheet = target.closest('[data-bottomsheet="true"]');
        
        // If inside BottomSheet, let it handle its own gestures
        if (isInBottomSheet) {
            return;
        }

        const deltaY = touch.clientY - touchStartY;

        // Prevent downward swipes that could trigger app close
        if (deltaY > 10 && touchStartY < window.innerHeight * 0.3) {
            e.preventDefault();
            e.stopPropagation();
        }

    }, [isIPhone]);

    // Enhanced disable app swipes with iPhone-specific handling
    const disableAppSwipes = useCallback(() => {
        const webApp = getTelegramWebApp();

        if (webApp) {
            try {
                // Standard Telegram WebApp methods
                if (typeof webApp.disableVerticalSwipes === 'function') {
                    webApp.disableVerticalSwipes();
                }

                // Ensure app is fully expanded and locked
                webApp.expand();

                // Disable closing confirmation
                if (typeof webApp.disableClosingConfirmation === 'function') {
                    webApp.disableClosingConfirmation();
                }

                // iPhone-specific additional measures
                if (isIPhone()) {
                    // Force viewport settings
                    const viewport = document.querySelector('meta[name="viewport"]');
                    if (viewport) {
                        viewport.setAttribute('content',
                            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
                        );
                    }

                    // Add CSS to prevent iOS gestures
                    const style = document.createElement('style');
                    style.textContent = `
                        html, body {
                            overscroll-behavior: none;
                            -webkit-overflow-scrolling: touch;
                            touch-action: pan-x pan-y;
                            position: fixed;
                            width: 100%;
                            height: 100%;
                        }
                        
                        .telegram-app-container {
                            touch-action: pan-x pan-y;
                            overscroll-behavior: none;
                            -webkit-overflow-scrolling: touch;
                        }
                        
                        /* Prevent pull-to-refresh */
                        body {
                            overflow: hidden;
                        }
                    `;
                    document.head.appendChild(style);
                }

                console.log('Telegram app swipes disabled');
            } catch (error) {
                console.warn('Failed to disable app swipes:', error);
            }
        }
    }, [getTelegramWebApp, isIPhone]);

    // Dynamic prevention of app swipes during interactions
    const preventAppSwipes = useCallback((prevent: boolean = true) => {
        if (prevent) {
            if (isIPhone()) {
                // Enhanced iPhone handling
                document.addEventListener('touchstart', handleTouchStart, { passive: false });
                document.addEventListener('touchmove', handleTouchMove, { passive: false });
            }
        } else {
            // Remove all event listeners
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchmove', handleTouchMove);
        }
    }, [handleTouchStart, handleTouchMove, isIPhone]);

    // Auto-enable comprehensive swipe prevention on mount for iPhone
    useEffect(() => {
        if (isIPhone()) {
            preventAppSwipes(true);

            // Cleanup on unmount
            return () => preventAppSwipes(false);
        }
    }, [preventAppSwipes, isIPhone]);

    // Re-enable Telegram app-level vertical swipes
    const enableAppSwipes = useCallback(() => {
        const webApp = getTelegramWebApp();

        if (webApp) {
            try {
                if (typeof webApp.enableVerticalSwipes === 'function') {
                    webApp.enableVerticalSwipes();
                }

                if (typeof webApp.enableClosingConfirmation === 'function') {
                    webApp.enableClosingConfirmation();
                }

                console.log('Telegram app swipes enabled');
            } catch (error) {
                console.warn('Failed to enable app swipes:', error);
            }
        }
    }, [getTelegramWebApp]);

    // Utility methods for common Telegram WebApp operations
    const telegramUtils = useCallback(() => {
        const webApp = getTelegramWebApp();

        return {
            isAvailable: !!webApp,
            isIPhone: isIPhone(),
            showAlert: (message: string, callback?: () => void) => webApp?.showAlert?.(message, callback),
            showConfirm: (message: string, callback?: (confirmed: boolean) => void) => webApp?.showConfirm?.(message, callback),
            platform: webApp?.platform || 'unknown',
            version: webApp?.version || 'unknown'
        };
    }, [getTelegramWebApp, isIPhone]);

    return {
        initializeTelegramApp,
        triggerHaptic,
        disableAppSwipes,
        enableAppSwipes,
        preventAppSwipes,
        telegramUtils,
        isIPhone
    };
};