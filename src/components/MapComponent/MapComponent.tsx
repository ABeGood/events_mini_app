// src/components/MapComponent/MapComponent.tsx
import { FC, useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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
}

export const MapComponent: FC<MapComponentProps> = ({
    lng = 14.4378,
    lat = 50.0755,
    zoom = 14
}) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const routeMarkersRef = useRef<maplibregl.Marker[]>([]);
    const userPosition = useRef<[number, number]>([lng, lat]);

    const categoryColors: { [key: string]: string } = {
        'Music': '#1D965C',
        'Arts & Theatre': '#7E1D96',
        'Clubs': '#961D1D',
    };

    useEffect(() => {
        if (map.current) return;

        // Initialize map
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

        // Hide default map labels
        map.current.on('style.load', () => {
            map.current!.getStyle().layers?.forEach(layer => {
                if (layer.type === 'symbol' || layer.type === 'circle') {
                    map.current!.setLayoutProperty(layer.id, 'visibility', 'none');
                }
            });
        });

        // Setup geolocation
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLng = position.coords.longitude;
                const userLat = position.coords.latitude;

                userPosition.current = [userLng, userLat];

                // Create user marker
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

                // Watch position
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

                // Device orientation
                const rotateHandler = (event: DeviceOrientationEvent) => {
                    const heading = event.alpha;
                    if (typeof heading === 'number') {
                        el.style.transform = `rotate(${heading}deg)`;
                    }
                };

                if (typeof DeviceOrientationEvent !== 'undefined') {
                    const DeviceOrientationEventAny = DeviceOrientationEvent as any;

                    if (typeof DeviceOrientationEventAny.requestPermission === 'function') {
                        DeviceOrientationEventAny.requestPermission()
                            .then((state: 'granted' | 'denied' | 'default') => {
                                if (state === 'granted') {
                                    window.addEventListener('deviceorientation', rotateHandler);
                                }
                            })
                            .catch(console.error);
                    } else {
                        window.addEventListener('deviceorientationabsolute', rotateHandler);
                        window.addEventListener('deviceorientation', rotateHandler);
                    }
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true
            }
        );

        // Add demo events
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

        // Add event markers
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

            // Route functionality
            el.addEventListener('click', () => {
                const [fromLng, fromLat] = userPosition.current;
                const MAPBOX_TOKEN = 'pk.eyJ1IjoianBlZ3R1cmJvIiwiYSI6ImNtYzJndXl4bzA3azEyanNrNGh0a20xN3EifQ.hjDsgozZ5D4UrYZlNSa2Ag';

                fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${fromLng},${fromLat};${e.coords[0]},${e.coords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`)
                    .then(res => res.json())
                    .then(data => {
                        const route = data.routes[0]?.geometry;
                        const duration = data.routes[0]?.duration;

                        if (!route) {
                            console.warn('No route found');
                            return;
                        }

                        // Clear old route markers
                        routeMarkersRef.current.forEach(marker => marker.remove());
                        routeMarkersRef.current = [];

                        // Draw route points
                        setTimeout(() => {
                            route.coordinates.forEach((coord: Coordinates, index: number) => {
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

                            // Add duration label
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

            new maplibregl.Marker({ element: el })
                .setLngLat(e.coords)
                .addTo(map.current!);
        });

    }, [lng, lat, zoom]);

    return <div ref={mapContainer} className="map-container" />;
};