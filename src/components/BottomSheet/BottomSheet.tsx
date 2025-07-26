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
    onOpenSearch: () => void; // Добавили onOpenSearch
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
    // onOpenSearch // Добавили
}) => {
    const sheetRef = useRef<HTMLDivElement | null>(null);
    const handleRef = useRef<HTMLDivElement | null>(null);

    const { createGestureHandler, triggerHaptic } = useTelegramGestures();

    useEffect(() => {
        const sheet = sheetRef.current;
        const handle = handleRef.current;
        if (!sheet) return;

        // Helper function to check if touch should be captured for sheet control
        const shouldCaptureGesture = (e: TouchEvent): boolean => {
            const target = e.target as Element;

            // Always capture if touching the handle
            if (handle && (target === handle || handle.contains(target))) {
                return true;
            }

            // If sheet is closed, capture upward swipes from anywhere on sheet
            if (!isOpen) {
                return sheet === target || sheet.contains(target);
            }

            // If sheet is open, only capture gestures that start near the top edge
            // This allows content interaction while still enabling sheet control
            const touch = e.touches[0];
            const sheetRect = sheet.getBoundingClientRect();
            const touchY = touch.clientY;
            const sheetTop = sheetRect.top;

            // Only capture if touch starts within 60px of the top of the sheet
            // This includes the handle area and some space around it
            return (touchY - sheetTop) < 60;
        };

        // Define gesture behavior with selective capture
        const gestureHandlers = createGestureHandler(
            // onGestureStart - decide whether to capture the gesture
            (e: TouchEvent) => {
                return shouldCaptureGesture(e);
            },

            // onGestureMove - handle the gesture while it's happening
            (_e: TouchEvent, state: GestureState) => {
                const { gestureDistance } = state;

                // Only provide haptic feedback for significant gestures
                if (gestureDistance === 50) {
                    triggerHaptic('selection');
                }
            },

            // onGestureEnd - decide final action based on gesture
            (_e: TouchEvent, state: GestureState) => {
                const { gestureDirection, gestureDistance } = state;

                // Require larger threshold to prevent accidental triggers
                const threshold = 100;

                if (isOpen) {
                    // Sheet is open - handle close gestures
                    if (gestureDirection === 'down' && gestureDistance > threshold) {
                        onPositionChange(0); // Close sheet
                        triggerHaptic('impact', 'light');
                    } else if (gestureDirection === 'up' && gestureDistance > 50) {
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
            <div
                ref={handleRef}
                className="handle"
            />

            <div className="filter-header">
                <h3>Filters</h3>
                <p>
                    {`${eventsCount} backend events`}
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
