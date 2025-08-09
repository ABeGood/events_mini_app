import React from 'react';
import { Search } from 'lucide-react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onClick }) => {
  return (
    <div className={styles.searchBar} onClick={onClick}>
      <div className={styles.iconWrapper}>
        <Search size={24} strokeWidth={2.5} />
      </div>
      <div className={styles.textWrapper}>
        <div className={styles.mainText}>Search for event</div>
        <div className={styles.subText}>To find the best event around</div>
      </div>
    </div>
  );
};

export default SearchBar;
