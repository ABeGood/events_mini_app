// src/pages/IndexPage/IndexPage.tsx
import { useEffect, useState } from 'react';
import { MapComponent } from '../../components/MapComponent/MapComponent';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { BackendTestButton } from '../../components/BackendTestButton/BackendTestButton';
import { BackendStatus } from '../../components/BackendStatus/BackendStatus';
import { useBackendApi } from '../../hooks/backendApi';
import { useTelegramApp } from '../../hooks/useTelegramApp'; // Simplified hook
import { FILTER_CHIPS, EVENT_CATEGORIES } from '../../constants/filterConstants';
import './IndexPage.css';

export const IndexPage = () => {
  const [sheetPosition, setSheetPosition] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});

  const {
    backendMessage,
    backendStatus,
    apiEvents,
    testApiCall
  } = useBackendApi();

  // Use simplified app-level hook
  const { initializeTelegramApp, triggerHaptic } = useTelegramApp();

  // Initialize Telegram WebApp once on mount
  useEffect(() => {
    initializeTelegramApp();
  }, [initializeTelegramApp]);

  const handleSheetPositionChange = (position: number) => {
    const isOpening = position > sheetPosition;
    setSheetPosition(position);

    // Provide appropriate haptic feedback for UI state changes
    if (isOpening && position === 1) {
      triggerHaptic('impact', 'medium'); // Sheet opening
    } else if (!isOpening && position === 0) {
      triggerHaptic('impact', 'light'); // Sheet closing
    }
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );

    // Haptic feedback for filter interactions
    triggerHaptic('selection');
  };

  const toggleFilter = (category: string, item: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const exists = current.includes(item);
      const updated = exists ? current.filter(i => i !== item) : [...current, item];

      // Haptic feedback for filter changes
      triggerHaptic('selection');

      return { ...prev, [category]: updated };
    });
  };

  return (
    <div className="telegram-app-container">
      <BackendTestButton
        status={backendStatus}
        onTest={testApiCall}
      />

      <BackendStatus
        status={backendStatus}
        message={backendMessage}
        eventsCount={apiEvents.length}
      />

      <MapComponent />

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
      />
    </div>
  );
};