export interface BackendEvent {
    id: string;
    title: string;
    category: string;
    image: string;
    location: [number, number];
    description: string;
}

export interface EventCategory {
    title: string;
    color: string;
    items: readonly string[];
}


export type BackendStatus = 'idle' | 'loading' | 'success' | 'error';

// Filter-related types
export type FilterChip = 'Under 18' | '18+' | 'Family' | 'Free entry' | 'Festivals' | 'Sports' | 'More';

export type CategoryName = 'Music' | 'Arts & Theatre' | 'Clubs';