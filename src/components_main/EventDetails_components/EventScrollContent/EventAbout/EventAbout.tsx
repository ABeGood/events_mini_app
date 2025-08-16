import { useState } from "react";
import styles from "./EventAbout.module.css";

export default function EventAbout() {
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => setExpanded(!expanded);

  return (
    <div className={styles.aboutWrapper}>
      <h2 className={styles.title}>About event</h2>
      <div className={`${styles.textContainer} ${expanded ? styles.expanded : ""}`}>
        <p>
          Music that sounds like a black-and-white romantic movie. Belgian project Warhaus is heading to Prague with their melancholic, amorous music.
        </p>
        <p>
          Warhaus was originally formed as a side project of Maarten Devoldere, the lead singer of Belgian pop rock band Balthazar. The lyrics, which are engraved not only in one's memory, but above all deep in one's heart, in many cases seem like art coming straight from the poet's pen. The delicate piano accompaniment, heart-rending melodies and a touch of French romance are among the established certainties at Warhaus. His second eponymous album is proof, with references to Leonard Cohen, Serge Gainsbourg and Tom Waits.
        </p>
        {!expanded && <div className={styles.blurOverlay} />}
      </div>
      {!expanded && (
        <button className={styles.moreButton} onClick={handleToggle}>
          ...
        </button>
      )}
    </div>
  );
}
