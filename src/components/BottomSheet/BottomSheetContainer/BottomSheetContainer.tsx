// src/components/BottomSheet/BottomSheetContainer.tsx
import React, { PropsWithChildren, useState, useRef, useEffect } from 'react';
import styles from './BottomSheetContainer.module.css';

interface BottomSheetContainerProps {
  className?: string;
  onPositionChange?: (position: 'collapsed' | 'expanded') => void;
  initialPosition?: 'collapsed' | 'expanded';
}

const BottomSheetContainer: React.FC<PropsWithChildren<BottomSheetContainerProps>> = ({
  children,
  className = '',
  onPositionChange,
  initialPosition = 'expanded'
}) => {
  const [position, setPosition] = useState<'collapsed' | 'expanded'>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const newY = e.touches[0].clientY;
    setCurrentY(newY);

    const deltaY = newY - startY;
    setDragOffset(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const deltaY = currentY - startY;
    const threshold = 80; // Minimum swipe distance to trigger change
    const velocity = Math.abs(deltaY);

    // Determine if position should change based on distance and direction
    let shouldChangePosition = false;
    let newPosition: 'collapsed' | 'expanded' = position;

    if (velocity > threshold) {
      if (deltaY > 0 && position === 'expanded') {
        // Swiped down while expanded - collapse
        shouldChangePosition = true;
        newPosition = 'collapsed';
      } else if (deltaY < 0 && position === 'collapsed') {
        // Swiped up while collapsed - expand
        shouldChangePosition = true;
        newPosition = 'expanded';
      }
    } else {
      // If drag was less than threshold, check if we've dragged more than halfway
      const halfwayPoint = 120;
      if ((position === 'expanded' && deltaY > halfwayPoint) ||
        (position === 'collapsed' && deltaY < -halfwayPoint)) {
        shouldChangePosition = true;
        newPosition = position === 'expanded' ? 'collapsed' : 'expanded';
      }
    }

    if (shouldChangePosition) {
      setPosition(newPosition);
      onPositionChange?.(newPosition);
    }

    // Reset tracking variables
    setStartY(0);
    setCurrentY(0);
    setDragOffset(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
    setDragOffset(0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newY = e.clientY;
    setCurrentY(newY);

    const deltaY = newY - startY;
    setDragOffset(deltaY);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    const deltaY = currentY - startY;
    const threshold = 80;
    const velocity = Math.abs(deltaY);

    let shouldChangePosition = false;
    let newPosition: 'collapsed' | 'expanded' = position;

    if (velocity > threshold) {
      if (deltaY > 0 && position === 'expanded') {
        shouldChangePosition = true;
        newPosition = 'collapsed';
      } else if (deltaY < 0 && position === 'collapsed') {
        shouldChangePosition = true;
        newPosition = 'expanded';
      }
    } else {
      const halfwayPoint = 120;
      if ((position === 'expanded' && deltaY > halfwayPoint) ||
        (position === 'collapsed' && deltaY < -halfwayPoint)) {
        shouldChangePosition = true;
        newPosition = position === 'expanded' ? 'collapsed' : 'expanded';
      }
    }

    if (shouldChangePosition) {
      setPosition(newPosition);
      onPositionChange?.(newPosition);
    }

    setStartY(0);
    setCurrentY(0);
    setDragOffset(0);
  };

  // Mouse event listeners for desktop
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, currentY, startY, position]);

  // Calculate transform based on drag position
  const getTransform = () => {
    // Get base transform for current position
    let baseTransform = '';
    if (position === 'collapsed') {
      baseTransform = 'translateY(calc(100% - 140px))';
    } else {
      baseTransform = 'translateY(0)';
    }

    // If not dragging, return base transform
    if (!isDragging) {
      return baseTransform;
    }

    // Apply resistance when dragging beyond bounds
    let effectiveDragOffset = dragOffset;

    // Apply symmetric resistance for both states
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
      return `translateY(calc(100% - 80px + ${effectiveDragOffset}px))`;
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
        transition: isDragging ? 'none' : undefined
      }}
    >
      <div
        className={styles.dragHandle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
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