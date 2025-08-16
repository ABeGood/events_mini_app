import styles from './EventHeaderCard.module.css';
import EventPriceButton from './EventPriceButton';

export default function EventHeaderCard() {
  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Warhaus in Prague</h1>
      <p className={styles.date}>10 August at 16:00, Archa+</p>
      <EventPriceButton />
    </div>
  );
}
