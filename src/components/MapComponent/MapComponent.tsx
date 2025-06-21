import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CATEGORY_COLORS } from '../../constants/filterConstants';
import './MapComponent.css';

type Coordinates = [number, number];

interface Event {
    id: number;
    coords: Coordinates;
    image: string;
    category: string;
}

interface MapComponentProps {
    lng?: number;
    lat?: number;
    zoom?: number;
    onMapLoad?: (map: maplibregl.Map) => void;
    onUserPositionChange?: (coords: [number, number]) => void;
}

export const MapComponent = forwardRef<maplibregl.Map | undefined, MapComponentProps>(
    ({ lng = 14.4378, lat = 50.0755, zoom = 14, onMapLoad, onUserPositionChange }, ref) => {
        const mapContainer = useRef<HTMLDivElement | null>(null);
        const map = useRef<maplibregl.Map | null>(null);
        const userPosition = useRef<[number, number]>([lng, lat]);

        useImperativeHandle(ref, () => map.current ?? undefined);

        useEffect(() => {
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

            map.current.once('load', () => {
                console.log('MAP LOADED');
                onMapLoad?.(map.current!);
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

                    onUserPositionChange?.(userPosition.current);

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
                            onUserPositionChange?.(userPosition.current);
                        },
                        (err) => {
                            console.error('watchPosition error:', err);
                        },
                        { enableHighAccuracy: true }
                    );
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true
                }
            );

            const getRandomCoord = (): Coordinates => {
                const delta = 0.01;
                return [
                    lng + (Math.random() - 0.5) * delta,
                    lat + (Math.random() - 0.5) * delta
                ];
            };

            const events: Event[] = [
                { id: 1, coords: getRandomCoord(), image: 'https://s1.ticketm.net/dam/a/460/34410a17-4f62-43d2-a9df-f4ab8e2c5460_EVENT_DETAIL_PAGE_16_9.jpg', category: 'Music' },
                { id: 2, coords: getRandomCoord(), image: 'https://i.imgur.com/SdKQbZT.png', category: 'Arts & Theatre' },
                { id: 3, coords: getRandomCoord(), image: 'https://i.imgur.com/uIgDDDd.png', category: 'Clubs' },
            ];

            events.forEach(e => {
                const el = document.createElement('div');
                el.className = 'event-marker';
                el.style.borderColor = CATEGORY_COLORS[e.category] || '#1D965C';

                const img = document.createElement('img');
                img.src = e.image;
                img.alt = 'Event';
                img.onerror = () => {
                    img.src = 'https://placekitten.com/200/200';
                };

                el.appendChild(img);

                new maplibregl.Marker({ element: el })
                    .setLngLat(e.coords)
                    .addTo(map.current!);
            });

        }, [lng, lat, zoom]);

        return <div ref={mapContainer} className="map-container" />;
    }
);
