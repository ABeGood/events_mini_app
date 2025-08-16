import React from 'react';
import styles from './SideDrawer.module.css';
import DrawerUserBlock from './DrawerUserBlock';
import DrawerCard from './DrawerCard';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, children }) => {
  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.drawer} ${isOpen ? styles.open : ''}`}>
        <DrawerUserBlock />
        <DrawerCard />
        {children}
      </div>
    </>
  );
};

export default SideDrawer;
