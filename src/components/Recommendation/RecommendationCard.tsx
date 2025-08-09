// src/components_main/Recommendation/RecommendationCard.tsx
import React from 'react';
import styles from './RecommendationCard.module.css';
import clsx from 'clsx';
import { Heart } from 'lucide-react';


interface Props {
  imageUrl: string;
  title: string;
  category: string;
  location: string;
  onFavoriteToggle?: () => void;
}

const RecommendationCard: React.FC<Props> = ({
  imageUrl,
  title,
  category,
  location,
  onFavoriteToggle,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        <img src={imageUrl} alt={title} className={styles.image} />
        <div className={styles.overlay}>
          <span className={clsx('chip', category.toLowerCase().replace(/[^a-z]/g, ''))}>
            {category}
          </span>
          <button className={styles.favoriteButton} onClick={onFavoriteToggle}>
            <Heart size={20} strokeWidth={2} />
          </button>

        </div>
      </div>
      <div className={styles.textWrapper}>
        <h4 className={styles.title}>{title}</h4>
        <div className={styles.meta}>{category}</div>
        <div className={styles.meta}>{location}</div>
      </div>
    </div>
  );
};

export default RecommendationCard;
