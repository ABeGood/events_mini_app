import styles from './EventDetails.module.css';
import Hero from '../Hero/Hero';
import EventScrollContent from '../EventScrollContent/EventScrollContent';


export default function EventDetails() {
  return (
    <div className={styles.screen}>
      <Hero />
      <div className={styles.scrollOverlay}>
        <EventScrollContent />
      </div>
    </div>
  );
}