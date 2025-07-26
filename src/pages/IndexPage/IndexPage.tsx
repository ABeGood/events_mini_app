// src/pages/IndexPage/IndexPage.tsx
import { useEffect, useState } from 'react';
import { MapComponent } from '../../components/MapComponent/MapComponent';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { BackendTestButton } from '../../components/BackendTestButton/BackendTestButton';
import { BackendStatus } from '../../components/BackendStatus/BackendStatus';
import { EventsTestButton } from '../../components/BackendEventsButton/BackendEventsButton';
import { useBackendApi } from '../../hooks/backendApi';
import { useTelegramApp } from '../../hooks/useTelegramApp';
import { FILTER_CHIPS, EVENT_CATEGORIES } from '../../constants/filterConstants';
import { SearchOverlay } from '../../components/SearchOverlay/SearchOverlay';
// import { LocateButton } from '../../components/LocateButton/LocateButton';
import './IndexPage.css';

export const IndexPage = () => {
  const [sheetPosition, setSheetPosition] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
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
  const { initializeTelegramApp, triggerHaptic } = useTelegramApp();

  // Debug logging
  useEffect(() => {
    console.log('IndexPage - apiEvents:', apiEvents);
    console.log('IndexPage - backendStatus:', backendStatus);
    console.log('IndexPage - events count:', apiEvents.length);
  }, [apiEvents, backendStatus]);

  // Initialize Telegram WebApp once on mount
  useEffect(() => {
    initializeTelegramApp();
  }, [initializeTelegramApp]);

  const handleSheetPositionChange = (position: number) => {
    const isOpening = position > sheetPosition;
    setSheetPosition(position);

    if (isOpening && position === 1) {
      triggerHaptic('impact', 'medium');
    } else if (!isOpening && position === 0) {
      triggerHaptic('impact', 'light');
    }
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
    triggerHaptic('selection');
  };

  const toggleFilter = (category: string, item: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const exists = current.includes(item);
      const updated = exists ? current.filter(i => i !== item) : [...current, item];
      triggerHaptic('selection');
      return { ...prev, [category]: updated };
    });
  };

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

  return (
    <div className="telegram-app-container">
      <BackendTestButton
        status={backendStatus}
        onTest={fetchEvents}
      />

      <BackendStatus
        status={backendStatus}
        message={backendMessage || error || 'Ready'}
      />

      <EventsTestButton
        status={backendStatus} // Use same status
        onFetchEvents={fetchEvents}
      />

      {/* <EventsStatus
        status={backendStatus} // Use same status
        events={apiEvents}
        eventsCount={apiEvents.length}
      /> */}

      {/* Pass the shared state to MapComponent */}
      <MapComponent
        apiEvents={apiEvents}
        backendStatus={backendStatus}
        error={error}
      />

      <BottomSheet
        isOpen={sheetPosition === 1}
        onPositionChange={handleSheetPositionChange}
        allChips={FILTER_CHIPS}
        selectedChips={selectedChips}
        onToggleChip={toggleChip}
        eventCategories={EVENT_CATEGORIES}
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilter}
        eventsCount={apiEvents.length}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};
