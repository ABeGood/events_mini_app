// src/components/BackendTestButton/BackendTestButton.tsx
import { FC } from 'react';

interface BackendTestButtonProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    onTest: () => Promise<void>;
}

export const BackendTestButton: FC<BackendTestButtonProps> = ({ status, onTest }) => {
    return (
        <button
            onClick={onTest}
            style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                zIndex: 1000,
                padding: '10px 16px',
                backgroundColor: status === 'loading' ? '#999' : '#1D96FF',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
            disabled={status === 'loading'}
        >
            {status === 'loading' ? '⏳ Testing...' :
                status === 'success' ? '✅ Test API' :
                    status === 'error' ? '❌ Retry' : '🔌 Test Backend'}
        </button>
    );
};