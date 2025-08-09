import React from 'react';
import styles from './FilterHeader.module.css';

interface FilterHeaderProps {
  count: number;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({ count }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>Filters</div>
      <div className={styles.subtitle}>{count}+ events available</div>
    </div>
  );
};

export default FilterHeader;
