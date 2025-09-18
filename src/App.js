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
  const [placeClicked, setPlaceClicked] = useState();

  const mapBoxKey = process.env.REACT_APP_MAPBOX_API_KEY
  const googleAPIKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY

  const getGoogleData = useCallback(async () =>{
    // const url = "https://places.googleapis.com/v1/places:searchNearby"
    // try{
    //     const result = await fetch(url, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json; charset=utf-8",
    //         "X-Goog-Api-Key": googleAPIKey,
    //         "X-Goog-FieldMask": "places.displayName,places.id,places.formattedAddress,places.userRatingCount,places.rating,places.location"
    //       },
    //       body: JSON.stringify({
    //         includedTypes: [
    //             "coffee_shop", "cafe"
    //         ],
    //         maxResultCount: 20,
    //         locationRestriction: {
    //             circle: {
    //                 center: {
    //                     latitude: 43.663448,
    //                     longitude: -79.395978
    //                 },
    //                 radius: 900
    //             }
    //         }
    //     })
    //     })
        
    //     if (!result.ok){
    //       const errText = await result.text();
    //       throw new Error(`HTTP ${result.status}: ${errText}`);
    //     }

    //     const json = await result.json();
    //     console.log(json);
    //     setGooglePlacesData(json);

    // } catch (error) {
    //   console.error(error)
    // }
    const hardCodedData = [
      {
        "displayName": {"text": 'Nabulu Coffee', "languageCode": 'en'},
        "formattedAddress": '6 St Joseph St, Toronto, ON M4Y 1J7, Canada', 
        "id": 'ChIJMxdFNAA1K4gRqAgyuXHgqRg',
        "location": {"latitude": 43.6660706, "longitude": -79.38562290000002},
        "rating": 4.6,
        "userRatingCount": 364
      },
      {
        "displayName": {"text": 'NEO COFFEE BAR BAY X COLLEGE', "languageCode": 'en'},
        "formattedAddress": '770 Bay St. Unit 3, Toronto, ON M5G 0A6, Canada', 
        "id": 'ChIJY7qlf8o1K4gR9A35PHYzbNE',
        "location": {"latitude": 43.660136699999995, "longitude": -79.3858692},
        "rating": 4.5,
        "userRatingCount": 1805
      },
      {
        "displayName": {"text": 'Butter & Blue', "languageCode": 'en'},
        "formattedAddress": '7 Baldwin St, Toronto, ON M5T 1L1, Canada', 
        "id": 'ChIJp6TlSbg1K4gRxW07pIYvIA0',
        "location": {"latitude": 43.656058200000004, "longitude": -79.3925864},
        "rating": 4.6,
        "userRatingCount": 431
      }
    ]
    console.log(hardCodedData);
    setGooglePlacesData(hardCodedData);
  }, [])

  const handlePlaceClicked = (place) => {
    console.log("Clicked:", place.displayName?.text || "Unknown place")
    setPlaceClicked(place)
    
    // Trigger map resize after a short delay to ensure smooth transition
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 300);
  }

  //load map
  useEffect(() => {
    mapboxgl.accessToken = mapBoxKey
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      center: [-79.395978, 43.663448], //long, lat
      zoom: 14
    });

    mapRef.current.on('load', () => {
      getGoogleData();
      setMapReady(true);
    });

    // Keep map synced to container size
    const resizeObserver = new ResizeObserver(() => {
      mapRef.current.resize();
    });
    resizeObserver.observe(mapContainerRef.current);

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

      <div className="content-container">
        <div id="Map-container" ref={mapContainerRef} className={placeClicked ? 'selected' : ''}>
          {/* load markers */}
          {mapReady && googlePlacesData && googlePlacesData?.map((place) =>{
            return (<Marker
                key={place.id}
                map={mapRef.current}
                place={place}
                isActive={placeClicked?.id === place.id}
                onClick={handlePlaceClicked}
            />)
          })}
        </div>

        {/* Details Panel */}
        <div className={`details-panel ${placeClicked ? 'visible' : ''}`}>
          {placeClicked && (
            <div className="place-details">
              <div className="place-header">
                <div className="place-name">
                  {placeClicked.displayName?.text || 'Unknown Cafe'}
                </div>

                <div className="place-meta">
                  <span className="place-rating">⭐ {placeClicked.rating ? placeClicked.rating.toFixed(1) : 'N/A'}</span>
                  <span className="place-user-count">
                    {placeClicked.userRatingCount ? `${placeClicked.userRatingCount} reviews` : 'No reviews'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default App;
