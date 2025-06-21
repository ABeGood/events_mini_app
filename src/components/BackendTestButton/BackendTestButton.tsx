// src/components/BackendTestButton/BackendTestButton.tsx
import { FC } from 'react';
import './BackendTestButton.css';

interface BackendTestButtonProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    onTest: () => Promise<void>;
}

export const BackendTestButton: FC<BackendTestButtonProps> = ({ status, onTest }) => {
    const getButtonText = () => {
        switch (status) {
            case 'loading': return '⏳ Testing...';
            case 'success': return '✅ Test API';
            case 'error': return '❌ Retry';
            default: return '🔌 Test Backend';
        }
    };

    return (
        <button
            onClick={onTest}
            className={`backend-test-button backend-test-button--${status}`}
            disabled={status === 'loading'}
        >
            {getButtonText()}
        </button>
    );
};