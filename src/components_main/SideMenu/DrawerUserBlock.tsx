import React from 'react';
import styles from './DrawerUserBlock.module.css';

const DrawerUserBlock: React.FC = () => {
  return (
    <div className={styles.user}>
      <div className={styles.avatar} />
      <div className={styles.info}>
        <div className={styles.name}>User Name</div>
        <div className={styles.sub}>My account</div>
      </div>
    </div>
  );
};

export default DrawerUserBlock;
