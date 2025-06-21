// src/components/BottomSheet/BottomSheet.tsx
import { FC, useRef, useEffect } from 'react';
import { FilterChips } from '../FilterChips/FilterChips';
import { FilterSection } from '../FilterSection/FilterSection';
import { useTelegramGestures, GestureState } from '../../hooks/useTelegramGestures';
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
    eventsCount
}) => {
    const sheetRef = useRef<HTMLDivElement | null>(null);

    // Now using focused gesture-specific hook
    const { createGestureHandler, triggerHaptic } = useTelegramGestures();

    useEffect(() => {
        const sheet = sheetRef.current;
        if (!sheet) return;

        // Define gesture behavior
        const gestureHandlers = createGestureHandler(
            // onGestureStart - decide whether to capture the gesture
            (e: TouchEvent) => {
                // Always capture gestures that start on the BottomSheet
                // Return true if we want to handle this gesture, false to let Telegram handle it
                return isOpen || e.target === sheet || sheet.contains(e.target as Node);
            },

            // onGestureMove - handle the gesture while it's happening
            (_e: TouchEvent, state: GestureState) => {
                const { gestureDistance } = state;

                // Provide haptic feedback at gesture milestones
                if (gestureDistance === 50) {
                    triggerHaptic('selection');
                }
            },

            // onGestureEnd - decide final action based on gesture
            (_e: TouchEvent, state: GestureState) => {
                const { gestureDirection, gestureDistance } = state;
                const threshold = 80;

                if (isOpen) {
                    // Sheet is open - handle close gestures
                    if (gestureDirection === 'down' && gestureDistance > threshold) {
                        onPositionChange(0); // Close sheet
                        triggerHaptic('impact', 'light');
                    } else if (gestureDirection === 'up' && gestureDistance > 30) {
                        onPositionChange(1); // Keep open/expand more
                        triggerHaptic('impact', 'light');
                    }
                } else {
                    // Sheet is closed - handle open gestures
                    if (gestureDirection === 'up' && gestureDistance > threshold) {
                        onPositionChange(1); // Open sheet
                        triggerHaptic('impact', 'medium');
                    }
                    // For down gestures when closed, we don't capture so Telegram handles minimize
                }
            }
        );

        // Apply event listeners
        sheet.addEventListener('touchstart', gestureHandlers.onTouchStart, gestureHandlers.options);
        sheet.addEventListener('touchmove', gestureHandlers.onTouchMove, gestureHandlers.options);
        sheet.addEventListener('touchend', gestureHandlers.onTouchEnd, gestureHandlers.options);

        return () => {
            sheet.removeEventListener('touchstart', gestureHandlers.onTouchStart);
            sheet.removeEventListener('touchmove', gestureHandlers.onTouchMove);
            sheet.removeEventListener('touchend', gestureHandlers.onTouchEnd);
        };
    }, [isOpen, onPositionChange, createGestureHandler, triggerHaptic]);

    return (
        <div
            ref={sheetRef}
            className={`bottom-sheet ${isOpen ? 'open' : ''}`}
            data-sheet-open={isOpen}
        >
            <div className="handle" />

            <div className="filter-header">
                <h3>Filters</h3>
                <p>
                    {eventsCount > 0
                        ? `${eventsCount} backend events + 364+ local events`
                        : '364+ events available'
                    }
                </p>
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