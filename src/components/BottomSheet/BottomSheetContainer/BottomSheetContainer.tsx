// src/components/BottomSheet/BottomSheetContainer.tsx
import React, { PropsWithChildren, useState, useRef, useEffect } from 'react';
import { useTelegramGestures } from '../../../hooks/useTelegramGestures';
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
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const lastScrollTop = useRef(0);

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
    setStartY(e.touches[0].clientY);
    setCurrentY(e.touches[0].clientY);
    setDragOffset(0);
    
    setIsDragging(true);
    return true; // Capture this gesture
  };

  const onGestureMove = (e: TouchEvent) => {
    if (!isDragging) return;

    const newY = e.touches[0].clientY;
    setCurrentY(newY);

    const deltaY = newY - startY;
    setDragOffset(deltaY);
  };

  const onGestureEnd = (_e: TouchEvent) => {
    if (!isDragging) return;

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
      handlePositionChange(newPosition);
    }

    setIsDragging(false);
    setStartY(0);
    setCurrentY(0);
    setDragOffset(0);
  };

  // Handle content scroll to prevent rubber band on scroll down only
  const handleContentScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const currentScrollTop = target.scrollTop;
    const isScrollingDown = currentScrollTop > lastScrollTop.current;
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1;
    
    if (isScrollingDown && isAtBottom && position === 'expanded') {
      // Prevent rubber band on scroll down when at bottom
      target.style.overscrollBehavior = 'none';
    } else {
      // Allow rubber band on scroll up or when not at bottom
      target.style.overscrollBehavior = 'auto';
    }
    
    lastScrollTop.current = currentScrollTop;
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
      <div 
        ref={contentRef}
        className={styles.content}
        onScroll={handleContentScroll}
      >
        {children}
      </div>
    </div>
  );
};

export default BottomSheetContainer;