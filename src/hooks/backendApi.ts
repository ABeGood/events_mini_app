// src/hooks/backendApi.ts
import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../backend_api/backend_api';
import { BackendEvent, 
        EventStatus, 
        EventVenue, 
        EventClassifications, 
        EventImage, 
        ImageRatio, 
        PriceRange 
} from '../types/event';

type BackendStatus = 'idle' | 'loading' | 'success' | 'error';

const adaptApiEventsToBackendEvents = (apiEvents: any[]): BackendEvent[] => {
    if (!Array.isArray(apiEvents)) {
        console.warn('API events is not an array:', apiEvents);
        return [];
    }

    return apiEvents
        .map(event => {
            try {
                // Helper functions
                const getBestImage = (images: any[]): string => {
                    if (!Array.isArray(images) || images.length === 0) {
                        return 'https://eventigo.s3-central.vshosting.cloud/production/event/fb-olomouc-png-rvqbxo.png';
                    }
                    // Sort by width desc to get highest quality image
                    const sortedImages = images.sort((a, b) => (b.width || 0) - (a.width || 0));
                    return sortedImages[0]?.url || 'https://eventigo.s3-central.vshosting.cloud/production/event/fb-olomouc-png-rvqbxo.png';
                };

                const mapImages = (images: any[]): EventImage[] => {
                    if (!Array.isArray(images)) return [];

                    return images.map(img => ({
                        url: img.url || '',
                        width: img.width || 0,
                        height: img.height || 0,
                        ratio: img.ratio as ImageRatio || 'custom',
                        fallback: img.fallback || false
                    }));
                };

                const mapVenue = (venue: any): EventVenue => {
                    return {
                        id: venue?.id || '',
                        name: venue?.name || '',
                        address: venue?.address || '',
                        city: venue?.city || '',
                        country: venue?.country || '',
                        postalCode: venue?.postal_code || '',
                        state: venue?.state || undefined,
                        timezone: venue?.timezone || 'Europe/Prague',
                        coordinates: {
                            lat: parseFloat(venue?.location?.latitude || '0'),
                            long: parseFloat(venue?.location?.longitude || '0')
                        }
                    };
                };

                const mapClassifications = (classifications: any): EventClassifications => {
                    return {
                        family: classifications?.family || false,
                        genre: classifications?.genre || undefined,
                        segment: classifications?.segment || undefined,
                        subgenre: classifications?.subgenre || undefined,
                        subtype: classifications?.subtype || undefined,
                        type: classifications?.type || undefined
                    };
                };

                const mapPriceRanges = (priceRanges: any[]): PriceRange[] => {
                    if (!Array.isArray(priceRanges)) return [];

                    return priceRanges.map(range => ({
                        type: range?.type || undefined,
                        currency: range?.currency || undefined,
                        min: range?.min || undefined,
                        max: range?.max || undefined
                    }));
                };

                const getEventStatus = (status: string): EventStatus => {
                    switch (status?.toLowerCase()) {
                        case 'onsale': return EventStatus.ON_SALE;
                        case 'offsale': return EventStatus.OFF_SALE;
                        case 'cancelled': return EventStatus.CANCELLED;
                        case 'postponed': return EventStatus.POSTPONED;
                        case 'rescheduled': return EventStatus.RESCHEDULED;
                        default: return EventStatus.ON_SALE;
                    }
                };

                const getCategory = (classifications: any): string => {
                    if (!classifications) return 'Other';

                    const genre = classifications.genre;
                    const segment = classifications.segment;

                    // Map to our predefined categories
                    if (genre) {
                        const lowerGenre = genre.toLowerCase();
                        if (['rock', 'pop', 'jazz', 'classical', 'electronic', 'hip-hop', 'country'].includes(lowerGenre)) {
                            return 'Music';
                        }
                    }

                    if (segment) {
                        const lowerSegment = segment.toLowerCase();
                        if (lowerSegment.includes('hudba') || lowerSegment.includes('music')) {
                            return 'Music';
                        }
                        if (lowerSegment.includes('sport')) {
                            return 'Sports';
                        }
                        if (lowerSegment.includes('theatre') || lowerSegment.includes('art')) {
                            return 'Arts & Theatre';
                        }
                        if (classifications.family) {
                            return 'Family';
                        }
                    }

                    return 'Other';
                };

                const getDescription = (event: any): string => {
                    const parts = [];
                    if (event.date) parts.push(`Date: ${event.date}`);
                    if (event.time) parts.push(`Time: ${event.time}`);
                    if (event.venue?.name) parts.push(`Venue: ${event.venue.name}`);
                    if (event.please_note) parts.push(event.please_note);
                    if (event.info) parts.push(event.info);
                    return parts.join(' • ');
                };

                // Map the venue first to get coordinates
                const mappedVenue = mapVenue(event.venue);

                // Create the complete BackendEvent object
                const backendEvent: BackendEvent = {
                    // Core fields (backwards compatible)
                    id: event.id || '',
                    title: event.name || '',
                    category: getCategory(event.classifications),
                    image: getBestImage(event.images),
                    location: mappedVenue.coordinates,
                    description: getDescription(event),

                    // Extended fields
                    date: event.date || '',
                    datetime: event.datetime || '',
                    time: event.time || '',
                    timezone: event.timezone || 'Europe/Prague',
                    status: getEventStatus(event.status),
                    url: event.url || '',
                    venue: mappedVenue,
                    classifications: mapClassifications(event.classifications),
                    images: mapImages(event.images),
                    priceRanges: mapPriceRanges(event.price_ranges),
                    pleaseNote: event.please_note || undefined,
                    info: event.info || undefined
                };

                return backendEvent;
            } catch (error) {
                console.warn('Error mapping event:', error, event);
                return null;
            }
        })
        .filter((event): event is BackendEvent =>
            event !== null &&
            event.id !== undefined &&
            event.title !== undefined
        );
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