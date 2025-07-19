import React from 'react';
import styles from './Pin.module.css';
import classNames from 'classnames';

interface PinDotProps {
  category: string;
}

const PinDot: React.FC<PinDotProps> = ({ category }) => (
  <div className={classNames(styles.dot, styles[category])} />
);

export default PinDot;
