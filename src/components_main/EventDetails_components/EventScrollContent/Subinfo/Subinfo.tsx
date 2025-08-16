
import styles from './Subinfo.module.css';

export default function Subinfo() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.line}>
        <span className={styles.label}>Genres:</span>
        <span className={styles.value}>
          <u>Indie</u>, <u>Rock</u>
        </span>
      </div>
      <div className={styles.line}>
        <span className={styles.label}>Age:</span>
        <span className={styles.value}>16+</span>
      </div>
    </div>
  );
}
