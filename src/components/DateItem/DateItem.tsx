import React from 'react';
import clsx from 'clsx';
import styles from './DateSelector.module.css';

interface DateItemProps {
  date: {
    date: string;
    dayLabel: string;
    dayNumber: number;
    isToday?: boolean;
    isWeekend?: boolean;
  };
  isSelected: boolean;
  onClick: () => void;
}

const DateItem: React.FC<DateItemProps> = ({ date, isSelected, onClick }) => {
  return (
    <div className={styles.dateItem} onClick={onClick}>
      <div className={styles.todayText}>
        {date.isToday ? 'Today' : '\u00A0'}
      </div>
      <div className={clsx(
        styles.dayNumber,
        isSelected && styles.selected,
        date.isWeekend && styles.weekend
      )}>
        {date.dayNumber}
      </div>
      <div className={clsx(styles.dayLabel, date.isWeekend && styles.weekend)}>
        {date.dayLabel}
      </div>
    </div>
  );
};

export default DateItem;