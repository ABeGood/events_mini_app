import React from 'react';
import styles from './DateSelector.module.css';
import DateItem from './DateItem';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface DateInfo {
  date: string;
  dayLabel: string;
  dayNumber: number;
  isToday?: boolean;
  isWeekend?: boolean;
}

interface DateSelectorProps {
  dates: DateInfo[];
  selectedDate: string;
  onSelect: (date: string) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ dates, selectedDate, onSelect }) => {
  const currentMonth = format(parseISO(selectedDate), 'LLLL', { locale: ru });

  return (
    <div className={styles.container}>
      <div className={styles.monthLabel}>{currentMonth}</div>
      <div className={styles.dateList}>
        {dates.map((dateInfo) => (
          <DateItem
            key={dateInfo.date}
            date={dateInfo}
            isSelected={dateInfo.date === selectedDate}
            onClick={() => onSelect(dateInfo.date)}
          />
        ))}
      </div>
    </div>
  );
};

export default DateSelector;
