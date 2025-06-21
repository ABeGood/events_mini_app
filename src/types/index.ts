export type Coordinates = [number, number];

export interface Event {
    id: number;
    coords: Coordinates;
    image: string;
    category: string;
}

export interface EventCategory {
    title: string;
    color: string;
    items: readonly string[];
}

export interface BackendEvent {
    id: number;
    title: string;
    category: string;
    location: [number, number];
    description: string;
}

export type BackendStatus = 'idle' | 'loading' | 'success' | 'error';

// Filter-related types
export type FilterChip = 'Under 18' | '18+' | 'Family' | 'Free entry' | 'Festivals' | 'Sports' | 'More';

export type CategoryName = 'Music' | 'Arts & Theatre' | 'Clubs';