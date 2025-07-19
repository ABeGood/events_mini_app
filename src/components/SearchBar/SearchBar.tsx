import { FC } from 'react';
import { Search } from 'lucide-react';
import './SearchBar.css';

interface SearchBarProps {
    onClick: () => void;
}

export const SearchBar: FC<SearchBarProps> = ({ onClick }) => {
    return (
        <div className="search-container" onClick={onClick}>
            <div className="search-box">
                <Search size={20} color="#888" style={{ marginRight: '8px' }} />
                <span className="search-placeholder">Search for event</span>
            </div>
        </div>
    );
};
