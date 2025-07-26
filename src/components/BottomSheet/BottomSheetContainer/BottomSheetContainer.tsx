// src/components/BottomSheet/BottomSheetContainer.tsx
import React, { PropsWithChildren } from 'react';
import styles from './BottomSheetContainer.module.css';

interface BottomSheetContainerProps {
  className?: string;
}

const BottomSheetContainer: React.FC<PropsWithChildren<BottomSheetContainerProps>> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`${styles.sheet} ${className}`}>
      <div className={styles.dragIndicator} />
      {children}
    </div>
  );
};

export default BottomSheetContainer;
