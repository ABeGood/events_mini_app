// src/hooks/backendApi.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../backend_api/backend_api';
import { BackendEvent } from '../types/index';

type BackendStatus = 'idle' | 'loading' | 'success' | 'error';

// Event adapter function
const adaptApiEventToBackendEvent = (apiEvent: any): BackendEvent | null => {
    // Validate required properties
    if (!apiEvent || typeof apiEvent.id !== 'string') {
        console.warn('Invalid event - missing or invalid id:', apiEvent);
        return null;
    }

    if (!apiEvent.venue.address || typeof apiEvent.venue.address !== 'string') {
        console.warn('Invalid event - missing or invalid title:', apiEvent);
        return null;
    }

    if (!apiEvent.venue.city || typeof apiEvent.venue.city !== 'string') {
        console.warn('Invalid event - missing or invalid category:', apiEvent);
        return null;
    }

    if (typeof apiEvent.venue.location !== 'object' || apiEvent.venue.location === null ||
        !('latitude' in apiEvent.venue.location) || !('longitude' in apiEvent.venue.location) ||
        typeof apiEvent.venue.location.latitude !== 'string' || typeof apiEvent.venue.location.longitude !== 'string') {
        console.warn('Invalid event - invalid location (expected object with latitude and longitude numbers):', apiEvent);
        return null;
    }

    const lat = parseFloat(apiEvent.venue.location.latitude);
    const lng = parseFloat(apiEvent.venue.location.longitude);

    // 2. Validate if conversion was successful (i.e., they are valid numbers)
    if (isNaN(lat) || isNaN(lng)) {
        console.warn('Invalid event - location coordinates must be valid numbers:', apiEvent);
        return null;
    }

    // Return properly typed BackendEvent
    return {
        id: apiEvent.id,
        title: apiEvent.title,
        category: apiEvent.category,
        image: apiEvent.image || 'https://i.imgur.com/uIgDDDd.png', // Default image
        location: [lng, lat] as [number, number],
        description: apiEvent.description || ''
    };
};


const adaptApiEventsToBackendEvents = (apiEvents: any[]): BackendEvent[] => {
    if (!Array.isArray(apiEvents)) {
        console.warn('API events is not an array:', apiEvents);
        return [];
    }

    return apiEvents
        .map(adaptApiEventToBackendEvent)
        .filter((event): event is BackendEvent => event !== null);
};


export const useBackendApi = () => {
    const [apiEvents, setApiEvents] = useState<BackendEvent[]>([]);
    const [backendStatus, setBackendStatus] = useState<BackendStatus>('idle');
    const [error, setError] = useState<string | null>(null);
    const [backendMessage, setBackendMessage] = useState<string>('Ready');

    const fetchEvents = useCallback(async () => {
        try {
            setBackendStatus('loading');
            setError(null);
            setBackendMessage('Fetching events...');

            console.log('Fetching events from API...');
            const response = await apiService.getEvents();
            console.log('Events fetched successfully:', response);

            const adaptedEvents = adaptApiEventsToBackendEvents(response.events || []);
            console.log('Adapted events:', adaptedEvents);

            setApiEvents(adaptedEvents);
            setBackendStatus('success');
            setBackendMessage(`Loaded ${adaptedEvents.length} valid events`);

        } catch (err) {
            console.error('Failed to fetch events:', err);
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            setError(errorMessage);
            setBackendStatus('error');
            setBackendMessage(`Error: ${errorMessage}`);
            setApiEvents([]);
        }
    }, []);

    // Auto-fetch on mount
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return {
        apiEvents,
        backendStatus,
        error,
        backendMessage,
        fetchEvents
    };
};