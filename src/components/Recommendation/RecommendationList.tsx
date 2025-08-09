import React from 'react';
import RecommendationCard from './RecommendationCard';
import styles from './RecommendationList.module.css';
import { mockRecommendations } from './data';

const RecommendationList: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Recommendation</h2>
      <div className={styles.scrollContainer}>
        {mockRecommendations.map((item, index) => (
          <div
            key={item.id}
            style={{
              marginRight:
                index === mockRecommendations.length - 1 ? '-16px' : undefined,
            }}
          >
            <RecommendationCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecommendationList;