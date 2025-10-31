import './App.css';
import {useRef, useEffect, useState, useCallback} from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Marker from './Marker';
import { FaWifi, FaDollarSign, FaCoffee, FaHeadphonesAlt, FaConciergeBell, FaGlassCheers } from 'react-icons/fa';

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
  const [typewriterText, setTypewriterText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typewriterIndex, setTypewriterIndex] = useState(0);

  const mapBoxKey = process.env.REACT_APP_MAPBOX_API_KEY
  const googleAPIKey = process.env.REACT_APP_GOOGLE_PLACES_API_KEY
  const API_BASE = process.env.REACT_APP_API_BASE

  //Calls to backend to add places to database
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

  //Calls to backend to fetch places from database
  const fetchPlace = async (placeId) =>{
    try{
      const result = await fetch (`${API_BASE}/places/${placeId}`);
      if (!result.ok) return null;
      return result.json();
    } catch (error) {
      console.log(error)
    }
  }

  //Calls to backend to change visited status
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

  //Calls to backend to fetch all visited places
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

  //Calls to backend to change ratings
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

  const handlePlaceClicked = async (place) => {
    try {
      await ensurePlace(place);
      const server = await fetchPlace(place.id);
      const enrichedPlace = {...place, _server: server}; //merges objects together in a list
      console.log(enrichedPlace);
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
  
  const getGoogleData = useCallback(async () =>{
    const url = "https://places.googleapis.com/v1/places:searchNearby"
    try{
        const result = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Goog-Api-Key": googleAPIKey,
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

  // Typewriter effect for title
  useEffect(() => {
    const words = ['Anywhere', 'Anytime'];
    const currentWord = words[typewriterIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (typewriterText.length < currentWord.length) {
          setTypewriterText(currentWord.substring(0, typewriterText.length + 1));
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (typewriterText.length > 0) {
          setTypewriterText(typewriterText.substring(0, typewriterText.length - 1));
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setTypewriterIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 50 : 100);

    return () => clearTimeout(timeout);
  }, [typewriterText, isDeleting, typewriterIndex])

  // Initialize typewriter with first word
  useEffect(() => {
    if (typewriterText === '' && !isDeleting) {
      setTypewriterText('A');
    }
  }, [])

  // Main App Component
  return (
    <>
      <div className="Title">
        <header className="Title-header">
          <p>
           Meridio: Find Your Perfect Spot - <span className="typewriter-text">{typewriterText}</span><span className="typewriter-cursor">|</span>
          </p>
        </header>
      </div>

      {/* Main Map Container (no resizing, relative for - positioning) */}
      <div id="Map-container" ref={mapContainerRef}>
        {mapReady && googlePlacesData && visitedPlacesLoaded && googlePlacesData.places.map((place) => (
          <Marker
            key={place.id}
            map={mapRef.current}
            place={place}
            isActive={placeClicked?.id === place.id}
            onClick={handlePlaceClicked}
            beenVisited={visitedPlaces.has(place.id)}
          />
        ))}

        {/* Overlay at bottom left */}
        {placeClicked && (
          <div className="map-overlay">
            <div className="place-name">{placeClicked.displayName?.text || 'Unknown Cafe'}</div>
            <div className="place-rating">⭐ {placeClicked.rating ?? 'N/A'}</div>
            <div className="place-user-count">
              {placeClicked.userRatingCount ? `${placeClicked.userRatingCount} reviews` : 'No reviews available'}
            </div>
            
            <div className="overlay-visited">
              <label>
                <input
                  type="checkbox"
                  checked={!!placeClicked._server?.visited}
                  onChange={async (e) => {
                    await ensurePlace(placeClicked)
                    await toggleVisited(placeClicked.id);
                    const server = await fetchPlace(placeClicked.id);
                    setPlaceClicked({ ...placeClicked, _server: server });
                  }}
                />{' '}Visited?
              </label>
            </div>

            {/* Price rating (stars) */}
            <div className="overlay-section">
              <div className="overlay-label">Price</div>
              <div>
                {[1, 2, 3, 4, 5].map((n) => {
                  const enabled = !!placeClicked._server?.visited;
                  return (
                    <FaDollarSign
                      key={n}
                      size={24}
                      color={(placePrice) >= n ? '#1daf02' : '#ccc'}
                      onClick={enabled ? () => handlePriceClick(n) : undefined}
                      className={enabled ? 'star' : 'star disabled'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Taste rating (stars) */}
            <div className="overlay-section">
              <div className="overlay-label">Taste</div>
              <div>
                {[1, 2, 3, 4, 5].map((n) => {
                  const enabled = !!placeClicked._server?.visited;
                  return (
                    <FaCoffee
                      key={n}
                      size={24}
                      color={(placeTaste) >= n ? '#6F4E37' : '#ccc'}
                      onClick={enabled ? () => handleTasteClick(n) : undefined}
                      className={enabled ? 'star' : 'star disabled'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Ambiance rating (stars) */}
            <div className="overlay-section">
              <div className="overlay-label">Ambiance</div>
              <div>
                {[1, 2, 3, 4, 5].map((n) => {
                  const enabled = !!placeClicked._server?.visited;
                  return (
                    <FaGlassCheers
                      key={n}
                      size={24}
                      color={(placeAmbiance) >= n ? '#D29F51' : '#ccc'}
                      onClick={enabled ? () => handleAmbianceClick(n) : undefined}
                      className={enabled ? 'star' : 'star disabled'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Wifi Quality rating (stars) */}
            <div className="overlay-section">
              <div className="overlay-label">Wifi Quality</div>
              <div>
                {[1, 2, 3, 4, 5].map((n) => {
                  const enabled = !!placeClicked._server?.visited;
                  return (
                    <FaWifi
                      key={n}
                      size={24}
                      color={(placeWifiQuality) >= n ? '#00008B' : '#ccc'}
                      onClick={enabled ? () => handleWifiQualityClick(n) : undefined}
                      className={enabled ? 'star' : 'star disabled'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Service rating (stars) */}
            <div className="overlay-section">
              <div className="overlay-label">Service</div>
              <div>
                {[1, 2, 3, 4, 5].map((n) => {
                  const enabled = !!placeClicked._server?.visited;
                  return (
                    <FaConciergeBell
                      key={n}
                      size={24}
                      color={(placeService) >= n ? '#FFDE00' : '#ccc'}
                      onClick={enabled ? () => handleServiceClick(n) : undefined}
                      className={enabled ? 'star' : 'star disabled'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Vibe rating (stars) */}
            <div className="overlay-section">
              <div className="overlay-label">Vibe</div>
              <div>
                {[1, 2, 3, 4, 5].map((n) => {
                  const enabled = !!placeClicked._server?.visited;
                  return (
                    <FaHeadphonesAlt
                      key={n}
                      size={24}
                      color={(placeVibe) >= n ? '#00008B' : '#ccc'}
                      onClick={enabled ? () => handleVibeClick(n) : undefined}
                      className={enabled ? 'star' : 'star disabled'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Close Button */}
            <button className="overlay-close" onClick={() => setPlaceClicked(null)}>Close</button>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
