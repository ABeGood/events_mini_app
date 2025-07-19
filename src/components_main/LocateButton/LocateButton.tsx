import { FC } from 'react';
import { Navigation } from 'lucide-react';
import './LocateButton.css';

interface LocateButtonProps {
    onLocate: () => void;
}

export const LocateButton: FC<LocateButtonProps> = ({ onLocate }) => {
    return (
        <button className="locate-button" onClick={onLocate}>
            <Navigation size={24} color="#2f313f" />
        </button>
    );
};
