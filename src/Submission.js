import Navbar from "./Navbar";
import React, { useCallback, useRef, useState } from 'react';
import './Submission.css'
import Footer from "./Footer";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { v4 as uuidv4 } from 'uuid';
import mapStyles from "./mapStyles";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Submission() {

  // states stuff
  const [libraries] = useState(['places']);
  const [confirmedMarkers, setConfirmedMarkers] = useState([])
  const [unconfirmedMarker, setUnconfirmedMarker] = useState()
  const [selected, setSelected] = useState(null)

  // google maps setup stuff
  const center = { lat: 40.0583, lng: -74.4057 }
  const options = {
    disableDefaultUI: true,
    styles: mapStyles,
  }
  const mapRef = useRef()
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
    libraries,
  })
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  // marker stuff
  const onMapClick = useCallback((event) => {
    setUnconfirmedMarker(
      {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        uuid: uuidv4(),
        confirmed: false,
      }
    )
    setSelected(unconfirmedMarker)
  }, [])

  function SubmitButton() {
    const onClick = () => { }
    return (
      <button onClick={onClick}>Submit</button>
    )
  }

  function ConfirmButton() {
    const onConfirmClick = () => {
      setConfirmedMarkers((current) =>
        [
          ...current, unconfirmedMarker ? (
            {
              lat: unconfirmedMarker.lat,
              lng: unconfirmedMarker.lng,
              uuid: unconfirmedMarker.uuid,
              confirmed: true,
            }
          ) : undefined
        ])
      setUnconfirmedMarker(null)
      setSelected(null)
    }
    return (
      <button onClick={onConfirmClick}>Confirm Location</button>
    )
  }

  function MarkerInfoWindow({ marker }) {
    // const notify = () => toast("Wow so easy!");
    const removeConfirmedMarkerFromArr = () => {
      let confirmedMarkersArr = confirmedMarkers
      let index = confirmedMarkersArr.indexOf(marker);
      if (index > -1) { // only splice array when item is found
        confirmedMarkersArr.splice(index, 1); // 2nd parameter means remove one item only
      }
      setConfirmedMarkers(confirmedMarkersArr)
    }
    const onEditClick = () => {
      if (unconfirmedMarker) {
        // a marker is unconfirmed on the map. show toast to notify user to confirm that marker
        // have button in toast to pan to unconfirmed marker
        // <ToastContainer
        //   position="bottom-center"
        //   autoClose={5000}
        //   hideProgressBar={false}
        //   newestOnTop={false}
        //   closeOnClick
        //   rtl={false}
        //   pauseOnFocusLoss
        //   draggable
        //   pauseOnHover
        // />
      }
      else {
        console.log("got here")
        removeConfirmedMarkerFromArr()
        setUnconfirmedMarker(marker)
        setSelected(null)
      }
    }
    const onRemoveClick = () => {
      removeConfirmedMarkerFromArr()
      setSelected(null)
    }
    console.log(marker.confirmed)
    if (marker.confirmed) {
      return (
        <div>
          {/* // a marker is unconfirmed, when edit button is pressed, show pop up to confirm other marker */}
          <button onClick={onEditClick}>
            Edit</button>
          <button onClick={onRemoveClick}>Remove</button>
        </div>
      )
    }
    else {
      return (
        <ConfirmButton />
      )
    }
  }

  if (loadError)
    return <div>Error loading maps</div>
  if (!isLoaded)
    return <div>Loading...</div>
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
            id="google-map"
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
                onClick={() => {
                  setSelected(marker)
                }}
                animation={2}
                label={"10"}
              />
            )}

            {unconfirmedMarker ? (<Marker
              key={unconfirmedMarker.uuid}
              position={{ lat: unconfirmedMarker.lat, lng: unconfirmedMarker.lng }}
              animation={1}
              onClick={() => {
                setSelected(unconfirmedMarker)
              }}
            />) : null}

            {unconfirmedMarker ? (<InfoWindow position={{ lat: unconfirmedMarker.lat, lng: unconfirmedMarker.lng }}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}>
              <ConfirmButton />
            </InfoWindow>) : null}

            {selected ? (<InfoWindow position={{ lat: selected.lat, lng: selected.lng }}
              options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
              onCloseClick={() => {
                setSelected(null)
              }}
            >
              <MarkerInfoWindow marker={selected} />
            </InfoWindow>) : null}

          </GoogleMap>
          <SubmitButton />
        </div>
      </div>
      <Footer />
    </>
  )
}
