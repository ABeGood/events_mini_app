import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

declare global {
  interface Window {
    Telegram: any;
  }
}

const allChips = ['Under 18', '18+', 'Family', 'Free entry', 'Festivals', 'Sports', 'More'];

const eventCategories = [
  { title: 'Music', color: '#1D965C', items: Array(12).fill('Alternative/Indie Rock') },
  { title: 'Arts & Theatre', color: '#7E1D96', items: Array(12).fill('Classical') },
  { title: 'Clubs', color: '#961D1D', items: Array(12).fill('Dance/Electronic') },
];

export const IndexPage = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);

  const routeMarkersRef = useRef<maplibregl.Marker[]>([]); // 👉 фикс!

  const [sheetPosition, setSheetPosition] = useState(0);
  const [lng] = useState(14.4378);
  const [lat] = useState(50.0755);
  const [zoom] = useState(14);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<{ [key: string]: string[] }>({});

  const userPosition = useRef<[number, number]>([lng, lat]);

  const categoryColors: { [key: string]: string } = {
    'Music': '#1D965C',
    'Arts & Theatre': '#7E1D96',
    'Clubs': '#961D1D',
  };

  useEffect(() => {
    if (window.Telegram?.WebApp?.expand) {
      window.Telegram.WebApp.expand();
    }

    if (map.current) return;

    const hour = new Date().getHours();
    const isNight = hour >= 18 || hour < 6;
    const style = isNight
      ? 'https://api.maptiler.com/maps/darkmatter/style.json?key=I9FUhj5Q1VfXxZWCO8Ky'
      : 'https://api.maptiler.com/maps/positron/style.json?key=I9FUhj5Q1VfXxZWCO8Ky';

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style,
      center: [lng, lat],
      zoom: zoom,
      attributionControl: false,
    });

    map.current.on('style.load', () => {
      map.current!.getStyle().layers?.forEach(layer => {
        if (layer.type === 'symbol' || layer.type === 'circle') {
          map.current!.setLayoutProperty(layer.id, 'visibility', 'none');
        }
      });
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLng = position.coords.longitude;
        const userLat = position.coords.latitude;

        userPosition.current = [userLng, userLat];

        const el = document.createElement('div');
        el.style.width = '58px';
        el.style.height = '68px';
        el.style.backgroundImage = 'url("https://mailer.ucliq.com/wizz/frontend/assets/files/customer/kd629xy3hj208/blue_circle_cone.png")';
        el.style.backgroundSize = 'contain';
        el.style.backgroundRepeat = 'no-repeat';
        el.style.transformOrigin = 'center center';

        const userMarker = new maplibregl.Marker({ element: el })
          .setLngLat([userLng, userLat])
          .addTo(map.current!);

        navigator.geolocation.watchPosition(
          (pos) => {
            const lng = pos.coords.longitude;
            const lat = pos.coords.latitude;
            userMarker.setLngLat([lng, lat]);
            userPosition.current = [lng, lat];
          },
          (err) => {
            console.error('watchPosition error:', err);
          },
          { enableHighAccuracy: true }
        );

        const rotateHandler = (event: DeviceOrientationEvent) => {
          const heading = event.alpha;
          if (typeof heading === 'number') {
            el.style.transform = `rotate(${heading}deg)`;
          }
        };

        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then((state) => {
              if (state === 'granted') {
                window.addEventListener('deviceorientation', rotateHandler);
              }
            })
            .catch(console.error);
        } else {
          window.addEventListener('deviceorientationabsolute', rotateHandler);
          window.addEventListener('deviceorientation', rotateHandler);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true
      }
    );

    const getRandomCoord = () => {
      const delta = 0.01;
      return [
        lng + (Math.random() - 0.5) * delta,
        lat + (Math.random() - 0.5) * delta
      ];
    };

    const events = [
      { id: 1, coords: getRandomCoord(), image: 'https://s1.ticketm.net/dam/a/460/34410a17-4f62-43d2-a9df-f4ab8e2c5460_EVENT_DETAIL_PAGE_16_9.jpg', category: 'Music' },
      { id: 2, coords: getRandomCoord(), image: 'https://i.imgur.com/SdKQbZT.png', category: 'Arts & Theatre' },
      { id: 3, coords: getRandomCoord(), image: 'https://i.imgur.com/uIgDDDd.png', category: 'Clubs' },
    ];

    events.forEach(e => {
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.style.borderColor = categoryColors[e.category] || '#1D965C';

      const img = document.createElement('img');
      img.src = e.image;
      img.alt = 'Event';
      img.onerror = () => {
        img.src = 'https://placekitten.com/200/200';
      };

      el.appendChild(img);

      const marker = new maplibregl.Marker({ element: el }).setLngLat(e.coords).addTo(map.current!);

      el.addEventListener('click', () => {
        const [fromLng, fromLat] = userPosition.current;
        const MAPBOX_TOKEN = 'pk.eyJ1IjoianBlZ3R1cmJvIiwiYSI6ImNtYzJndXl4bzA3azEyanNrNGh0a20xN3EifQ.hjDsgozZ5D4UrYZlNSa2Ag'; // вставь сюда свой токен

        fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${fromLng},${fromLat};${e.coords[0]},${e.coords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`)
          .then(res => res.json())
          .then(data => {
            const route = data.routes[0]?.geometry;
            const duration = data.routes[0]?.duration;

            if (!route) {
              console.warn('No route found');
              return;
            }

            // Удалить старые маркеры
            routeMarkersRef.current.forEach(marker => marker.remove());
            routeMarkersRef.current = [];

            // Отрисовать точки
            setTimeout(() => {
              route.coordinates.forEach((coord, index) => {
                if (index % 1 === 0) {
                  const dot = document.createElement('div');
                  dot.className = 'route-dot';
                  dot.style.width = '10px';
                  dot.style.height = '10px';
                  dot.style.borderRadius = '50%';
                  dot.style.background = '#1D96FF';
                  dot.style.boxShadow = '0 0 4px rgba(0,0,0,0.4)';
                  dot.style.opacity = '0.9';

                  const marker = new maplibregl.Marker({ element: dot })
                    .setLngLat(coord)
                    .addTo(map.current!);

                  routeMarkersRef.current.push(marker);
                }
              });

              // Label
              const label = document.createElement('div');
              label.className = 'route-label';
              label.style.padding = '6px 10px';
              label.style.borderRadius = '14px';
              label.style.background = '#FFFFFF';
              label.style.color = '#2F313F';
              label.style.fontSize = '14px';
              label.style.fontWeight = '600';
              label.style.boxShadow = '0 2px 6px rgba(144, 144, 144, 0.3)';
              label.innerText = `🚶‍♂️ ${Math.round(duration / 60)} мин`;

              const labelMarker = new maplibregl.Marker({ element: label })
                .setLngLat(e.coords)
                .addTo(map.current!);

              routeMarkersRef.current.push(labelMarker);
            }, 300);
          })
          .catch(err => {
            console.error('Directions error:', err);
          });
      });
    });
  }, []);



  // Свайп панели
  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    const onTouchStart = (e: TouchEvent) => {
      isDragging = true;
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      if (deltaY < -50) {
        setSheetPosition(1);
      } else if (deltaY > 50) {
        setSheetPosition(0);
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    sheet.addEventListener('touchstart', onTouchStart);
    sheet.addEventListener('touchmove', onTouchMove);
    sheet.addEventListener('touchend', onTouchEnd);

    return () => {
      sheet.removeEventListener('touchstart', onTouchStart);
      sheet.removeEventListener('touchmove', onTouchMove);
      sheet.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const toggleCard = (category: string, item: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const exists = current.includes(item);
      const updated = exists ? current.filter(i => i !== item) : [...current, item];
      return { ...prev, [category]: updated };
    });
  };

  return (
    <div className="telegram-app-container">
      <div ref={mapContainer} className="map-container" />
      <div
        ref={sheetRef}
        className={`bottom-sheet ${sheetPosition === 1 ? 'open' : ''}`}
      >
        <div className="handle"></div>
        <div className="filter-header">
          <h3>Filters</h3>
          <p>364+ events available</p>
        </div>
        <div className="chips-container">
          <div className="chips">
            {allChips.map(chip => (
              <span
                key={chip}
                className={`chip ${selectedChips.includes(chip) ? 'chip-active' : ''}`}
                onClick={() => toggleChip(chip)}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <hr />
        <div className="filter-scroll">
          {eventCategories.map(cat => (
            <div key={cat.title} className="filter-section">
              <div className="filter-section-header">
                <div className="filter-section-title">
                  <span className="dot" style={{ backgroundColor: cat.color }} />
                  <span className="title-text">{cat.title}</span>
                </div>
                <span className="select-label" style={{ color: cat.color }}>
                  {selectedFilters[cat.title]?.length
                    ? `Selected(${selectedFilters[cat.title].length})`
                    : 'Select'}
                </span>
              </div>
              <div className="filter-cards-horizontal">
                {cat.items.map((item, index) => {
                  const isSelected = selectedFilters[cat.title]?.includes(item);
                  return (
                    <div
                      key={`${item}-${index}`}
                      className={`card ${isSelected ? 'card-selected' : ''}`}
                      onClick={() => toggleCard(cat.title, item)}
                    >
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
