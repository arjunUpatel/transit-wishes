import Header from "./Header"
import React, { useCallback, useRef, useState } from 'react'
import './Submission.css'
import './Map.css'
import { GoogleMap, useLoadScript, Marker, MarkerClusterer } from '@react-google-maps/api'
import mapStyles from "./mapStyles"
import Offcanvas from 'react-bootstrap/Offcanvas'
import infoIcon from './images/information.png'
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import { db } from './firebase-config'
import { collection, getDocs } from "firebase/firestore"

export default function Map() {

  const [selected, setSelected] = useState(null)
  const [info, setInfo] = useState(false)
  const [markers, setMarkers] = useState([])
  const [startingMarkers, setStartingMarkers] = useState([])

  window.addEventListener('load', () => {
    fetchMarkerData()
  })

  const fetchMarkerData = async () => {
    const markersArr = []
    const startingMarkersArr = []
    const querySnapshot = await getDocs(collection(db, "markers"))
    querySnapshot.forEach((snapshot) => {
      const obj = { ...snapshot.data() }
      const markerPair = []
      Object.values(obj.latLng).forEach((value) => {
        markerPair.push({ lat: value.lat, lng: value.lng })
      })
      markersArr.push(markerPair)
      startingMarkersArr.push(markerPair[0])
    })
    setMarkers(markersArr)
    setStartingMarkers(startingMarkersArr)
  }

  const center = { lat: 40, lng: -99 }
  const options = {
    disableDefaultUI: true,
    styles: mapStyles,
    disableAutoPan: true,
    clickableIcons: false,
  }

  const mapRef = useRef()
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  })
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    panTo(center, 4.5)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const panTo = useCallback(({ lat, lng }, zoom) => {
    mapRef.current.panTo({ lat, lng })
    mapRef.current.setZoom(zoom)
  }, [])

  function InfoOffcanvas() {
    return (
      <Offcanvas show={info} onHide={() => { setInfo(false) }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Info</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
        </Offcanvas.Body>
      </Offcanvas>
    )
  }

  function InfoButton() {

    const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
        Help
      </Tooltip>
    )

    return (
      <OverlayTrigger
        placement="right"
        delay={{ show: 200, hide: 300 }}
        overlay={renderTooltip}>
        <span className="submission-info-icon" onClick={() => { setInfo(true) }}>
          <img width={60} height={60} src={infoIcon} alt='Info' />
        </span>
      </OverlayTrigger>
    )
  }

  if (loadError)
    return <div>Error loading maps</div>
  if (!isLoaded || !markers)
    return <div>Loading...</div>
  return (
    <>
      <div id="submission-navbar">
        <Header />
      </div>
      <InfoButton />
      <InfoOffcanvas />
      <GoogleMap
        id="google-map"
        mapContainerClassName='submission-map-container'
        options={options}
        onLoad={onMapLoad}
      >
        <MarkerClusterer imagePath='https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'>
          {(clusterer) => startingMarkers.map((location, i) => (
            <Marker
              key={i}
              position={location}
              clusterer={clusterer}
            />
          ))}
        </MarkerClusterer>
      </GoogleMap>
    </>
  )
}
