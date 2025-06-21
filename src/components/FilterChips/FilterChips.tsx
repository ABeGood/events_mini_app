// src/components/FilterChips/FilterChips.tsx
import { FC } from 'react';

interface FilterChipsProps {
    chips: string[];
    selectedChips: string[];
    onToggleChip: (chip: string) => void;
}

export const FilterChips: FC<FilterChipsProps> = ({ chips, selectedChips, onToggleChip }) => {
    return (
        <div className="chips-container">
            <div className="chips">
                {chips.map(chip => (
                    <span
                        key={chip}
                        className={`chip ${selectedChips.includes(chip) ? 'chip-active' : ''}`}
                        onClick={() => onToggleChip(chip)}
                    >
                        {chip}
                    </span>
                ))}
            </div>
        </div>
    );
};