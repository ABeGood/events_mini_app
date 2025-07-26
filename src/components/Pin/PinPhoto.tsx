import React from 'react';
import styles from './Pin.module.css';

interface PinPhotoProps {
  avatarUrl: string;
}

const PinPhoto: React.FC<PinPhotoProps> = ({ avatarUrl }) => (
  <div className={styles.photoWrapper}>
    <img src={avatarUrl} alt="Event" className={styles.avatar} />
    <div className={styles.tip} />
  </div>
);

export default PinPhoto;
