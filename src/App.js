import './App.css';
import {useRef, useEffect, useState, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Marker from './Marker';

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [mapReady, setMapReady] = useState(false);
  const [googlePlacesData, setGooglePlacesData] = useState();

  const getGoogleData = useCallback(async () =>{
    const url = "https://places.googleapis.com/v1/places:searchNearby"
    try{
        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Goog-Api-Key": "AIzaSyD0W4qlHjxSLFmF_pHgHJIvCX860VSbMgY",
            "X-Goog-FieldMask": "places.displayName,places.id,places.formattedAddress,places.userRatingCount,places.rating,places.location"
          },
          body: JSON.stringify({
            includedTypes: [
                "coffee_shop", "cafe"
            ],
            maxResultCount: 20,
            locationRestriction: {
                circle: {
                    center: {
                        latitude: 43.663448,
                        longitude: -79.395978
                    },
                    radius: 900
                }
            }
        })
        })
        
        if (!result.ok){
          const errText = await result.text();
          throw new Error(`HTTP ${result.status}: ${errText}`);
        }

        const json = await result.json();
        console.log(json);
        setGooglePlacesData(json);

    } catch (error) {
      console.error(error)
    }
  }, [])

  //load map
  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1IjoicDJrYXJpbWkiLCJhIjoiY21mbjRzaWZ0MDhjNDJrb2xoeTcwY28ybiJ9.o3Ty91rm4Drve48saUZ3fg'
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-79.395978, 43.663448], //long, lat
      zoom: 15
    });

    mapRef.current.on('load', () => {
      getGoogleData();
      setMapReady(true);
    });

    return () => {
      mapRef.current.remove()
    }
  }, [])

  return (
    <>
      <div className="Title">
        <header className="Title-header">
          <p>
           Meridio
          </p>
        </header>
      </div>

      <div id="Map-container" ref={mapContainerRef}>
        {/* load markers */}
        {mapReady && googlePlacesData && googlePlacesData.places?.map((place) =>{
          return (<Marker
              key={place.id}
              map={mapRef.current}
              place={place}
          />)
        })}
      </div>
    </>
  );
}

export default App;
