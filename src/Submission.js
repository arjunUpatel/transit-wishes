import Header from "./Header"
import React, { useCallback, useRef, useState, useEffect, useReducer } from 'react'
import './Submission.css'
import { GoogleMap, useLoadScript, Marker, InfoWindow, Polyline } from '@react-google-maps/api'
import mapStyles from "./mapStyles"
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
import powered_by_google from "./images/powered-by-google-on-white.png"
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import ListGroup from "react-bootstrap/ListGroup"
import Button from "react-bootstrap/Button"
import ButtonGroup from "react-bootstrap/ButtonGroup"
import magnifierIcon from "./images/magnifier.png"
import Offcanvas from 'react-bootstrap/Offcanvas'
import infoIcon from './images/information.png'
import recenterIcon from './images/recenter.png'
import OverlayTrigger from "react-bootstrap/OverlayTrigger"
import Tooltip from "react-bootstrap/Tooltip"
import usaGeoJSON from './usa.json'
import { geoContains } from 'd3-geo'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'
import Modal from 'react-bootstrap/Modal'
import { db } from './firebase-config'
import { collection, addDoc } from "firebase/firestore";

export default function Submission() {

  // states stuff
  const [libraries] = useState(['places'])
  const [confirmedMarkers, setConfirmedMarkers] = useState([])
  const [unconfirmedMarker, setUnconfirmedMarker] = useState(undefined)
  const [selected, setSelected] = useState(null)
  const [placementIdx, setPlacementIdx] = useState(0)
  const [submitButtonState, setSubmitButtonState] = useState(true)
  const [search, setSearch] = useState(false)
  const [info, setInfo] = useState(false)
  const [editing, setEditing] = useState(null)
  const [modal, setModal] = useState(false)

  const notify = (str) => toast.error(str, {
    position: "top-right",
    autoClose: 7500,
    hideProgressBar: false,
    pauseOnHover: true,
    theme: 'colored'
  })

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

  const initialState = { selectedIndex: -1 };
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
    libraries,
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

  // marker stuff
  const onMapClick = (event) => {
    const lat = event.latLng.lat()
    const lng = event.latLng.lng()
    if (unconfirmedMarker) {
      setUnconfirmedMarker({
        lat: lat,
        lng: lng,
      })
    } else {
      setUnconfirmedMarker({
        lat: lat,
        lng: lng,
      })
    }
  }

  const onUnconfirmedMarkerDblClick = () => {
    const confirmedMarkersArr = confirmedMarkers
    const inUSA = geoContains(usaGeoJSON, [unconfirmedMarker.lng, unconfirmedMarker.lat])
    if (unconfirmedMarker && inUSA) {
      if (editing !== null) {
        for (let i = 0; i < confirmedMarkersArr[editing].length; i++) {
          if (confirmedMarkersArr[editing][i] == null) {
            confirmedMarkersArr[editing][i] = {
              lat: unconfirmedMarker.lat,
              lng: unconfirmedMarker.lng,
            }
            break
          }
        }
        setEditing(null)
      } else if (placementIdx === confirmedMarkersArr.length) {
        confirmedMarkersArr.push([{
          lat: unconfirmedMarker.lat,
          lng: unconfirmedMarker.lng,
        }])
      } else if (confirmedMarkers[placementIdx].length < 2) {
        confirmedMarkersArr[placementIdx].push({
          lat: unconfirmedMarker.lat,
          lng: unconfirmedMarker.lng,
        })
        setPlacementIdx(confirmedMarkersArr.length)
      }
      setConfirmedMarkers(confirmedMarkersArr)
      setUnconfirmedMarker(null)
      setSelected(null)
    } else {
      notify('You cannot place markers outside the United States!!')
    }
  }

  function MarkerInfoWindow({ marker }) {

    const removeConfirmedMarker = () => {
      const confirmedMarkersArr = confirmedMarkers
      let res = null
      for (let i = 0; i < confirmedMarkersArr.length; i++) {
        let index = confirmedMarkersArr[i].indexOf(marker)
        if (index > -1) {
          res = i
          confirmedMarkersArr[i].splice(index, 1, null)
          break
        }
      }
      setConfirmedMarkers(confirmedMarkersArr)
      return res
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
      if (!unconfirmedMarker) {
        setUnconfirmedMarker(marker)
        setSelected(null)
        setEditing(removeConfirmedMarker())
      }
      else {
        notify('You have a bouncing marker on the map. Confirm its location to be able to edit the location of this marker!')
      }
    }

    const onRemoveClick = () => {
      removeConfirmedMarkerPair()
      setSelected(null)
    }

    if (marker !== unconfirmedMarker && marker === selected) {
      return (
        <ButtonGroup vertical size="sm">
          <Button variant="outline-primary" onClick={onEditClick} tabIndex={-1}>Edit</Button>
          <Button variant="outline-primary" onClick={onRemoveClick} tabIndex={-1}>Remove</Button>
        </ButtonGroup>
      )
    }
  }

  function SubmitButton() {

    if (!unconfirmedMarker && placementIdx === confirmedMarkers.length && placementIdx !== 0) {
      setSubmitButtonState(false)
    } else {
      setSubmitButtonState(true)
    }
    return (
      <div className="submit-button">
        <Button size='lg' id='submission-button' variant='success' disabled={submitButtonState} onClick={() => { setModal(true) }}>Submit</Button>
      </div >
    )
  }

  function SearchOffcanvas() {
    const {
      ready,
      value,
      suggestions: { status, data },
      setValue,
      clearSuggestions,
    } = usePlacesAutocomplete({
      requestOptions: {
        componentRestrictions: { country: "us" },
      },
      debounce: 400
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
        default:
          throw new Error()
      }
    }

    const arrowUpPressed = useKeyPress('ArrowUp')
    const arrowDownPressed = useKeyPress('ArrowDown')
    const enterPressed = useKeyPress('Enter')
    const [state, dispatch] = useReducer(searchReducer, initialState);

    const handleSelect = ({ description }) => {
      // When user selects a place, we can replace the keyword without request data from API
      // by setting the second parameter to "false"
      setValue(description, false)
      dispatch({ type: 'clear' })
      clearSuggestions()
      setSearch(false)

      // Get latitude and longitude via utility functions
      getGeocode({ address: description }).then((results) => {
        const { lat, lng } = getLatLng(results[0])
        panTo({ lat, lng }, 15)
      })
    }

    const handleInput = (e) => {
      // Update the keyword of the input element
      dispatch({ type: 'clear' })
      setValue(e.target.value)
    }

    useEffect(() => {
      if (arrowUpPressed) {
        dispatch({ type: 'arrowUp' })
      }
    }, [arrowUpPressed])

    useEffect(() => {
      if (arrowDownPressed) {
        dispatch({ type: 'arrowDown' })
      }
    }, [arrowDownPressed])

    useEffect(() => {
      if (enterPressed && state.selectedIndex !== -1) {
        handleSelect(data[state.selectedIndex])
        dispatch({ type: 'clear' })
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enterPressed])

    const renderSuggestions = () => data.map((suggestion, i) => {
      const {
        place_id,
        structured_formatting: { main_text, secondary_text },
      } = suggestion
      return (
        <ListGroup.Item
          id='submission-item'
          as='li'
          key={place_id}
          action
          onClick={() => {
            handleSelect(suggestion)
            dispatch({ type: 'clear' })
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
      <Offcanvas show={search} onHide={() => { setSearch(false) }} placement='end'>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Search</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="submission-search">
            <InputGroup>
              <Form.Control
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
        </Offcanvas.Body>
      </Offcanvas>
    )
  }

  function InfoOffcanvas() {
    return (
      <Offcanvas show={info} onHide={() => { setInfo(false) }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Info</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Offcanvas.Title>Basic stuff</Offcanvas.Title>
          <ul>
            <li>Click on the map to spawn a bouncing marker.</li>
            <li>Click on the map to change the location of a bouncing marker if one exists.</li>
            <li>Double click a bouncing marker to confirm its location.</li>
            <li>Right click on a placed marker to reveal options to edit its location or remove it and its pair completely.</li>
          </ul>
          <Offcanvas.Title>Helpful to know</Offcanvas.Title>
          <ul>
            <li>Press the <img width={20} height={20} src={magnifierIcon} alt='Search' /> button to quickly pan to a desired location.</li>
            <li>Press the <img width={20} height={20} src={recenterIcon} alt='Search' /> button to re-center the map onto an existing bouncing marker.</li>
            <li>Press the Submit button to commit your transit wishes.</li>
          </ul>
          <Offcanvas.Title>A few rules</Offcanvas.Title>
          <ul>
            <li>If there is a bouncing marker on the map, editing or removing a placed marker is not allowed until the bouncing marker is placed.</li>
            <li>Submitting data will not be available until all bouncing markers have been placed and all markers are in pairs</li>
            <li>You cannot place markers outside of the United States</li>
          </ul>
        </Offcanvas.Body>
      </Offcanvas>
    )
  }

  function RecenterButton() {

    const handleClick = () => {
      if (unconfirmedMarker) {
        panTo({ lat: unconfirmedMarker.lat, lng: unconfirmedMarker.lng }, 15)
      } else {
        notify('There are no bouncing markers to recenter to!')
      }
    }
    const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
        Recenter
      </Tooltip>
    )

    return (
      <OverlayTrigger
        placement="right"
        delay={{ show: 200, hide: 300 }}
        overlay={renderTooltip}>
        <span className="submission-recenter-icon" onClick={handleClick}>
          <img width={60} height={60} src={recenterIcon} alt='Recenter' />
        </span>
      </OverlayTrigger>
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

  const Toast = React.memo(function Toast() {
    return (
      <div className='submission-toaster'>
        <ToastContainer limit={5} />
      </div>
    )
  })

  function SearchButton() {

    const renderTooltip = (props) => (
      <Tooltip id="button-tooltip" {...props}>
        Search locations
      </Tooltip>
    )

    return (
      <OverlayTrigger
        placement="right"
        delay={{ show: 200, hide: 300 }}
        overlay={renderTooltip}>
        <span className="submission-search-icon" onClick={() => { setSearch(true) }}>
          <img width={60} height={60} src={magnifierIcon} alt='Search' />
        </span>
      </OverlayTrigger>
    )
  }

  function SubmissionModal() {
    // handle svg stuff before allowing submission of data
    const handleSubmit = async () => {
      let latLng
      for (let i = 0; i < confirmedMarkers.length; i++) {
        latLng = { ...confirmedMarkers[i] }
        await addDoc(collection(db, "markers"), {
          latLng
        })
      }
      console.log(latLng)
      // add loading to button while this function runs
    }

    return (
      <Modal
        show={modal}
        onHide={() => { setModal(false) }}
        backdrop="static"
        keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Submit Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Submission Modal
          {/* Yeah CAPTCHAs are annoying, but they help reduce bot spam data. */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => { setModal(false) }}>Close</Button>
          <Button variant="primary" onClick={handleSubmit}>Finish</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  if (loadError)
    return <div>Error loading maps</div>
  if (!isLoaded)
    return <div>Loading...</div>
  return (
    <>
      <div id="submission-navbar">
        <Header />
      </div>
      <SearchOffcanvas />
      <SearchButton />
      <InfoButton />
      <InfoOffcanvas />
      <RecenterButton />
      <Toast />
      <GoogleMap
        id="google-map"
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
                }]
              }}
            />
          )
        })}

        {unconfirmedMarker ? (<Marker
          position={{ lat: unconfirmedMarker.lat, lng: unconfirmedMarker.lng }}
          animation={1}
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
      <SubmitButton />
      <SubmissionModal />
    </>
  )
}
