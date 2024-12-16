// React Frontend Code
import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "../styles/MapComponent.css"; // Import the CSS file

// Custom marker icon (to avoid null image issue)
const customIcon = new L.Icon({
  iconUrl: "./icons/blue-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const redCustomIcon = new L.Icon({
  iconUrl: "./icons/red-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const App = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [paths, setPaths] = useState([]);
  const [coordinatesInput, setCoordinatesInput] = useState({
    origin: "",
    destination: "",
  });

  // Component to handle map click events
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (!origin) {
          setOrigin(e.latlng); // Set origin marker
        } else if (!destination) {
          setDestination(e.latlng); // Set destination marker
        }
      },
    });
    return null;
  };

  // Fetch paths from backend
  const fetchPaths = async () => {
    if (origin && destination) {
      const response = await fetch(
        "http://rivag45.pythonanywhere.com/api/paths",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            origin: [origin.lat, origin.lng],
            destination: [destination.lat, destination.lng],
          }),
        }
      );
      const data = await response.json();
      setPaths(data.paths);
    }
  };

  // Handle manual coordinate input
  const handleCoordinateInput = (e) => {
    const { name, value } = e.target;
    setCoordinatesInput((prev) => ({ ...prev, [name]: value }));
  };

  const setCoordinatesFromInput = () => {
    const originCoords = coordinatesInput.origin.split(",").map(Number);
    const destinationCoords = coordinatesInput.destination
      .split(",")
      .map(Number);
    if (originCoords.length === 2 && destinationCoords.length === 2) {
      setOrigin({ lat: originCoords[0], lng: originCoords[1] });
      setDestination({ lat: destinationCoords[0], lng: destinationCoords[1] });
    }
  };

  const clearMarkers = () => {
    setOrigin(null);
    setDestination(null);
    setPaths([]);
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Bengaluru Path Finder</h1>
      </nav>
      <div className="controls">
        <input
          type="text"
          name="origin"
          placeholder="Enter origin (lat,lng)"
          value={coordinatesInput.origin}
          onChange={handleCoordinateInput}
        />
        <input
          type="text"
          name="destination"
          placeholder="Enter destination (lat,lng)"
          value={coordinatesInput.destination}
          onChange={handleCoordinateInput}
        />
        <button
          onClick={setCoordinatesFromInput}
          className="set-coordinates-button"
        >
          Set Coordinates
        </button>
        <button onClick={clearMarkers} className="clear-markers-button">
          Clear Markers
        </button>
      </div>
      <MapContainer
        center={[12.9716, 77.5946]} // Bengaluru coordinates
        zoom={13}
        className="map-container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <MapClickHandler />
        {origin && (
          <Marker
            position={origin}
            icon={customIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => setOrigin(e.target.getLatLng()),
            }}
          >
            <Popup>Origin</Popup>
          </Marker>
        )}
        {destination && (
          <Marker
            position={destination}
            icon={redCustomIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => setDestination(e.target.getLatLng()),
            }}
          >
            <Popup>Destination</Popup>
          </Marker>
        )}
        {/* Render paths as polylines */}
        {paths.map((path, index) => (
          <Polyline
            key={index}
            positions={path}
            color={index === 0 ? "blue" : "green"}
          />
        ))}
      </MapContainer>
      <button
        onClick={fetchPaths}
        disabled={!origin || !destination}
        className="find-paths-button"
      >
        Find Paths
      </button>
    </div>
  );
};

export default App;
