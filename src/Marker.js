import { useEffect, useRef} from "react";
import mapboxgl from 'mapbox-gl'

const Marker = ({map, place, isActive, onClick, beenVisited}) => {
    const {location} = place; //the {} deconstruct the object, same as saying location = place.location
    const markerRef = useRef();
    const name = place.displayName?.text || 'Unknown Cafe';

    //Don't render if name is in blocked list
    const blockedCafes = ["McDonald's", "Starbucks", "Tim Hortons"];
    const isBlocked = blockedCafes.includes(name);

    useEffect(() => {
        if (isBlocked) return;
        // Create a simple popup for hover
        const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            closeOnMove: false,
            className: 'marker-popup'
        });

        // Set popup content
        const rating = place.rating ? place.rating.toFixed(1) : 'N/A';
        popup.setHTML(`
            <div style="font-weight: bold; margin-bottom: 2px; color: #000000; font-size: 14px;">${name}</div>
            <div style="color: #000000; font-size: 14px;">⭐ ${rating}</div>
        `);

        // Create custom coffee cup marker
        const el = document.createElement('div');
        el.innerHTML = '☕';
        // Set initial color based on isActive and hasBeenVisited prop
        let backgroundColor = '#e83c25';
        if (beenVisited){
            backgroundColor = '#00cc00';
        } else if (isActive){
            backgroundColor = '#e8b425';
        }
        
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
            if (markerRef.current) markerRef.current.remove()
        }
    }, [isBlocked, onClick, place, map, name, location, beenVisited, isActive])

    // Update marker color when isActive or beenVisited changes
    useEffect(() => {
        if (!markerRef.current) return
        const markerElement = markerRef.current.getElement();
        let backgroundColor = '#e83c25'; // red default
        if (beenVisited) {
            backgroundColor = '#00cc00'; // green
        } else if (isActive) {
            backgroundColor = '#e8b425'; // yellow
        }
        
        markerElement.style.background = backgroundColor;
    }, [isActive, beenVisited])

    return null
}

export default Marker