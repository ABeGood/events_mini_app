import React from 'react';
import PinDot from './PinDot';
import PinPhoto from './PinPhoto';
import PinExtended from './PinExtended';

type Category =
  | 'music'
  | 'theatre'
  | 'sports'
  | 'art'
  | 'festivals'
  | 'wellness'
  | 'family'
  | 'talks'
  | 'food';

interface PinProps {
  zoomLevel: number;
  category: Category;
  avatarUrl: string;
  name: string;
}

const Pin: React.FC<PinProps> = ({ zoomLevel, category, avatarUrl, name }) => {
  if (zoomLevel < 12) {
    return <PinDot category={category} />;
  }

  if (zoomLevel < 15) {
    return <PinPhoto avatarUrl={avatarUrl} category={category} />;
  }

  return <PinExtended avatarUrl={avatarUrl} name={name} category={category} />;
};

export default Pin;
