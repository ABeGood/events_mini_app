// src/components/BottomSheet/BottomSheetContainer.tsx
import React, { PropsWithChildren, useState, useRef, useEffect, useCallback } from 'react';
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
  const [hasStartedDrag, setHasStartedDrag] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  // iPhone detection helper
  const isIPhone = useCallback(() => {
    return /iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }, []);

  // Enhanced event stopping for iPhone
  const stopEventPropagation = useCallback((e: TouchEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if this is a native TouchEvent (has stopImmediatePropagation)
    if ('stopImmediatePropagation' in e && typeof e.stopImmediatePropagation === 'function') {
      e.stopImmediatePropagation();
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    // iPhone: Immediately claim this gesture to prevent app-level handling
    if (isIPhone()) {
      stopEventPropagation(e);
    }
    
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setDragOffset(0);
    setHasStartedDrag(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    // iPhone: Always prevent event propagation during our gesture
    if (isIPhone()) {
      stopEventPropagation(e);
    }

    const newY = e.touches[0].clientY;
    setCurrentY(newY);

    const deltaY = newY - startY;
    setDragOffset(deltaY);

    // Only start preventing default after movement threshold is reached
    if (!hasStartedDrag && Math.abs(deltaY) > 10) {
      setHasStartedDrag(true);
    }

    // Prevent scrolling only after drag has started
    if (hasStartedDrag || isIPhone()) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e?: React.TouchEvent) => {
    if (!isDragging) return;

    // iPhone: Ensure event doesn't propagate to app-level handlers
    if (isIPhone() && e) {
      stopEventPropagation(e);
    }

    setIsDragging(false);

    // Only process position change if actual dragging occurred
    if (hasStartedDrag) {
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
    }

    // Reset tracking variables
    setStartY(0);
    setCurrentY(0);
    setDragOffset(0);
    setHasStartedDrag(false);
  };

  // Container-specific handlers for collapsed state
  const handleContainerTouchStart = (e: React.TouchEvent) => {
    // Only handle if not starting from drag handle or interactive content
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.dragHandle}`) ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('[data-clickable]')) {
      return; // Let the interactive element handle it
    }

    // iPhone: Mark this area as BottomSheet territory
    if (isIPhone()) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Don't set isDragging immediately - wait for movement
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setDragOffset(0);
    setHasStartedDrag(false);
  };

  const handleContainerTouchMove = (e: React.TouchEvent) => {
    // Only start dragging if we have a valid start position and enough movement
    if (startY === 0) return;

    // iPhone: Always handle our events to prevent app gestures
    if (isIPhone()) {
      stopEventPropagation(e);
    }

    const newY = e.touches[0].clientY;
    const deltaY = newY - startY;

    // Only initiate drag after significant movement (15px threshold)
    if (!isDragging && Math.abs(deltaY) > 15) {
      setIsDragging(true);
      setHasStartedDrag(true);
    }

    if (isDragging) {
      setCurrentY(newY);
      setDragOffset(deltaY);
      e.preventDefault(); // Only prevent default after drag starts
    }
  };

  const handleContainerTouchEnd = (e: React.TouchEvent) => {
    // iPhone: Ensure our touch end doesn't trigger app gestures
    if (isIPhone()) {
      stopEventPropagation(e);
    }

    // Only process if we actually started dragging
    if (!isDragging) {
      // Reset without processing - this was likely a tap
      setStartY(0);
      setCurrentY(0);
      setDragOffset(0);
      return;
    }

    handleTouchEnd(e);
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    // Only handle if not starting from drag handle or interactive content
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.dragHandle}`) ||
      target.closest('button') ||
      target.closest('[role="button"]') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('[data-clickable]')) {
      return; // Let the interactive element handle it
    }

    // Don't set isDragging immediately - wait for movement
    setStartY(e.clientY);
    setCurrentY(e.clientY);
    setDragOffset(0);
    setHasStartedDrag(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setCurrentY(e.clientY);
    setDragOffset(0);
    setHasStartedDrag(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newY = e.clientY;
    setCurrentY(newY);

    const deltaY = newY - startY;
    setDragOffset(deltaY);

    // Only start preventing default after movement threshold is reached
    if (!hasStartedDrag && Math.abs(deltaY) > 10) {
      setHasStartedDrag(true);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // Only process position change if actual dragging occurred
    if (hasStartedDrag) {
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
    }

    setStartY(0);
    setCurrentY(0);
    setDragOffset(0);
    setHasStartedDrag(false);
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
  }, [isDragging, currentY, startY, position, hasStartedDrag]);

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
      // Add touch handlers to the whole container when collapsed
      onTouchStart={position === 'collapsed' ? handleContainerTouchStart : undefined}
      onTouchMove={position === 'collapsed' ? handleContainerTouchMove : undefined}
      onTouchEnd={position === 'collapsed' ? handleContainerTouchEnd : undefined}
      onMouseDown={position === 'collapsed' ? handleContainerMouseDown : undefined}
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