import Navbar from "./Navbar"
import React, { useCallback, useRef, useState, useEffect, useReducer } from 'react'
import './Submission.css'
import { GoogleMap, useLoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api'
import mapStyles from "./mapStyles"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import powered_by_google from "./images/powered-by-google-on-white.png"
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import ListGroup from "react-bootstrap/ListGroup"

export default function Submission() {

  // states stuff
  const [libraries] = useState(['places'])
  const [confirmedMarkers, setConfirmedMarkers] = useState([])
  const [unconfirmedMarker, setUnconfirmedMarker] = useState(undefined)
  const [selected, setSelected] = useState(null)
  const [placementIdx, setPlacementIdx] = useState(0)

  // key event handling
  const useKeyPress = (targetKey) => {
    const [keyPressed, setKeyPressed] = useState(false)
    useEffect(() => {
      const downHandler = ({ key }) => {
        if (key === targetKey) {
          setKeyPressed(true)
        }
      }

      const upHandler = ({ key }) => {
        if (key === targetKey) {
          setKeyPressed(false)
        }
      }

      window.addEventListener('keydown', downHandler)
      window.addEventListener('keyup', upHandler)

      return () => {
        window.removeEventListener('keydown', downHandler)
        window.removeEventListener('keyup', upHandler)
      }
    }, [targetKey])

    return keyPressed
  }

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
    panTo(center, 18)
  }, [])

  const panTo = useCallback(({ lat, lng }, zoom) => {
    mapRef.current.panTo({ lat, lng })
    mapRef.current.setZoom(zoom)
  }, [])

  const calculateZoom = () => {

  }

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
              break
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

  const initialState = { selectedIndex: -1 };

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

    const searchReducer = (state, action) => {
      switch (action.type) {
        case 'clear':
          return {
            selectedIndex:
              -1
          }
        case 'hover':
          return {
            selectedIndex:
              action.index
          }
        case 'arrowUp':
          return {
            selectedIndex:
              state.selectedIndex !== 0 ? state.selectedIndex - 1 : data.length - 1,
          }
        case 'arrowDown':
          return {
            selectedIndex:
              state.selectedIndex !== data.length - 1 ? state.selectedIndex + 1 : 0,
          }
        case 'select':
          return { selectedIndex: -1 }
        default:
          throw new Error()
      }
    }

    const arrowUpPressed = useKeyPress('ArrowUp')
    const arrowDownPressed = useKeyPress('ArrowDown')
    const [state, dispatch] = useReducer(searchReducer, initialState);

    useEffect(() => {
      if (arrowUpPressed) {
        dispatch({ type: 'arrowUp' });
      }
    }, [arrowUpPressed])

    useEffect(() => {
      if (arrowDownPressed) {
        dispatch({ type: 'arrowDown' });
      }
    }, [arrowDownPressed])

    const clrSuggestions = () => {
      dispatch({ type: 'clear' })
      clearSuggestions()
    }

    const handleSelect = ({ description }) => {
      // When user selects a place, we can replace the keyword without request data from API
      // by setting the second parameter to "false"
      setValue(description, false)
      clrSuggestions()

      // Get latitude and longitude via utility functions
      getGeocode({ address: description }).then((results) => {
        const { lat, lng } = getLatLng(results[0])
        panTo({ lat, lng }, calculateZoom())
      })
    }

    const handleInput = (e) => {
      // Update the keyword of the input element
      dispatch({ type: 'clear' })
      setValue(e.target.value)
    }

    const renderSuggestions = () => data.map((suggestion, i) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion
      return (
        <ListGroup.Item
          id={'submission-item'}
          className='submission-item'
          as='li'
          key={place_id}
          action
          onClick={() => {
            dispatch({ type: 'select' })
            handleSelect(suggestion)
          }}
          onMouseOver={() => {
            dispatch({ type: 'hover', index: i })
          }}
          style={{
            color: i === state.selectedIndex ? 'white' : 'black',
            backgroundColor: i === state.selectedIndex ? '#0d6efd' : 'white'
          }}
        >
          <strong>{main_text}</strong> <small>{secondary_text}</small>
        </ListGroup.Item >
      )
    })

    return (
      <div className="submission-search">
        <InputGroup>
          <Form.Control
            id='submission-input'
            type="search"
            placeholder="Search"
            value={value}
            onChange={handleInput}
            disabled={!ready}
          />
        </InputGroup>
        {status === "OK" && <ListGroup as='ul'>
          {renderSuggestions()}
          <ListGroup.Item as='li'>
            <img src={powered_by_google} alt="Powered by Google">
            </img>
          </ListGroup.Item>
        </ListGroup>}
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
      <div className="submission-navbar">
        <Navbar></Navbar>
      </div>
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
          const lineSymbol = { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW }
          return (
            <Polyline
              path={path}
              options={{
                clickable: false,
                icons: [{
                  icon: lineSymbol,
                  offset: "50%",
                }],
                geodesic: true
              }}
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
