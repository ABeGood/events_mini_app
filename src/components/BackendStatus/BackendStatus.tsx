// src/components/BackendStatus/BackendStatus.tsx
import { FC } from 'react';
import './BackendStatus.css';

interface BackendStatusProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    eventsCount: number;
}

export const BackendStatus: FC<BackendStatusProps> = ({ status, message, eventsCount }) => {
    const getStatusText = () => {
        switch (status) {
            case 'success': return '✅ Backend Connected';
            case 'error': return '❌ Backend Error';
            case 'loading': return '⏳ Connecting...';
            default: return '⚪ Backend Status';
        }
    };

    return (
        <div className={`backend-status backend-status--${status}`}>
            <div className="backend-status__header">
                {getStatusText()}
            </div>
            <div className="backend-status__message">
                {message || 'No message from backend yet'}
            </div>
            {eventsCount > 0 && (
                <div className="backend-status__events">
                    📍 Loaded {eventsCount} events from backend
                </div>
            )}
        </div>
    );
};