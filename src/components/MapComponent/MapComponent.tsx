import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CATEGORY_COLORS } from '../../constants/filterConstants';
import { EventType } from '../../types/eventTypes';
import './MapComponent.css';

type Coordinates = [number, number];

interface MapComponentProps {
    lng?: number;
    lat?: number;
    zoom?: number;
    onMapLoad?: (map: maplibregl.Map) => void;
    onUserPositionChange?: (coords: [number, number]) => void;
    onEventClick?: (event: EventType & { distance: number; duration: number }) => void;
}

export const MapComponent = forwardRef<maplibregl.Map | undefined, MapComponentProps>(
    ({ lng = 14.4378, lat = 50.0755, zoom = 14, onMapLoad, onUserPositionChange, onEventClick }, ref) => {
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

            const events: EventType[] = [
                {
                    id: 1,
                    coords: getRandomCoord(),
                    image: 'https://s1.ticketm.net/dam/a/460/34410a17-4f62-43d2-a9df-f4ab8e2c5460_EVENT_DETAIL_PAGE_16_9.jpg',
                    category: 'Music',
                    title: 'Jazz Festival',
                    description: 'Live jazz festival in the city center.',
                    address: 'Main Square, Prague',
                    time: '18:00 - 23:00'
                },
                {
                    id: 2,
                    coords: getRandomCoord(),
                    image: 'https://i.imgur.com/SdKQbZT.png',
                    category: 'Arts & Theatre',
                    title: 'Theatre Night',
                    description: 'Classical performance at National Theatre.',
                    address: 'National Theatre, Prague',
                    time: '19:00 - 21:00'
                },
                {
                    id: 3,
                    coords: getRandomCoord(),
                    image: 'https://i.imgur.com/uIgDDDd.png',
                    category: 'Clubs',
                    title: 'Night Club Party',
                    description: 'DJ set and party all night.',
                    address: 'Famous Club, Prague',
                    time: '22:00 - 5:00'
                },
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

                el.addEventListener('click', (ev) => {
                    ev.stopPropagation();

                    const [fromLng, fromLat] = userPosition.current;
                    const MAPBOX_TOKEN = 'pk.eyJ1IjoianBlZ3R1cmJvIiwiYSI6ImNtYzJndXl4bzA3azEyanNrNGh0a20xN3EifQ.hjDsgozZ5D4UrYZlNSa2Ag';

                    fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${fromLng},${fromLat};${e.coords[0]},${e.coords[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`)
                        .then(res => res.json())
                        .then(data => {
                            const route = data.routes[0]?.geometry;
                            const duration = data.routes[0]?.duration;
                            const distance = data.routes[0]?.distance;

                            if (!route) {
                                console.warn('No route found');
                                return;
                            }

                            if (onEventClick) {
                                onEventClick({
                                    ...e,
                                    duration,
                                    distance
                                });
                            }

                            const routeSourceId = 'route-source';
                            const routeLayerId = 'route-layer';

                            if (map.current?.getLayer(routeLayerId)) {
                                map.current.removeLayer(routeLayerId);
                            }
                            if (map.current?.getSource(routeSourceId)) {
                                map.current.removeSource(routeSourceId);
                            }

                            map.current?.addSource(routeSourceId, {
                                type: 'geojson',
                                data: {
                                    type: 'Feature',
                                    properties: {},  // <--- ВАЖНО: добавил properties!
                                    geometry: route
                                }
                            });

                            map.current?.addLayer({
                                id: routeLayerId,
                                type: 'line',
                                source: routeSourceId,
                                layout: {
                                    'line-cap': 'round',
                                    'line-join': 'round'
                                },
                                paint: {
                                    'line-color': '#1D96FF',
                                    'line-width': 6,
                                    'line-opacity': 0.9
                                }
                            });
                        })
                        .catch(err => {
                            console.error('Directions error:', err);
                        });
                });

                new maplibregl.Marker({ element: el })
                    .setLngLat(e.coords)
                    .addTo(map.current!);
            });

            map.current?.on('click', () => {
                console.log('map click — clearing route');
                const routeSourceId = 'route-source';
                const routeLayerId = 'route-layer';

                if (map.current?.getLayer(routeLayerId)) {
                    map.current.removeLayer(routeLayerId);
                }
                if (map.current?.getSource(routeSourceId)) {
                    map.current.removeSource(routeSourceId);
                }
            });

        }, [lng, lat, zoom]);

        return <div ref={mapContainer} className="map-container" />;
    }
);