// src/components/BottomSheet/BottomSheetContainer.tsx
import React, { PropsWithChildren, useState, useRef} from 'react';
import styles from './BottomSheetContainer.module.css';

interface BottomSheetContainerProps {
  className?: string;
  onPositionChange?: (position: 'collapsed' | 'expanded') => void;
  initialPosition?: 'collapsed' | 'expanded';
}

const BottomSheetContainer: React.FC<PropsWithChildren<BottomSheetContainerProps>> = ({
  children,
  className = '',
  initialPosition = 'expanded'
}) => {
  const [position] = useState<'collapsed' | 'expanded'>(initialPosition);
  const [isDragging] = useState(false);
  const [dragOffset] = useState(0);
  const [hasStartedDrag] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);


  // Calculate transform based on drag position
  const getTransform = () => {
    // Get base transform for current position
    let baseTransform = '';
    if (position === 'collapsed') {
      baseTransform = 'translateY(calc(100% - 350px))'; // Changed from 80px to 120px
    } else {
      baseTransform = 'translateY(0)';
    }

    // If not dragging, return base transform
    if (!isDragging) {
      return baseTransform;
    }

    // Apply resistance when dragging beyond bounds
    let effectiveDragOffset = dragOffset;

    // Apply resistance based on position state
    if (position === 'expanded') {
      // When expanded, prevent upward drag (attached to bottom), allow downward
      if (dragOffset < 0) {
        // Upward drag - prevent any movement (attached to bottom)
        effectiveDragOffset = 0;
      } else {
        // Downward drag - allow with slight resistance after threshold
        effectiveDragOffset = dragOffset > 150 ? 150 + (dragOffset - 150) * 0.3 : dragOffset;
      }
    } else {
      // When collapsed, allow upward drag, resist downward
      if (dragOffset > 0) {
        // Downward drag - apply resistance
        effectiveDragOffset = dragOffset * 0.3;
      } else {
        // Upward drag - allow with slight resistance after threshold
        effectiveDragOffset = dragOffset < -150 ? -150 + (dragOffset + 150) * 0.3 : dragOffset;
      }
    }

    // Combine base position with drag offset
    if (position === 'collapsed') {
      return `translateY(calc(100% - 350px + ${effectiveDragOffset}px))`; // Changed from 80px to 120px
    } else {
      return `translateY(${effectiveDragOffset}px)`;
    }
  };

  return (
    <div
      ref={sheetRef}
      className={`${styles.sheet} ${styles[position]} ${className} ${isDragging ? styles.dragging : ''}`}
      style={{
        transform: getTransform(),
        // Override CSS transitions during drag
        transition: isDragging && hasStartedDrag ? 'none' : undefined
      }}
    >
      <div
        className={styles.dragHandle}
        role="button"
        tabIndex={0}
        aria-label="Drag to expand or collapse"
      >
        <div className={styles.dragIndicator} />
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default BottomSheetContainer;