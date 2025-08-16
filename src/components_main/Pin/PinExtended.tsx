import React from 'react';
import styles from './Pin.module.css';
import classNames from 'classnames';

interface PinExtendedProps {
  avatarUrl: string;
  name: string;
  category: string;
}

const PinExtended: React.FC<PinExtendedProps> = ({ avatarUrl, name, category }) => (
  <div className={classNames(styles.extendedWrapper, styles[category])}>
    <img src={avatarUrl} alt="Event" className={styles.avatar} />
    <span className={styles.label}>{name}</span>
    <div className={styles.tip} />
  </div>
);

export default PinExtended;
