// src/types/index.ts
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
    items: string[];
}

export interface BackendEvent {
    id: number;
    title: string;
    category: string;
    location: [number, number];
    description: string;
}

export type BackendStatus = 'idle' | 'loading' | 'success' | 'error';