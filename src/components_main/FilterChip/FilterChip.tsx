import React from 'react';
import clsx from 'clsx';
import styles from './FilterChip.module.css';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  colorClass: string;
  onClick?: () => void;
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  selected = false,
  colorClass,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        styles.chip,
        styles[colorClass],
        selected ? styles.selected : styles.unselected
      )}
      onClick={onClick}
    >
      {label}
    </div>
  );
};

export default FilterChip;