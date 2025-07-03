// src/components/EventsStatus/EventsStatus.tsx
import { FC } from 'react';
import './BackendEventsStatus.css';

interface Event {
    id: string;
    title: string;
    category: string;
    location: [number, number];
    description: string;
}

interface EventsStatusProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    events: Event[];
    eventsCount: number;
}

export const EventsStatus: FC<EventsStatusProps> = ({ status, events, eventsCount }) => {
    const getStatusText = () => {
        switch (status) {
            case 'success': return '✅ Events Loaded';
            case 'error': return '❌ Failed to Load Events';
            case 'loading': return '⏳ Loading Events...';
            default: return '⚪ Events Status';
        }
    };

    return (
        <div className={`events-status events-status--${status}`}>
            <div className="events-status__header">
                {getStatusText()}
            </div>
            {eventsCount > 0 && (
                <div className="backend-status__events">
                    📍 Loaded {eventsCount} events from backend
                </div>
            )}
            {status === 'success' && events.length > 0 ? (
                <div className="events-status__list">
                    {events.slice(0, 3).map((event, index) => (
                        <div key={event.id || index} className="events-status__item">
                            <span className="events-status__title">{event.title}</span>
                            {/* <span className="events-status__category">{event.category}</span> */}
                        </div>
                    ))}
                    {events.length > 3 && (
                        <div className="events-status__more">
                            ...and {events.length - 3} more events
                        </div>
                    )}
                </div>
            ) : status === 'success' ? (
                <div className="events-status__message">No events available</div>
            ) : (
                <div className="events-status__message">
                    {status === 'idle' ? 'Click "Load Events" to fetch data' : ''}
                </div>
            )}
        </div>
    );
};