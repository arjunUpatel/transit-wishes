import Navbar from "./Navbar"
import React, { useCallback, useRef, useState } from 'react'
import './Submission.css'
import { GoogleMap, useLoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api'
import mapStyles from "./mapStyles"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import powered_by_google from "./images/powered-by-google-on-white.png"

export default function Submission() {

  // states stuff
  const [libraries] = useState(['places'])
  const [confirmedMarkers, setConfirmedMarkers] = useState([])
  const [unconfirmedMarker, setUnconfirmedMarker] = useState(undefined)
  const [selected, setSelected] = useState(null)
  const [placementIdx, setPlacementIdx] = useState(0)

  // google maps setup stuff
  const center = { lat: 40.0583, lng: -74.4057 }
  const options = {
    disableDefaultUI: true,
    styles: mapStyles,
    disableAutoPan: true,
    clickableIcons: false,
  }
  const mapRef = useRef()
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
    libraries,
  })
  const onMapLoad = useCallback((map) => {
    mapRef.current = map
    panTo(center)
  }, [])

  const panTo = useCallback(({ lat, lng, zoom }) => {
    mapRef.current.panTo({ lat, lng })
    mapRef.current.setZoom(18)
  }, [])

  // marker stuff
  const onMapClick = (event) => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    if (unconfirmedMarker) {
      setUnconfirmedMarker({
        lat: lat,
        lng: lng,
        confirmed: unconfirmedMarker.confirmed,
      })
    } else {
      setUnconfirmedMarker({
        lat: lat,
        lng: lng,
        confirmed: false,
      })
    }
  }

  const onUnconfirmedMarkerDblClick = () => {
    const confirmedMarkersArr = confirmedMarkers
    if (unconfirmedMarker) {
      if (placementIdx === confirmedMarkersArr.length) {
        confirmedMarkersArr.push([{
          lat: unconfirmedMarker.lat,
          lng: unconfirmedMarker.lng,
          confirmed: true,
        }])
      } else {
        if (confirmedMarkers[placementIdx].length < 2) {
          confirmedMarkersArr[placementIdx].push({
            lat: unconfirmedMarker.lat,
            lng: unconfirmedMarker.lng,
            confirmed: true,
          })
        }
        else {
          for (let i = 0; i < confirmedMarkersArr[placementIdx].length; i++) {
            if (confirmedMarkersArr[placementIdx][i] == null) {
              confirmedMarkersArr[placementIdx][i] = {
                lat: unconfirmedMarker.lat,
                lng: unconfirmedMarker.lng,
                confirmed: true,
              }
              break;
            }
          }
        }
        setPlacementIdx(confirmedMarkersArr.length)
      }
      setConfirmedMarkers(confirmedMarkersArr)
      setUnconfirmedMarker(null)
      setSelected(null)
    }
  }

  function Search() {
    const {
      ready,
      value,
      suggestions: { status, data },
      setValue,
      clearSuggestions,
    } = usePlacesAutocomplete({
      requestOptions: {
        location: { lat: () => 40.0583, lng: () => -74.4057 },
        radius: 200 * 1000,
      },
      debounce: 300,
    })

    const handleInput = (e) => {
      // Update the keyword of the input element
      setValue(e.target.value);
    }

    const handleSelect = ({ description }) => () => {
      // When user selects a place, we can replace the keyword without request data from API
      // by setting the second parameter to "false"
      setValue(description, false)
      clearSuggestions()

      // Get latitude and longitude via utility functions
      getGeocode({ address: description }).then((results) => {
        const { lat, lng } = getLatLng(results[0])
        console.log("📍 Coordinates: ", { lat, lng })
        panTo({ lat, lng })
      })
    }

    const renderSuggestions = () => data.map((suggestion) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion

      return (
        <>
          <li className="submission-list" key={place_id} onClick={handleSelect(suggestion)}>
            <strong>{main_text}</strong> <small>{secondary_text}</small>
          </li>
        </>
      )
    })

    return (
      <div className="submission-search">
        <input
          className="submission-input"
          type="search"
          placeholder="Search"
          value={value}
          onChange={handleInput}
          disabled={!ready}
        />
        {status === "OK" && <ul className="submission-dropdown">
          {renderSuggestions()}
          <li className="submission-credit">
            <img src={powered_by_google} alt="Powered by Google">
            </img>
          </li>
        </ul>}
      </div>
    )
  }

  function MarkerInfoWindow({ marker }) {
    const removeConfirmedMarker = () => {
      const confirmedMarkersArr = confirmedMarkers
      for (let i = 0; i < confirmedMarkersArr.length; i++) {
        let index = confirmedMarkersArr[i].indexOf(marker)
        if (index > -1) {
          confirmedMarkersArr[i].splice(index, 1, null)
          setPlacementIdx(i)
          break
        }
      }
      setConfirmedMarkers(confirmedMarkersArr)
    }

    const removeConfirmedMarkerPair = () => {
      const confirmedMarkersArr = confirmedMarkers
      for (let i = 0; i < confirmedMarkersArr.length; i++) {
        let index = confirmedMarkersArr[i].indexOf(marker)
        if (index > -1) {
          confirmedMarkersArr.splice(i, 1)
          break
        }
      }
      setConfirmedMarkers(confirmedMarkersArr)
      if (confirmedMarkersArr.length > 0 && confirmedMarkersArr[confirmedMarkersArr.length - 1].length < 2) {
        setPlacementIdx(confirmedMarkers.length - 1)
      } else {
        setPlacementIdx(confirmedMarkers.length)
      }
    }

    const onEditClick = () => {
      if (placementIdx === confirmedMarkers.length && !unconfirmedMarker) {
        removeConfirmedMarker()
        setUnconfirmedMarker(marker)
        setSelected(null)
      }
      else {
        // show error message
      }
    }

    const onRemoveClick = () => {
      if (placementIdx === confirmedMarkers.length && !unconfirmedMarker) {
        removeConfirmedMarkerPair()
        setSelected(null)
      }
    }

    if (marker.confirmed) {
      return (
        <div>
          {/* // a marker is unconfirmed, when edit button is pressed, show pop up to confirm other marker */}
          <button onClick={onEditClick}>Edit</button>
          <button onClick={onRemoveClick}>Remove</button>
        </div>
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
      <GoogleMap
        id="google-map"
        zoom={8.2}
        mapContainerClassName='submission-map-container'
        options={options}
        onClick={onMapClick}
        onLoad={onMapLoad}
      >
        {confirmedMarkers.map((markerTuple) => {
          return (markerTuple.map((marker) => {
            return (
              marker ? (
                <Marker
                  position={{ lat: marker.lat, lng: marker.lng }}
                  // onClick={} show info about marker
                  onRightClick={() => {
                    setSelected(marker)
                  }}
                  animation={2}
                />
              ) : null
            )
          }))
        })}

        {confirmedMarkers.map((markerTuple) => {
          const path = []
          for (let i = 0; i < markerTuple.length; i++) {
            if (!markerTuple[i])
              return null
            path.push({ lat: markerTuple[i].lat, lng: markerTuple[i].lng })
          }
          return (
            <Polyline
              path={path}
              options={{ clickable: false }}
            />
          )
        })}

        {unconfirmedMarker ? (<Marker
          position={{ lat: unconfirmedMarker.lat, lng: unconfirmedMarker.lng }}
          animation={1}
          // onClick={} show info about the marker if you decide to do so
          onDblClick={onUnconfirmedMarkerDblClick}
        />) : null}

        {selected ? (<InfoWindow position={{ lat: selected.lat, lng: selected.lng }}
          options={{ pixelOffset: new window.google.maps.Size(0, -30) }}
          onCloseClick={() => {
            setSelected(null)
          }}
        >
          <MarkerInfoWindow marker={selected} />
        </InfoWindow>) : null}
      </GoogleMap>
      <Search />
    </>
  )
}
