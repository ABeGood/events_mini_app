import styles from './Hero.module.css';
import { Heart } from 'lucide-react';

export default function Hero() {
  return (
    <div className={styles.heroWrapper}>
      <img
        src="https://dynamicmedia.livenationinternational.com/c/n/p/c3ab2784-31e7-4e9d-bb8b-07b61ab0ec65.png?format=webp&width=3840&quality=75"
        alt="Event"
        className={styles.heroImage}
      />
      <button className={styles.heartButton}>
        <Heart size={24} strokeWidth={2} />
      </button>
    </div>
  );
}
