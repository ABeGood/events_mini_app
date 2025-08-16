import { useEffect, useState, useRef } from 'react';
import { MapComponent } from '../../components/MapComponent/MapComponent';
import { BottomSheet } from '../../components/BottomSheet/BottomSheet';
import { BackendTestButton } from '../../components/BackendTestButton/BackendTestButton';
import { BackendStatus } from '../../components/BackendStatus/BackendStatus';
import { useBackendApi } from '../../hooks/backendApi';
import { FILTER_CHIPS, EVENT_CATEGORIES } from '../../constants/filterConstants';
import { SearchOverlay } from '../../components/SearchOverlay/SearchOverlay';
import { LocateButton } from '../../components/LocateButton/LocateButton';
import { EventInfoSheet } from '../../components/EventInfoSheet/EventInfoSheet';
import { EventType } from '../../types/eventTypes';
import './IndexPage.css';
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />


import maplibregl from 'maplibre-gl';

declare global {
  interface Window {
    Telegram: any;
  }
}

export const IndexPage = () => {
  const [sheetPosition, setSheetPosition] = useState(0);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const mapRef = useRef<maplibregl.Map | undefined>(undefined);

  const [selectedEvent, setSelectedEvent] = useState<{
    event: EventType;
    routeInfo: {
      distance: number;
      duration: number;
    };
  } | null>(null);

  const {
    backendMessage,
    backendStatus,
    apiEvents,
    testApiCall
  } = useBackendApi();

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

  const handleLocateClick = () => {
    if (userCoords && mapRef.current) {
      console.log('Center map to:', userCoords);
      mapRef.current.flyTo({
        center: userCoords,
        zoom: 15,
        speed: 1.2
      });
    } else {
      console.warn('User position not ready yet');
    }
  };

  const handleEventClick = (eventWithRoute: EventType & { distance: number; duration: number }) => {
    console.log('Selected event:', eventWithRoute);

    setSelectedEvent({
      event: eventWithRoute,
      routeInfo: {
        distance: eventWithRoute.distance,
        duration: eventWithRoute.duration
      }
    });
  };

  const handleCloseEventInfo = () => {
    setSelectedEvent(null);
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

      <MapComponent
        ref={mapRef}
        onMapLoad={(map) => {
          mapRef.current = map;
        }}
        onUserPositionChange={(coords) => {
          setUserCoords(coords);
          console.log('User position updated:', coords);
        }}
        onEventClick={handleEventClick}
      />

      <LocateButton onLocate={handleLocateClick} />

      {!selectedEvent && (
        <BottomSheet
          isOpen={sheetPosition === 1}
          onPositionChange={setSheetPosition}
          allChips={FILTER_CHIPS}
          selectedChips={selectedChips}
          onToggleChip={toggleChip}
          eventCategories={EVENT_CATEGORIES}
          selectedFilters={selectedFilters}
          onToggleFilter={toggleFilter}
          eventsCount={apiEvents.length}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      )}

      {selectedEvent && (
        <EventInfoSheet
          event={selectedEvent.event}
          routeInfo={selectedEvent.routeInfo}
          onClose={handleCloseEventInfo}
        />
      )}

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
};