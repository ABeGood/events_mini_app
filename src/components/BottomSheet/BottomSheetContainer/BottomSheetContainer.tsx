// src/components/BottomSheet/BottomSheetContainer.tsx
import React, { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { useTelegramGestures, type GestureState } from '../../../hooks/useTelegramGestures';
import { useTelegramApp } from '../../../hooks/useTelegramApp';
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
  const [dragOffset, setDragOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const { triggerHaptic } = useTelegramApp();
  const { createGestureHandler } = useTelegramGestures();

  // Handle position change with haptic feedback
  const handlePositionChange = (newPosition: 'collapsed' | 'expanded') => {
    setPosition(newPosition);
    onPositionChange?.(newPosition);
    triggerHaptic('impact', 'medium');
  };

  // Gesture callbacks
  const onGestureStart = (e: TouchEvent) => {
    const target = e.target as HTMLElement;
    // Only capture gestures from drag handle
    if (!target.closest(`.${styles.dragHandle}`)) return false;
    
    setIsDragging(true);
    setDragOffset(0);
    return true; // Capture this gesture
  };

  const onGestureMove = (_e: TouchEvent, state: GestureState) => {
    if (!isDragging) return;

    // Apply resistance based on position and direction
    let effectiveDistance = state.gestureDistance;
    const direction = state.gestureDirection;

    if (position === 'expanded') {
      // When expanded, prevent upward drag, allow downward with resistance
      if (direction === 'up') {
        effectiveDistance = 0;
      } else {
        effectiveDistance = state.gestureDistance > 150 
          ? 150 + (state.gestureDistance - 150) * 0.3 
          : state.gestureDistance;
      }
    } else {
      // When collapsed, allow upward drag, resist downward
      if (direction === 'down') {
        effectiveDistance = state.gestureDistance * 0.3;
      } else {
        effectiveDistance = state.gestureDistance > 150 
          ? 150 + (state.gestureDistance - 150) * 0.3 
          : state.gestureDistance;
      }
    }

    setDragOffset(direction === 'down' ? effectiveDistance : -effectiveDistance);
  };

  const onGestureEnd = (_e: TouchEvent, state: GestureState) => {
    if (!isDragging) return;

    setIsDragging(false);
    setDragOffset(0);

    // Determine if position should change
    const threshold = 80;
    const halfwayPoint = 120;
    const distance = state.gestureDistance;
    const velocity = state.velocity || 0;
    const direction = state.gestureDirection;

    let shouldChangePosition = false;
    let newPosition: 'collapsed' | 'expanded' = position;

    // Fast gesture (high velocity)
    if (velocity > threshold) {
      if (direction === 'down' && position === 'expanded') {
        shouldChangePosition = true;
        newPosition = 'collapsed';
      } else if (direction === 'up' && position === 'collapsed') {
        shouldChangePosition = true;
        newPosition = 'expanded';
      }
    } 
    // Slow gesture (distance-based)
    else if (distance > halfwayPoint) {
      if (direction === 'down' && position === 'expanded') {
        shouldChangePosition = true;
        newPosition = 'collapsed';
      } else if (direction === 'up' && position === 'collapsed') {
        shouldChangePosition = true;
        newPosition = 'expanded';
      }
    }

    if (shouldChangePosition) {
      handlePositionChange(newPosition);
    }
  };

  // Create gesture handlers
  const gestureHandlers = createGestureHandler(onGestureStart, onGestureMove, onGestureEnd);

  // Add gesture listeners to drag handle
  useEffect(() => {
    const dragHandle = dragHandleRef.current;
    if (!dragHandle) return;

    dragHandle.addEventListener('touchstart', gestureHandlers.onTouchStart, gestureHandlers.options);
    dragHandle.addEventListener('touchmove', gestureHandlers.onTouchMove, gestureHandlers.options);
    dragHandle.addEventListener('touchend', gestureHandlers.onTouchEnd, gestureHandlers.options);

    return () => {
      dragHandle.removeEventListener('touchstart', gestureHandlers.onTouchStart);
      dragHandle.removeEventListener('touchmove', gestureHandlers.onTouchMove);
      dragHandle.removeEventListener('touchend', gestureHandlers.onTouchEnd);
    };
  }, [gestureHandlers]);

  // Calculate transform
  const getTransform = () => {
    const baseTransform = position === 'collapsed' 
      ? 'translateY(calc(100% - 350px))' 
      : 'translateY(0)';

    if (!isDragging) return baseTransform;

    if (position === 'collapsed') {
      return `translateY(calc(100% - 350px + ${dragOffset}px))`;
    } else {
      return `translateY(${dragOffset}px)`;
    }
  };

  return (
    <div
      ref={sheetRef}
      className={`${styles.sheet} ${styles[position]} ${className} ${isDragging ? styles.dragging : ''}`}
      style={{
        transform: getTransform(),
        transition: isDragging ? 'none' : undefined
      }}
    >
      <div
        ref={dragHandleRef}
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