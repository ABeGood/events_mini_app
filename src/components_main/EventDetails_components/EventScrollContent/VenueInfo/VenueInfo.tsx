import styles from './VenueInfo.module.css';

export default function VenueInfo() {
  const randomAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-T3-SVkSrIwsGE3RCsko8dIQDF_OzrApJBA&s';

  return (
    <div className={styles.venueBlock}>
      <h2 className={styles.venueTitle}>Venue Information</h2>
      <div className={styles.venueContent}>
        <div className={styles.venueAvatar}>
          <img src={randomAvatar} alt="Venue" className={styles.venueImage} />
        </div>
        <div className={styles.venueDetails}>
          <div className={styles.venueName}>Archa+</div>
          <div className={styles.venueAddress}>
            Na Poříčí 1047/26, 110 00 Florenc
          </div>
        </div>
      </div>
    </div>
  );
}
