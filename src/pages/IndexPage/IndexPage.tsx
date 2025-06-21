// src/pages/IndexPage/IndexPage.tsx (Cleaned up version)
import { useEffect, useState } from 'react';
import { MapComponent } from '../../components/MapComponent/MapComponent';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { BackendTestButton } from '../../components/BackendTestButton/BackendTestButton';
import { BackendStatus } from '../../components/BackendStatus/BackendStatus';
import { useBackendApi } from '../../hooks/backendApi';
import './map.css';

declare global {
  interface Window {
    Telegram: any;
  }
}

const allChips = ['Under 18', '18+', 'Family', 'Free entry', 'Festivals', 'Sports', 'More'];

const eventCategories = [
  { title: 'Music', color: '#1D965C', items: Array(12).fill('Alternative/Indie Rock') },
  { title: 'Arts & Theatre', color: '#7E1D96', items: Array(12).fill('Classical') },
  { title: 'Clubs', color: '#961D1D', items: Array(12).fill('Dance/Electronic') },
];

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

  // Expand Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }
  }, []);

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const toggleFilter = (category: string, item: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const exists = current.includes(item);
      const updated = exists ? current.filter(i => i !== item) : [...current, item];
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
        onPositionChange={setSheetPosition}
        allChips={allChips}
        selectedChips={selectedChips}
        onToggleChip={toggleChip}
        eventCategories={eventCategories}
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilter}
        eventsCount={apiEvents.length}
      />
    </div>
  );
};