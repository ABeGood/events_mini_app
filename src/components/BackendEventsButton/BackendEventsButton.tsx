// src/components/EventsTestButton/EventsTestButton.tsx
import { FC } from 'react';
import './BackendEventsButton.css';

interface EventsTestButtonProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    onFetchEvents: () => Promise<void>;
}

export const EventsTestButton: FC<EventsTestButtonProps> = ({ status, onFetchEvents }) => {
    const getButtonText = () => {
        switch (status) {
            case 'loading': return '⏳ Loading...';
            case 'success': return '📍 Fetch Events';
            case 'error': return '❌ Retry Events';
            default: return '📍 Load Events';
        }
    };

    return (
        <button
            onClick={onFetchEvents}
            className={`events-test-button events-test-button--${status}`}
            disabled={status === 'loading'}
        >
            {getButtonText()}
        </button>
    );
};