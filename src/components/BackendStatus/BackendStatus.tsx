// src/components/BackendStatus/BackendStatus.tsx
import { FC } from 'react';

interface BackendStatusProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    eventsCount: number;
}

export const BackendStatus: FC<BackendStatusProps> = ({ status, message, eventsCount }) => {
    const getBorderColor = () => {
        switch (status) {
            case 'success': return '#1D965C';
            case 'error': return '#961D1D';
            case 'loading': return '#1D96FF';
            default: return '#ddd';
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'success': return '✅ Backend Connected';
            case 'error': return '❌ Backend Error';
            case 'loading': return '⏳ Connecting...';
            default: return '⚪ Backend Status';
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: '60px',
            left: '10px',
            right: '10px',
            zIndex: 1000,
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '12px',
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: `2px solid ${getBorderColor()}`
        }}>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                {getStatusText()}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
                {message || 'No message from backend yet'}
            </div>
            {eventsCount > 0 && (
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    📍 Loaded {eventsCount} events from backend
                </div>
            )}
        </div>
    );
};