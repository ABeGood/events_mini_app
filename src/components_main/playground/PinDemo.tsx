// src/components_main/PinDemo/PinDemo.tsx
import React, { useState } from 'react';
import Pin from '../Pin/Pin';
import UserLocationMarker from '@/components_main/UserLocationMarker/UserLocationMarker';
import styles from './PinDemo.module.css';
import { LocateButton } from '../LocateButton/LocateButton';
import BottomSheetContainer from '../BottomSheetContainer/BottomSheetContainer';
import DateSelector from '@/components_main/DateItem/DateSelector';
import SearchBar from '@/components_main/SearchBar/SearchBar';
import FilterChip from '@/components_main/FilterChip/FilterChip';
import FilterHeader from '@/components_main/FilterHeader/FilterHeader';
import RecommendationList from '@/components_main/Recommendation/RecommendationList';
import EventDetails from '@/components_main/EventDetails_components/EventDetails/EventDetails';
import SideDrawer from '../SideMenu/SideDrawer';

const mockDates = [
  { date: '2025-07-15', dayLabel: 'Вт', dayNumber: 15, isToday: true, isWeekend: false },
  { date: '2025-07-16', dayLabel: 'Ср', dayNumber: 16 },
  { date: '2025-07-17', dayLabel: 'Чт', dayNumber: 17 },
  { date: '2025-07-18', dayLabel: 'Пт', dayNumber: 18 },
  { date: '2025-07-19', dayLabel: 'Сб', dayNumber: 19, isWeekend: true },
  { date: '2025-07-20', dayLabel: 'Вс', dayNumber: 20, isWeekend: true },
  { date: '2025-07-21', dayLabel: 'Пн', dayNumber: 21 },
  { date: '2025-07-22', dayLabel: 'Вт', dayNumber: 22 },
  { date: '2025-07-23', dayLabel: 'Ср', dayNumber: 23 },
  { date: '2025-07-24', dayLabel: 'Чт', dayNumber: 24 },
  { date: '2025-07-25', dayLabel: 'Пт', dayNumber: 25 },
];

const categories = [
  { label: 'Music', key: 'music' },
  { label: 'Theatre & Stand-up', key: 'theatreandstandup' },
  { label: 'Sports', key: 'sports' },
  { label: 'Exhibitions / Art', key: 'exhibitionsart' },
  { label: 'Festivals & Markets', key: 'festivalsmarkets' },
  { label: 'Wellness / Health', key: 'wellnesshealth' },
  { label: 'Family Friendly', key: 'familyfriendly' },
  { label: 'Talks & Lectures', key: 'talkslectures' },
  { label: 'Food & Drinks', key: 'fooddrinks' },
];

const PinDemo: React.FC = () => {
  const [zoom, setZoom] = useState(11);
  const [category] = useState('Music');
  const [selectedDate, setSelectedDate] = useState('2025-07-15');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleLocate = () => {
    console.log('Locating user...');
  };

  return (
    <div className={styles.container}>
      <button
        onClick={() => setIsDrawerOpen(true)}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 2000,
          backgroundColor: '#111827',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '10px 14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        ☰ Меню
      </button>

      <div className={styles.controls}>
        <label>
          Zoom:
          <input
            type="range"
            min={10}
            max={16}
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
          />
          {zoom}
        </label>

        <button
          onClick={() => setShowDetails(true)}
          style={{
            marginLeft: '20px',
            padding: '8px 14px',
            backgroundColor: '#3B82F6',
            color: 'white',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Показать EventDetails
        </button>
      </div>

      <div className={styles.pinPreview}>
        <h4>Event Pin</h4>
        <Pin
          zoomLevel={zoom}
          category="sports"
          avatarUrl="https://i.imgur.com/2DhmtJ4.jpg"
          name="Kool & The Gang"
        />

        <h4>User Location Marker</h4>
        <UserLocationMarker size={24} />
        <LocateButton onLocate={handleLocate} />

        {showDetails && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'white',
              overflowY: 'scroll',
              zIndex: 1000
            }}
          >
            <button
              onClick={() => setShowDetails(false)}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                padding: '6px 12px',
                backgroundColor: '#e5e7eb',
                borderRadius: 6,
                zIndex: 1001
              }}
            >
              Закрыть
            </button>
            <EventDetails />
          </div>
        )}

        <BottomSheetContainer>
          <DateSelector
            dates={mockDates}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
          <SearchBar onClick={() => {}} />
          <FilterHeader count={123} />
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              padding: '12px 0'
            }}
          >
            {categories.map(({ label, key }) => (
              <FilterChip
                key={key}
                label={label}
                colorClass={key}
                selected={selectedChips.includes(label)}
                onClick={() => toggleChip(label)}
              />
            ))}
          </div>
          <RecommendationList />
        </BottomSheetContainer>
      </div>

      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <p style={{ color: '#111' }}></p>
      </SideDrawer>
    </div>
  );
};

export default PinDemo;
