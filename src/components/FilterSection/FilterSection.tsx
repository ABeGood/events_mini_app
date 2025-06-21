// src/components/FilterSection/FilterSection.tsx
import { FC } from 'react';

interface FilterSectionProps {
    title: string;
    color: string;
    items: readonly string[];
    selectedItems: string[];
    onToggleItem: (item: string) => void;
}

export const FilterSection: FC<FilterSectionProps> = ({
    title,
    color,
    items,
    selectedItems,
    onToggleItem
}) => {
    return (
        <div className="filter-section">
            <div className="filter-section-header">
                <div className="filter-section-title">
                    <span className="dot" style={{ backgroundColor: color }} />
                    <span className="title-text">{title}</span>
                </div>
                <span className="select-label" style={{ color }}>
                    {selectedItems.length
                        ? `Selected(${selectedItems.length})`
                        : 'Select'}
                </span>
            </div>
            <div className="filter-cards-horizontal">
                {items.map((item, index) => {
                    const isSelected = selectedItems.includes(item);
                    return (
                        <div
                            key={`${item}-${index}`}
                            className={`card ${isSelected ? 'card-selected' : ''}`}
                            onClick={() => onToggleItem(item)}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};