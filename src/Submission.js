import Navbar from "./Navbar";
import React, { useState } from 'react';
import './Submission.css'
import Footer from "./Footer";
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'

function SubmitButton() {
  const handleClick = () => {

  }

  return (
    <button onClick={handleClick}>
      Submit
    </button>
  )
}

export default function Submission() {

  const libraries = ['places']
  const center = { lat: 40.0583, lng: -74.4057 }
  const options = {
    disableDefaultUI: true,
  }
  const [markers, setMarkers] = useState([])
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
    libraries,
  })

  if (loadError) return <div>Error loading maps</div>
  if (!isLoaded) return <div>Loading...</div>
  return (
    <>
      <Navbar></Navbar>
      <div className="main">
        <div className="submission-container">
          <h1>Make a wish</h1>
          <h2 className="submission-subheading">The What?</h2>
          <p className="submission-para">Have an idea where you would like to have public transit connection? Place it on the map by following the steps below!</p>
          <h2 className="submission-subheading">The How?</h2>
          <ol>
            <li>The first marker placed will be the desired pickup point. This will be denoted by a red marker.</li>
            <li>After confirming the location of the pickup point, you will be able to place the destination marker. This will be denoted by a blue marker.</li>
            <li>You can select up to connections in one submission. When you are done, press the submit.</li>
          </ol>
          <GoogleMap
            zoom={8.2}
            center={center}
            mapContainerClassName='map-container'
            options={options}
            onClick={(event) => {
              setMarkers((current) => [
                ...current,
                {
                  lat: event.latLng.lat(),
                  lng: event.latLng.lng(),
                  time: new Date(),
                }
              ])
            }}
          >
            {markers.map((marker) => (
              <Marker
                key={marker.time}
                position={{ lat: marker.lat, lng: marker.lng }}
              />
            ))}
          </GoogleMap>
          <SubmitButton />
        </div>
      </div>
      <Footer />
    </>
  )
}
