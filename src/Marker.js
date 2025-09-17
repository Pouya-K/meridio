import { useEffect, useRef} from "react";
import mapboxgl from 'mapbox-gl'

const Marker = ({map, place}) => {
    const {location} = place //the {} deconstruct the object, same as saying location = place.location
    const markerRef = useRef()

    useEffect(() => {
        markerRef.current = new mapboxgl.Marker({color: 'red'})
            .setLngLat([location.longitude, location.latitude])
            .addTo(map)

        return () => {
            markerRef.current.remove()
        }
    }, [])

    return null
}

export default Marker