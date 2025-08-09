// src/pages/IndexPage/IndexPage.tsx
import { useEffect, useState } from 'react';
import { MapComponent } from '../../components/MapComponent/MapComponent';
import BottomSheetContainer from '../../components/BottomSheet/BottomSheetContainer/BottomSheetContainer';
import DateSelector from '@/components/DateItem/DateSelector';
import SearchBar from '@/components/SearchBar/SearchBar';
import SearchOverlay from '@/components/SearchOverlay/SearchOverlay';
import FilterChip from '@/components/FilterChip/FilterChip';
import FilterHeader from '@/components/FilterHeader/FilterHeader';
import RecommendationList from '@/components/Recommendation/RecommendationList';
import { BackendStatus } from '../../components/BackendStatus/BackendStatus';
import { EventsTestButton } from '../../components/BackendEventsButton/BackendEventsButton';
import { useBackendApi } from '../../hooks/backendApi';
import { useTelegramApp } from '../../hooks/useTelegramApp';
// import { LocateButton } from '../../components/LocateButton/LocateButton';
import { addDays, format, isToday, isWeekend } from 'date-fns';
import { DateInfo } from '../../components/DateItem/DateSelector';
import { ru } from 'date-fns/locale';
import './IndexPage.css';

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

export const IndexPage = () => {
  // const [sheetPosition, setSheetPosition] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  // const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  // const mapRef = useRef<maplibregl.Map | undefined>(undefined);

  // Get ALL values from the backend API hook
  const {
    apiEvents,
    backendStatus,
    error,
    fetchEvents,
    backendMessage // Add this if your hook returns it
  } = useBackendApi();

  // Use simplified app-level hook
  const {
    initializeTelegramApp,
    triggerHaptic,
    disableAppSwipes
  } = useTelegramApp();

  // Debug logging
  useEffect(() => {
    console.log('IndexPage - apiEvents:', apiEvents);
    console.log('IndexPage - backendStatus:', backendStatus);
    console.log('IndexPage - events count:', apiEvents.length);
  }, [apiEvents, backendStatus]);

  // Initialize Telegram WebApp once on mount
  useEffect(() => {
    initializeTelegramApp();
    disableAppSwipes(); // Disable Telegram swipe-to-minimize
  }, [initializeTelegramApp, disableAppSwipes]);
  // const handleSheetPositionChange = (position: number) => {
  //   const isOpening = position > sheetPosition;
  //   setSheetPosition(position);

  //   if (isOpening && position === 1) {
  //     triggerHaptic('impact', 'medium');
  //   } else if (!isOpening && position === 0) {
  //     triggerHaptic('impact', 'light');
  //   }
  // };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
    triggerHaptic('selection');
  };

  // Handler to open search overlay
  const handleSearchClick = () => {
    setIsSearchOpen(true);
    triggerHaptic('impact', 'light'); // Optional haptic feedback
  };

  // Handler to close search overlay
  const handleSearchClose = () => {
    setIsSearchOpen(false);
    triggerHaptic('impact', 'light'); // Optional haptic feedback
  };

  // const toggleFilter = (category: string, item: string) => {
  //   setSelectedFilters(prev => {
  //     const current = prev[category] || [];
  //     const exists = current.includes(item);
  //     const updated = exists ? current.filter(i => i !== item) : [...current, item];
  //     triggerHaptic('selection');
  //     return { ...prev, [category]: updated };
  //   });
  // };

  // const handleLocateClick = () => {
  //   if (userCoords && mapRef.current) {
  //     console.log('Center map to:', userCoords);
  //     mapRef.current.flyTo({
  //       center: userCoords,
  //       zoom: 15,
  //       speed: 1.2
  //     });
  //   } else {
  //     console.warn('User position not ready yet');
  //   }
  // };

  const generateDateRange = (daysAfter: number): DateInfo[] => {
    const today = new Date();
    const dates: DateInfo[] = [];

    // Generate range from today-n to today+n
    for (let i = 0; i <= daysAfter; i++) {
      const currentDate = addDays(today, i);
      const dateString = format(currentDate, 'yyyy-MM-dd');

      dates.push({
        date: dateString,
        dayLabel: format(currentDate, 'EEE', { locale: ru }), // Mon, Tue, etc.
        dayNumber: parseInt(format(currentDate, 'd')), // Day of month
        isToday: isToday(currentDate),
        isWeekend: isWeekend(currentDate)
      });
    }

    return dates;
  };

  const dynamicDates = generateDateRange(30);

  // Set today as selected date
  const todayString = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(todayString);

  return (
    <div className="telegram-app-container">
      <EventsTestButton
        status={backendStatus} // Use same status
        onFetchEvents={fetchEvents}
      />

      <BackendStatus
        status={backendStatus}
        message={backendMessage || error || 'Ready'}
      />

      {/* Pass the shared state to MapComponent */}
      <MapComponent
        apiEvents={apiEvents}
        backendStatus={backendStatus}
        error={error}
      />

      <BottomSheetContainer>
        <DateSelector
          dates={dynamicDates}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
        />

        <SearchBar onClick={handleSearchClick} />
        <FilterHeader count={123} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px 0' }}>
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

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={handleSearchClose}
      />
    </div>
  );
};
