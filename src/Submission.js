import Navbar from "./Navbar";
import React, { useCallback, useRef, useState } from 'react';
import './Submission.css'
import Footer from "./Footer";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { v4 as uuidv4 } from 'uuid';
import mapStyles from "./mapStyles";

export default function Submission() {

  const libraries = ['places']
  const center = { lat: 40.0583, lng: -74.4057 }
  const options = {
    disableDefaultUI: true,
    styles: mapStyles,
  }

  const [confirmedMarkers, setConfirmedMarkers] = useState([])
  const [unconfirmedMarker, setUnconfirmedMarker] = useState()

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
    libraries,
  })
  const mapRef = useRef()
  const onMapClick = useCallback((event) => {
    setUnconfirmedMarker(
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        uuid: uuidv4(),
        confirmed: false,
        editable: false,
      }
    )
  }, [])
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  const onConfirmClick = () => {
    setConfirmedMarkers((current) =>
      [
        ...current, unconfirmedMarker ? (
          {
            lat: unconfirmedMarker.lat,
            lng: unconfirmedMarker.lng,
            uuid: unconfirmedMarker.uuid,
            confirmed: !unconfirmedMarker.confirmed,
            editable: !unconfirmedMarker.editable,
          }
        ) : undefined
      ])
    setUnconfirmedMarker(null)
  }

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
            onClick={onMapClick}
            onLoad={onMapLoad}
          >
            {confirmedMarkers.map((marker) =>
              <Marker
                key={marker.uuid}
                position={{ lat: marker.lat, lng: marker.lng }}
              // onMouseOver={onMarkerHover /* show the options to comfirm the marker, edit the position of the marker or delete the marker pair*/}
              />
            )}

            {unconfirmedMarker ? (<Marker
              key={unconfirmedMarker.uuid}
              position={{ lat: unconfirmedMarker.lat, lng: unconfirmedMarker.lng }}
            />) : null}

            {unconfirmedMarker ? (<InfoWindow position={{ lat: unconfirmedMarker.lat, lng: unconfirmedMarker.lng }}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}>
              <button onClick={onConfirmClick}>Confirm Location</button>
            </InfoWindow>) : null}

          </GoogleMap>
          <SubmitButton />
        </div>
      </div>
      <Footer />
    </>
  )
}

function SubmitButton() {
  const onClick = () => { }
  return (
    <button onClick={onClick}>Submit</button>
  )
}
