// src/hooks/useTelegramGestures.ts
import { useCallback, useEffect, useRef } from 'react';
import type { TelegramWebApp } from '../types/telegram';

export interface GestureState {
    isGestureActive: boolean;
    gestureDirection: 'up' | 'down' | null;
    gestureDistance: number;
    velocity?: number;
    momentum?: number;
}

export const useTelegramGestures = () => {
    const gestureState = useRef<GestureState>({
        isGestureActive: false,
        gestureDirection: null,
        gestureDistance: 0
    });

    const isSwipeDisabled = useRef<boolean>(false);

    // Helper to safely access Telegram WebApp
    const getTelegramWebApp = useCallback((): TelegramWebApp | null => {
        return window.Telegram?.WebApp || null;
    }, []);

    // Control Telegram's native swipe behavior - GESTURE-SPECIFIC
    const disableTelegramSwipe = useCallback(() => {
        const webApp = getTelegramWebApp();
        if (!isSwipeDisabled.current && webApp?.disableVerticalSwipes) {
            try {
                webApp.disableVerticalSwipes();
                isSwipeDisabled.current = true;
                console.debug('Telegram vertical swipes disabled');
            } catch (error) {
                console.warn('Failed to disable Telegram swipes:', error);
            }
        }
    }, [getTelegramWebApp]);

    const enableTelegramSwipe = useCallback(() => {
        const webApp = getTelegramWebApp();
        if (isSwipeDisabled.current && webApp?.enableVerticalSwipes) {
            try {
                webApp.enableVerticalSwipes();
                isSwipeDisabled.current = false;
                console.debug('Telegram vertical swipes enabled');
            } catch (error) {
                console.warn('Failed to enable Telegram swipes:', error);
            }
        }
    }, [getTelegramWebApp]);

    // Gesture-specific haptic feedback
    const triggerGestureHaptic = useCallback((
        type: 'impact' | 'selection',
        style?: 'light' | 'medium' | 'heavy'
    ) => {
        try {
            const webApp = getTelegramWebApp();
            const haptic = webApp?.HapticFeedback;
            if (!haptic) return;

            switch (type) {
                case 'impact':
                    haptic.impactOccurred(style || 'light');
                    break;
                case 'selection':
                    haptic.selectionChanged();
                    break;
            }
        } catch (error) {
            console.warn('Gesture haptic feedback failed:', error);
        }
    }, [getTelegramWebApp]);

    // Core gesture detection functionality
    const createGestureHandler = useCallback((
        onGestureStart?: (e: TouchEvent) => boolean, // return true to capture gesture
        onGestureMove?: (e: TouchEvent, state: GestureState) => void,
        onGestureEnd?: (e: TouchEvent, state: GestureState) => void
    ) => {
        let startY = 0;
        let startTime = 0;
        let lastY = 0;
        let lastTime = 0;
        let velocity = 0;
        let capturedGesture = false;

        const onTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch) return;

            startY = touch.clientY;
            lastY = touch.clientY;
            startTime = Date.now();
            lastTime = startTime;
            velocity = 0;
            capturedGesture = false;

            gestureState.current = {
                isGestureActive: true,
                gestureDirection: null,
                gestureDistance: 0
            };

            // Let the component decide if it wants to capture this gesture
            if (onGestureStart) {
                capturedGesture = onGestureStart(e);
                if (capturedGesture) {
                    disableTelegramSwipe();
                    e.stopPropagation();
                }
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!gestureState.current.isGestureActive) return;

            const touch = e.touches[0];
            if (!touch) return;

            const currentY = touch.clientY;
            const currentTime = Date.now();
            const deltaY = currentY - startY;
            const timeDelta = currentTime - lastTime;

            // Calculate velocity (pixels per millisecond)
            if (timeDelta > 0) {
                velocity = (currentY - lastY) / timeDelta;
            }

            const direction = deltaY > 0 ? 'down' : 'up';

            gestureState.current = {
                isGestureActive: true,
                gestureDirection: direction,
                gestureDistance: Math.abs(deltaY),
                velocity: Math.abs(velocity)
            };

            lastY = currentY;
            lastTime = currentTime;

            if (capturedGesture) {
                e.preventDefault();
                e.stopPropagation();
            }

            onGestureMove?.(e, gestureState.current);
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (!gestureState.current.isGestureActive) return;

            // Calculate final velocity and momentum
            const finalState: GestureState = {
                ...gestureState.current,
                velocity: Math.abs(velocity),
                momentum: Math.abs(velocity) * gestureState.current.gestureDistance
            };

            if (capturedGesture) {
                e.preventDefault();
                e.stopPropagation();
                enableTelegramSwipe();
            }

            onGestureEnd?.(e, finalState);

            // Reset state
            gestureState.current = {
                isGestureActive: false,
                gestureDirection: null,
                gestureDistance: 0
            };
        };

        return {
            onTouchStart,
            onTouchMove,
            onTouchEnd,
            options: { passive: false } as AddEventListenerOptions
        };
    }, [disableTelegramSwipe, enableTelegramSwipe]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            enableTelegramSwipe();
        };
    }, [enableTelegramSwipe]);

    return {
        createGestureHandler,
        triggerHaptic: triggerGestureHaptic,
        gestureState: gestureState.current
    };
};