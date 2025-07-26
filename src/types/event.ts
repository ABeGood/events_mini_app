export interface EventLocation {
    lat: number;
    long: number;
}

// Main event interface
export interface BackendEvent {
    id: string;
    title: string;
    category: string;
    image: string;
    location: EventLocation; // [latitude, longitude]
    description: string;
    // Extended fields for richer functionality
    date: string;
    datetime: string;
    time: string;
    timezone: string;
    status: EventStatus;
    url: string;
    venue: EventVenue;
    classifications: EventClassifications;
    images: EventImage[];
    priceRanges: PriceRange[];
    pleaseNote?: string;
    info?: string;
}

// Supporting interfaces
export interface EventVenue {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    postalCode: string;
    state?: string;
    timezone: string;
    coordinates: {
        lat: number;
        long: number;
    };
}

export interface EventClassifications {
    family: boolean;
    genre?: string;
    segment?: string;
    subgenre?: string;
    subtype?: string;
    type?: string;
}

export interface EventImage {
    url: string;
    width: number;
    height: number;
    ratio: ImageRatio;
    fallback: boolean;
}

export interface PriceRange {
    type?: string;
    currency?: string;
    min?: number;
    max?: number;
}

// Enums and types
export enum EventStatus {
    ON_SALE = 'onsale',
    OFF_SALE = 'offsale',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed',
    RESCHEDULED = 'rescheduled'
}

export type ImageRatio = '16_9' | '4_3' | '3_2' | '1_1' | 'custom';

// Category system
export interface EventCategory {
    title: string;
    color: string;
    items: readonly string[];
}

// Predefined categories based on Ticketmaster data
export const EVENT_CATEGORIES: Record<string, EventCategory> = {
    MUSIC: {
        title: 'music',
        color: '#FF6B6B',
        items: ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop', 'Country'] as const
    },
    SPORTS: {
        title: 'sports',
        color: '#4ECDC4',
        items: ['Football', 'Basketball', 'Hockey', 'Tennis', 'Baseball', 'Soccer'] as const
    },
    ARTS: {
        title: 'arts_and_theatre',
        color: '#45B7D1',
        items: ['Theatre', 'Dance', 'Opera', 'Comedy', 'Musical'] as const
    },
    FAMILY: {
        title: 'family',
        color: '#96CEB4',
        items: ['Kids', 'Family', 'Educational', 'Circus'] as const
    },
    OTHER: {
        title: 'other',
        color: '#FECA57',
        items: ['Conference', 'Exhibition', 'Festival', 'Miscellaneous'] as const
    }
} as const;

// Utility types for better type safety
export type EventCategoryKey = keyof typeof EVENT_CATEGORIES;
export type EventGenre = typeof EVENT_CATEGORIES[EventCategoryKey]['items'][number];

// Helper interface for frontend filtering and display
export interface EventFilters {
    categories: EventCategoryKey[];
    dateRange: {
        start?: Date;
        end?: Date;
    };
    priceRange: {
        min?: number;
        max?: number;
    };
    location?: {
        center: [number, number];
        radiusKm: number;
    };
    status: EventStatus[];
}

// Simplified view model for list displays
export interface EventListItem {
    id: string;
    title: string;
    category: string;
    image: string;
    date: string;
    venue: string;
    city: string;
    status: EventStatus;
    priceFrom?: number;
}

// Detailed view model for event pages
export interface EventDetail extends BackendEvent {
    similarEvents?: EventListItem[];
    isBookmarked?: boolean;
    attendeeCount?: number;
}

export type Category =
  | 'music'
  | 'theatre'
  | 'sports'
  | 'art'
  | 'festivals'
  | 'wellness'
  | 'family'
  | 'talks'
  | 'food';