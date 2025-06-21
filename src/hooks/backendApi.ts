// src/hooks/useBackendApi.ts
import { useState, useEffect } from 'react';
import { apiService } from '../backend_api';

export interface BackendState {
    message: string;
    status: 'idle' | 'loading' | 'success' | 'error';
    events: any[];
}

export const useBackendApi = () => {
    const [backendMessage, setBackendMessage] = useState<string>('');
    const [backendStatus, setBackendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [apiEvents, setApiEvents] = useState<any[]>([]);

    const testBackendConnection = async () => {
        try {
            setBackendStatus('loading');

            // Test health check first
            const healthResponse = await apiService.healthCheck();
            console.log('Health check:', healthResponse);

            // Get main message
            const messageResponse = await apiService.getMessage();
            setBackendMessage(messageResponse.message);

            // Get events from backend
            const eventsResponse = await apiService.getEvents();
            setApiEvents(eventsResponse.events);

            setBackendStatus('success');

            // Show success in Telegram
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert(`✅ Backend connected! ${messageResponse.message}`);
            }

            // Haptic feedback for success
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

        } catch (error) {
            console.error('Backend connection failed:', error);
            setBackendStatus('error');
            setBackendMessage('Failed to connect to backend');

            // Show error in Telegram
            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert(`❌ Backend connection failed: ${error}`);
            }

            // Haptic feedback for error
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }
        }
    };

    const testApiCall = async () => {
        try {
            setBackendStatus('loading');
            const response = await apiService.getMessage();
            setBackendMessage(response.message);
            setBackendStatus('success');

            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert(`🚀 ${response.message}`);
            }

            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
            }
        } catch (error) {
            console.error('Test failed:', error);
            setBackendStatus('error');
            setBackendMessage('Connection failed');

            if (window.Telegram?.WebApp?.showAlert) {
                window.Telegram.WebApp.showAlert(`❌ Error: ${error}`);
            }
        }
    };

    useEffect(() => {
        // Test connection when hook mounts
        if (window.Telegram?.WebApp) {
            testBackendConnection();
        }
    }, []);

    return {
        backendMessage,
        backendStatus,
        apiEvents,
        testApiCall,
        testBackendConnection
    };
};