// src/components/MapComponent/MapComponent.tsx
import { FC, useRef, useEffect, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CATEGORY_COLORS } from '../../constants/filterConstants';
import './MapComponent.css';
import { BackendEvent } from '../../types/event';

interface MapComponentProps {
    lng?: number;
    lat?: number;
    zoom?: number;
    // Add props for shared state
    apiEvents: BackendEvent[];
    backendStatus: 'idle' | 'loading' | 'success' | 'error';
    error: string | null;
}

export const MapComponent: FC<MapComponentProps> = ({
    lng = 14.4378,
    lat = 50.0755,
    zoom = 14,
    apiEvents,
    backendStatus,
    error
}) => {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const routeMarkersRef = useRef<maplibregl.Marker[]>([]);
    const eventMarkersRef = useRef<maplibregl.Marker[]>([]);
    const userPosition = useRef<[number, number]>([lng, lat]);

    // Debug logging
    useEffect(() => {
        console.log('MapComponent - received apiEvents:', apiEvents);
        console.log('MapComponent - received backendStatus:', backendStatus);
        console.log('MapComponent - events count:', apiEvents?.length || 0);
    }, [apiEvents, backendStatus]);

    const events: BackendEvent[] = useMemo(() => {
        if (!Array.isArray(apiEvents)) {
            console.warn('apiEvents is not an array:', apiEvents);
            return [];
        }

        return apiEvents.map(event => ({
            // Core fields
            id: event.id,
            title: event.title,
            description: event.description,
            location: event.location,
            image: event.image || '', // TODO
            category: event.category,

            // Extended required fields
            date: event.date,
            datetime: event.datetime,
            time: event.time,
            timezone: event.timezone,
            status: event.status,
            url: event.url,
            venue: event.venue,
            classifications: event.classifications,
            images: event.images,
            priceRanges: event.priceRanges,

            // Optional fields
            pleaseNote: event.pleaseNote,
            info: event.info
        }));
    }, [apiEvents]);

    // Map initialization useEffect (unchanged)
    useEffect(() => {
        if (map.current) return;

        const style = 'https://api.maptiler.com/maps/positron/style.json?key=I9FUhj5Q1VfXxZWCO8Ky';

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

        // Geolocation setup (unchanged)
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
                    (err) => console.error('watchPosition error:', err),
                    { enableHighAccuracy: true }
                );

                // Device orientation handling (unchanged)
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
            (error) => console.error('Geolocation error:', error),
            { enableHighAccuracy: true }
        );
    }, [lng, lat, zoom]);

    // Updated markers effect with proper cleanup
    useEffect(() => {
        console.log('Markers effect triggered - events:', events.length);

        if (!map.current) {
            console.log('Map not ready yet');
            return;
        }

        // Clear existing event markers
        console.log('Clearing existing markers:', eventMarkersRef.current.length);
        eventMarkersRef.current.forEach(marker => {
            marker.remove();
        });
        eventMarkersRef.current = [];

        // Add new event markers
        if (events.length === 0) {
            console.log('No events to display');
            return;
        }

        console.log('Adding', events.length, 'event markers');

        events.forEach((e, index) => {
            console.log(`Adding marker ${index} for event:`, e);

            const el = document.createElement('div');
            el.className = 'event-marker';
            el.style.borderColor = CATEGORY_COLORS[e.category] || '#1D965C';

            const img = document.createElement('img');
            img.src = e.image; // AG: huevo
            img.alt = 'Event';
            // img.onerror = () => {
            //     img.src = 'https://placekitten.com/200/200';
            // };

            el.appendChild(img);

            // Route functionality (unchanged)
            el.addEventListener('click', () => {
                const [fromLng, fromLat] = userPosition.current;
                const MAPBOX_TOKEN = 'pk.eyJ1IjoianBlZ3R1cmJvIiwiYSI6ImNtYzJndXl4bzA3azEyanNrNGh0a20xN3EifQ.hjDsgozZ5D4UrYZlNSa2Ag';

                fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${fromLng},${fromLat};${e.location.lat},${e.location.long}?geometries=geojson&access_token=${MAPBOX_TOKEN}`)
                    .then(res => res.json())
                    .then(data => {
                        const route = data.routes[0]?.geometry;
                        const duration = data.routes[0]?.duration;

                        if (!route) {
                            console.warn('No route found');
                            return;
                        }

                        routeMarkersRef.current.forEach(marker => marker.remove());
                        routeMarkersRef.current = [];

                        setTimeout(() => {
                            route.coordinates.forEach((coord: [number, number], index: number) => {
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
                                .setLngLat({lon: e.location.long, lat: e.location.lat})
                                .addTo(map.current!);

                            routeMarkersRef.current.push(labelMarker);
                        }, 300);
                    })
                    .catch(err => {
                        console.error('Directions error:', err);
                    });
            });

            const marker = new maplibregl.Marker({ element: el })
                .setLngLat({ lon: e.location.long, lat: e.location.lat })
                .addTo(map.current!);

            eventMarkersRef.current.push(marker);
            console.log(`Marker ${index} added successfully`);
        });
    }, [events]);

    // Enhanced loading and error states
    if (backendStatus === 'loading') {
        return (
            <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>Loading events...</div>
            </div>
        );
    }

    if (backendStatus === 'error') {
        return (
            <div className="map-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <div>Error loading events: {error}</div>
                <button onClick={() => window.location.reload()}>Retry</button>
            </div>
        );
    }

    return <div ref={mapContainer} className="map-container" />;
};