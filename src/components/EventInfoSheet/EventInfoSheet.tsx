import React from 'react';
import { EventType } from '../../types/eventTypes';
import './EventInfoSheet.css';

interface EventInfoSheetProps {
    event: EventType;
    onClose: () => void;
    routeInfo: {
        distance: number;
        duration: number;
    };
}

export const EventInfoSheet: React.FC<EventInfoSheetProps> = ({ event, onClose, routeInfo }) => {
    const formatDistance = (meters: number) => {
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    const formatDuration = (seconds: number) => {
        const minutes = Math.round(seconds / 60);
        return `${minutes} min`;
    };

    return (
        <div className="event-info-sheet">
            <div className="sheet-handle" />
            <div className="sheet-header">
                <img src={event.image} alt={event.title} className="sheet-image" />
                <div className="sheet-title-group">
                    <div className="sheet-title">{event.title}</div>
                    <div className="sheet-category">{event.category}</div>
                </div>
                <button className="sheet-close-btn" onClick={onClose}>×</button>
            </div>

            <div className="sheet-content">
                <div className="sheet-description">{event.description}</div>
                <div className="sheet-address">{event.address}</div>
                <div className="sheet-time">{event.time}</div>

                <div className="sheet-row">
                    <div className="sheet-distance">
                        🚶 {formatDistance(routeInfo.distance)} ({formatDuration(routeInfo.duration)})
                    </div>
                </div>

                <div className="sheet-location-block">
                    <div className="sheet-location-title">Event location</div>
                    <div className="sheet-location-address">
                        <div className="sheet-location-icon">📍</div>
                        <div>
                            {event.address} <br />
                            <a href="#" className="sheet-location-link">Get directions</a>
                        </div>
                    </div>
                </div>

                <button className="sheet-buy-btn">
                    Buy ticket <br />
                </button>
            </div>
        </div>
    );
};
