import { useEffect, useRef} from "react";
import mapboxgl from 'mapbox-gl'

const Marker = ({map, place, isActive, onClick, beenVisited}) => {
    const {location} = place //the {} deconstruct the object, same as saying location = place.location
    const markerRef = useRef()

    useEffect(() => {
        // Create a simple popup for hover
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
            className: 'marker-popup'
        });

        // Set popup content
        const name = place.displayName?.text || 'Unknown Cafe';
        const rating = place.rating ? place.rating.toFixed(1) : 'N/A';
        popup.setHTML(`
            <div style="font-weight: bold; margin-bottom: 2px; color: #000000; font-size: 14px;">${name}</div>
            <div style="color: #000000; font-size: 14px;">⭐ ${rating}</div>
        `);

        // Create custom coffee cup marker
        const el = document.createElement('div');
        el.innerHTML = '☕';
        // Set initial color based on isActive prop
        const backgroundColor = isActive 
            ? '#e8b425' 
            : '#e83c25';
        
        el.style.cssText = `
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${backgroundColor};
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 
                0 4px 8px rgba(0,0,0,0.2),
                0 2px 4px rgba(0,0,0,0.1),
                inset 0 1px 0 rgba(255,255,255,0.3);
        `;

        markerRef.current = new mapboxgl.Marker(el)
            .setLngLat([location.longitude, location.latitude])
            .setPopup(popup)
            .addTo(map)

        // Add click listener
        if (onClick) {
            markerRef.current.getElement().addEventListener('click', () => {
                onClick(place);
            });
        }

        // Add hover effects
        const markerElement = markerRef.current.getElement();
        markerElement.addEventListener('mouseenter', () => {
            popup.addTo(map);
            markerElement.style.boxShadow = 
                '0 6px 12px rgba(0,0,0,0.3), 0 3px 6px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)';
            markerElement.style.borderWidth = '3px';
        });
        markerElement.addEventListener('mouseleave', () => {
            popup.remove();
            markerElement.style.boxShadow = 
                '0 4px 8px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.3)';
            markerElement.style.borderWidth = '2px';
        });

        return () => {
            markerRef.current.remove()
        }
    }, [onClick, place, map])

    // Update marker color when isActive changes
    useEffect(() => {
        if (markerRef.current) {
            const markerElement = markerRef.current.getElement();
            const backgroundColor = isActive 
            ? '#e8b425' 
            : '#e83c25';
            
            markerElement.style.background = backgroundColor;
        }
    }, [isActive])

    return null
}

export default Marker