// src/components_main/UserLocationMarker/UserLocationMarker.tsx
import React from 'react';
import styles from './UserLocationMarker.module.css';

interface UserLocationMarkerProps {
  size?: number;
}

export const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ size = 20 }) => {
  return (
    <div
      className={styles.userMarker}
      style={{ width: size, height: size }}
    />
  );
};

export default UserLocationMarker;
