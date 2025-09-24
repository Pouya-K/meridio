import './App.css';
import {useRef, useEffect, useState, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Marker from './Marker';
import { FaStar } from 'react-icons/fa';

function App() {
  const mapRef = useRef();
  const mapContainerRef = useRef();
  const [mapReady, setMapReady] = useState(false);
  const [googlePlacesData, setGooglePlacesData] = useState();

  const [placeClicked, setPlaceClicked] = useState();
  const [placePrice, setPlacePrice] = useState()
  const [placeTaste, setPlaceTaste] = useState();
  const [placeAmbiance, setPlaceAmbiance] = useState();
  const [placeService, setPlaceService] = useState();
  const [placeWifiQuality, setPlaceWifiQuality] = useState();
  const [placeVibe, setPlaceVibe] = useState();

  const [visitedPlaces, setVisitedPlaces] = useState(() => new Set());
  const [visitedPlacesLoaded, setVisitedPlacesLoaded] = useState(false);

  const mapBoxKey = process.env.REACT_APP_MAPBOX_API_KEY
  const googleAPIKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY
  const API_BASE = process.env.REACT_APP_API_BASE

  const ensurePlace = async (place) =>{
      try{
        await fetch(`${API_BASE}/places`, {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          body: JSON.stringify({
            place_id: place.id,
            place_name: place.displayName?.text,
            place_address : place.formattedAddress
          })
        })
      } catch (error) {
        console.log(error)
      }
  }

  const fetchPlace = async (placeId) =>{
    try{
      const result = await fetch (`${API_BASE}/places/${placeId}`);
      if (!result.ok) return null;
      return result.json();
    } catch (error) {
      console.log(error)
    }
  }

  const toggleVisited = async (placeId) =>{
    try{
      await fetch (`${API_BASE}/places/${placeId}/visit`, { method: "POST" });
      const currentlyVisited = placeClicked._server.visited;
      if (currentlyVisited){ //unvisited, all ratings should reset
        await handlePriceClick(0);
        await handleTasteClick(0);
        await handleAmbianceClick(0);
        await handleServiceClick(0);
        await handleWifiQualityClick(0);
        await handleVibeClick(0);
      }
      setPlaceClicked({
        ...placeClicked, //makes a copy of placeClicked, replaces _server object
        _server: {
          ...(placeClicked._server || {}), //makes a copy of current _server, updates visited parameter
          visited: !currentlyVisited
        }}
      );
      getAllVisited();
    } catch (error) {
      console.log(error)
    }
  }

  const getAllVisited = async () => {
    try {
      const result = await fetch (`${API_BASE}/places/getVisited`);
      const data = await result.json();
      const newVisitedPlaces = new Set(data.map(p => p.place_id))
      setVisitedPlaces(newVisitedPlaces);
      setVisitedPlacesLoaded(true);
    } catch (error){
      console.log(error)
      setVisitedPlacesLoaded(true); // Set to true even on error to prevent infinite waiting
    }
  }

  const ratePrice = async (placeId, value) =>{
    try{
      await fetch(`${API_BASE}/places/${placeId}/rate/price`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.log(error)
    }
  }

  const rateTaste = async (placeId, value) =>{
    try{
      await fetch(`${API_BASE}/places/${placeId}/rate/taste`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.log(error)
    }
  }

  const rateAmbiance = async (placeId, value) =>{
    try{
      await fetch(`${API_BASE}/places/${placeId}/rate/ambiance`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.log(error)
    }
  }

  const rateService = async (placeId, value) =>{
    try{
      await fetch(`${API_BASE}/places/${placeId}/rate/service`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.log(error)
    }
  }

  const rateWifiQuality = async (placeId, value) =>{
    try{
      await fetch(`${API_BASE}/places/${placeId}/rate/wifiQuality`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.log(error)
    }
  }

  const rateVibe = async (placeId, value) =>{
    try{
      await fetch(`${API_BASE}/places/${placeId}/rate/vibe`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({ value })
      });
    } catch (error) {
      console.log(error)
    }
  }

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
    setGooglePlacesData(hardCodedData);
  }, [])

  const handlePlaceClicked = async (place) => {
    try {
      await ensurePlace(place);
      const server = await fetchPlace(place.id);
      const enrichedPlace = {...place, _server: server}; //merges objects together in a list
      setPlaceClicked(enrichedPlace);
      setPlaceAmbiance(server.ambiance);
      setPlacePrice(server.price);
      setPlaceTaste(server.taste);
      setPlaceService(server.service);
      setPlaceWifiQuality(server.wifiQuality);
      setPlaceVibe(server.vibe);
      
      // Trigger map resize after a short delay to ensure smooth transition
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.resize();
        }
      }, 300);
    } catch (e) {
      console.error("Failed loading place from backend: ", e)
    }
  }

  const handlePriceClick = async (value) => {
    try{
      setPlacePrice(value);
      await ratePrice(placeClicked.id, value);

      setPlaceClicked({
        ...placeClicked, //makes a copy of placeClicked, replaces _server object
        _server: {
          ...(placeClicked._server || {}), //makes a copy of current _server, updates price parameter
          price: value
        }}
      );
    } catch (e) {
      console.error("Failed setting price rating: ", e)
    }
  }

  const handleTasteClick = async (value) => {
    try{
      setPlaceTaste(value);
      await rateTaste(placeClicked.id, value)

      setPlaceClicked({
        ...placeClicked, //makes a copy of placeClicked, replaces _server object
        _server: {
          ...(placeClicked._server || {}), //makes a copy of current _server, updates price parameter
          taste: value
        }}
      );
    } catch (e) {
      console.error("Failed setting taste rating: ", e)
    }
  }

  const handleAmbianceClick = async (value) => {
    try{
      setPlaceAmbiance(value);
      await rateAmbiance(placeClicked.id, value)

      setPlaceClicked({
        ...placeClicked, //makes a copy of placeClicked, replaces _server object
        _server: {
          ...(placeClicked._server || {}), //makes a copy of current _server, updates price parameter
          ambiance: value
        }}
      );
    } catch (e) {
      console.error("Failed setting ambiance rating: ", e)
    }
  }

  const handleServiceClick = async (value) => {
    try{
      setPlaceService(value);
      await rateService(placeClicked.id, value)

      setPlaceClicked({
        ...placeClicked, //makes a copy of placeClicked, replaces _server object
        _server: {
          ...(placeClicked._server || {}), //makes a copy of current _server, updates price parameter
          service: value
        }}
      );
    } catch (e) {
      console.error("Failed setting service rating: ", e)
    }
  }

  const handleWifiQualityClick = async (value) => {
    try{
      setPlaceWifiQuality(value);
      await rateWifiQuality(placeClicked.id, value)

      setPlaceClicked({
        ...placeClicked, //makes a copy of placeClicked, replaces _server object
        _server: {
          ...(placeClicked._server || {}), //makes a copy of current _server, updates price parameter
          wifiQuality: value
        }}
      );
    } catch (e) {
      console.error("Failed setting wifi quality rating: ", e)
    }
  }

  const handleVibeClick = async (value) => {
    try{
      setPlaceVibe(value);
      await rateVibe(placeClicked.id, value)

      setPlaceClicked({
        ...placeClicked, //makes a copy of placeClicked, replaces _server object
        _server: {
          ...(placeClicked._server || {}), //makes a copy of current _server, updates price parameter
          vibe: value
        }}
      );
    } catch (e) {
      console.error("Failed setting vibe rating: ", e)
    }
  }

  //load map
  useEffect(() => {
    getAllVisited();

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
          {mapReady && googlePlacesData && visitedPlacesLoaded && googlePlacesData?.map((place) =>{
            return (<Marker
                key={place.id}
                map={mapRef.current}
                place={place}
                isActive={placeClicked?.id === place.id}
                onClick={handlePlaceClicked}
                beenVisited={visitedPlaces.has(place.id)}
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
              
              <div style={{marginTop: 12}}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!placeClicked._server?.visited}
                    onChange={async (e) => {
                      // create place if not already created
                      await ensurePlace(placeClicked)

                      //toggle visited
                      await toggleVisited(placeClicked.id);

                      const server = await fetchPlace(placeClicked.id);
                      setPlaceClicked({ ...placeClicked, _server: server });
                    }}
                  />{' '}Visited
                </label>
              </div>

              {/* Price rating (stars) */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Price</div>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => {
                    return (
                      <FaStar
                        key={n}
                        size={24}
                        color={(placePrice) >= n ? '#f5b301' : '#ccc'}
                        onClick={placeClicked._server?.visited ? () => handlePriceClick(n) : undefined}
                        style={{
                          cursor: placeClicked._server?.visited ? 'pointer' : 'not-allowed',
                          opacity: placeClicked._server?.visited ? 1 : 0.5
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Taste rating (stars) */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Taste</div>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => {
                    return (
                      <FaStar
                        key={n}
                        size={24}
                        color={(placeTaste) >= n ? '#f5b301' : '#ccc'}
                        onClick={placeClicked._server?.visited ? () => handleTasteClick(n) : undefined}
                        style={{
                          cursor: placeClicked._server?.visited ? 'pointer' : 'not-allowed',
                          opacity: placeClicked._server?.visited ? 1 : 0.5
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Ambiance rating (stars) */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Ambiance</div>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => {
                    return (
                      <FaStar
                        key={n}
                        size={24}
                        color={(placeAmbiance) >= n ? '#f5b301' : '#ccc'}
                        onClick={placeClicked._server?.visited ? () => handleAmbianceClick(n) : undefined}
                        style={{
                          cursor: placeClicked._server?.visited ? 'pointer' : 'not-allowed',
                          opacity: placeClicked._server?.visited ? 1 : 0.5
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Service rating (stars) */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Service</div>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => {
                    return (
                      <FaStar
                        key={n}
                        size={24}
                        color={(placeService) >= n ? '#f5b301' : '#ccc'}
                        onClick={placeClicked._server?.visited ? () => handleServiceClick(n) : undefined}
                        style={{
                          cursor: placeClicked._server?.visited ? 'pointer' : 'not-allowed',
                          opacity: placeClicked._server?.visited ? 1 : 0.5
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Wifi Quality rating (stars) */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Wifi Quality</div>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => {
                    return (
                      <FaStar
                        key={n}
                        size={24}
                        color={(placeWifiQuality) >= n ? '#f5b301' : '#ccc'}
                        onClick={placeClicked._server?.visited ? () => handleWifiQualityClick(n) : undefined}
                        style={{
                          cursor: placeClicked._server?.visited ? 'pointer' : 'not-allowed',
                          opacity: placeClicked._server?.visited ? 1 : 0.5
                        }}
                      />
                    )
                  })}
                </div>
              </div>

              {/* Vibe rating (stars) */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>Vibe</div>
                <div>
                  {[1, 2, 3, 4, 5].map((n) => {
                    return (
                      <FaStar
                        key={n}
                        size={24}
                        color={(placeVibe) >= n ? '#f5b301' : '#ccc'}
                        onClick={placeClicked._server?.visited ? () => handleVibeClick(n) : undefined}
                        style={{
                          cursor: placeClicked._server?.visited ? 'pointer' : 'not-allowed',
                          opacity: placeClicked._server?.visited ? 1 : 0.5
                        }}
                      />
                    )
                  })}
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
