// src/components/BottomSheet/BottomSheet.tsx
import { FC, useRef, useEffect } from 'react';
import { FilterChips } from '../FilterChips/FilterChips';
import { FilterSection } from '../FilterSection/FilterSection';
import { SearchBar } from '../SearchBar/SearchBar'; // наш новый компонент
import './BottomSheet.css';

interface EventCategory {
    title: string;
    color: string;
    items: readonly string[];
}

interface BottomSheetProps {
    isOpen: boolean;
    onPositionChange: (position: number) => void;
    allChips: readonly string[];
    selectedChips: string[];
    onToggleChip: (chip: string) => void;
    eventCategories: readonly EventCategory[];
    selectedFilters: { [key: string]: string[] };
    onToggleFilter: (category: string, item: string) => void;
    eventsCount: number;
    onOpenSearch: () => void;
}

export const BottomSheet: FC<BottomSheetProps> = ({
    isOpen,
    onPositionChange,
    allChips,
    selectedChips,
    onToggleChip,
    eventCategories,
    selectedFilters,
    onToggleFilter,
    eventsCount,
    onOpenSearch
}) => {
    const sheetRef = useRef<HTMLDivElement | null>(null);

    // Swipe functionality
    useEffect(() => {
        const sheet = sheetRef.current;
        if (!sheet) return;

        let startY = 0;
        let currentY = 0;
        let isDragging = false;

        const onTouchStart = (e: TouchEvent) => {
            isDragging = true;
            startY = e.touches[0].clientY;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            if (deltaY < -50) {
                onPositionChange(1);
            } else if (deltaY > 50) {
                onPositionChange(0);
            }
        };

        const onTouchEnd = () => {
            isDragging = false;
        };

        sheet.addEventListener('touchstart', onTouchStart);
        sheet.addEventListener('touchmove', onTouchMove);
        sheet.addEventListener('touchend', onTouchEnd);

        return () => {
            sheet.removeEventListener('touchstart', onTouchStart);
            sheet.removeEventListener('touchmove', onTouchMove);
            sheet.removeEventListener('touchend', onTouchEnd);
        };
    }, [onPositionChange]);

    return (
        <div
            ref={sheetRef}
            className={`bottom-sheet ${isOpen ? 'open' : ''}`}
        >
            <div className="handle"></div>

            {/* Строка поиска */}
            <SearchBar onClick={onOpenSearch} />

            <div className="filter-header">
                <h3>Filters</h3>
                <p>{eventsCount > 0 ? `${eventsCount} backend events + 364+ local events` : '364+ events available'}</p>
            </div>

            <FilterChips
                chips={allChips}
                selectedChips={selectedChips}
                onToggleChip={onToggleChip}
            />

            <hr />

            <div className="filter-scroll">
                {eventCategories.map(category => (
                    <FilterSection
                        key={category.title}
                        title={category.title}
                        color={category.color}
                        items={category.items}
                        selectedItems={selectedFilters[category.title] || []}
                        onToggleItem={(item) => onToggleFilter(category.title, item)}
                    />
                ))}
            </div>
        </div>
    );
};
