// src/constants/filterConstants.ts
import { EventCategory } from '../types';

export const FILTER_CHIPS = [
    'Under 18',
    '18+',
    'Family',
    'Free entry',
    'Festivals',
    'Sports',
    'More'
] as const;

export const EVENT_CATEGORIES: EventCategory[] = [
    {
        title: 'Music',
        color: '#1D965C',
        items: Array(12).fill('Alternative/Indie Rock')
    },
    {
        title: 'Arts & Theatre',
        color: '#7E1D96',
        items: Array(12).fill('Classical')
    },
    {
        title: 'Clubs',
        color: '#961D1D',
        items: Array(12).fill('Dance/Electronic')
    },
];

// Category color mapping for easy access
export const CATEGORY_COLORS: Record<string, string> = {
    'Music': '#1D965C',
    'Arts & Theatre': '#7E1D96',
    'Clubs': '#961D1D',
} as const;