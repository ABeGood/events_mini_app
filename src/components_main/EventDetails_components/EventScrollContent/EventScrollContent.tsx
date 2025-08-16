import styles from './EventScrollContent.module.css';
import EventHeaderCard from './EventHeaderCard/EventHeaderCard';
import EventAbout from "./EventAbout/EventAbout";
import VenueInfo from './VenueInfo/VenueInfo';
import Subinfo from './Subinfo/Subinfo';
import RecommendationList from '@/components_main/Recommendation/RecommendationList';


export default function EventScrollContent() {
  return (
    <div className={styles.scrollInner}>
      <EventHeaderCard />
      <EventAbout />
      <Subinfo />
      <VenueInfo />
      <RecommendationList />
      <RecommendationList />
    </div>
  );
}
