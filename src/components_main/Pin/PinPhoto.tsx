import React from 'react';
import styles from './Pin.module.css';
import classNames from 'classnames';

interface PinPhotoProps {
  avatarUrl: string;
  category: string;
}

const PinPhoto: React.FC<PinPhotoProps> = ({ avatarUrl, category }) => (
  <div className={classNames(styles.photoWrapper, styles[category])}>
    <img src={avatarUrl} alt="Event" className={styles.avatar} />
    <div className={styles.tip} />
  </div>
);

export default PinPhoto;
