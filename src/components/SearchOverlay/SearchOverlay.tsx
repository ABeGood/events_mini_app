import { FC } from 'react';
import './SearchOverlay.css';
import { Search } from 'lucide-react';


interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockCategories = [
    { emoji: '🍕', title: 'Pizza' },
    { emoji: '🎭', title: 'Theatre' },
    { emoji: '🎵', title: 'Music' },
    { emoji: '🎨', title: 'Art' },
    { emoji: '⚽', title: 'Sports' },
    { emoji: '🎡', title: 'Festivals' },
    { emoji: '🛍️', title: 'Markets' },
    { emoji: '🍷', title: 'Wine & Food' }
];

export const SearchOverlay: FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    return (
        <div className={`search-overlay ${isOpen ? 'open' : ''}`}>
            <div className="overlay-header">
                <div className="search-input-container">
                    <Search size={20} color="#888" style={{ marginRight: '8px' }} />
                    <input
                        type="text"
                        placeholder="Search for event"
                    />
                </div>

                <button onClick={onClose} className="close-btn">✕</button>
            </div>

            <div className="section-title">Popular categories</div>

            <div className="category-list">
                {mockCategories.map((item) => (
                    <div key={item.title} className="category-item">
                        <span className="emoji">{item.emoji}</span>
                        <span className="title">{item.title}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
