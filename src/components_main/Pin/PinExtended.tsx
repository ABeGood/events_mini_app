import React from 'react';
import styles from './Pin.module.css';

interface PinExtendedProps {
  avatarUrl: string;
  name: string;
}

const PinExtended: React.FC<PinExtendedProps> = ({ avatarUrl, name }) => (
  <div className={styles.extendedWrapper}>
    <img src={avatarUrl} alt="Event" className={styles.avatar} />
    <span className={styles.label}>{name}</span>
    <div className={styles.tip} />
  </div>
);

export default PinExtended;
