import React from 'react';
import styles from './DrawerCard.module.css';

const DrawerCard: React.FC = () => {
  return (
    <div className={styles.card}>
      <ul className={styles.menu}>
        <li>❤️ Favorites</li>
        <li>📍 My Events</li>
        <li>❓ Support</li>
        <li>ℹ️ About</li>
      </ul>
    </div>
  );
};

export default DrawerCard;
