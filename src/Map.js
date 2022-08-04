import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import Navbar from './Navbar';
import React from 'react';
import Footer from './Footer';
import './Map.css'
import './.env'

export default function Map() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_MAPS_API_KEY,
  })

  if (!isLoaded) return <div>Loading...</div>
  return (
    <div>
      <Navbar />
      <div className='main'>
        <div className='map-content'>
          <div className='map-text'>
            <h1>The Map</h1>
            <h2 className='map-subheading'>How it works?</h2>
            <ul>
              <li>By default, the map displays popular pick up points as red clusters.</li>
              <li>Clicking on a red cluster will reveal popular drop off points as blue clusters.</li>
              <li>Zooming into clusters will split clusters incrementally and show the location of submissions with a greater accuracy.</li>
            </ul>
          </div>
          <GoogleMap zoom={8.2} center={{ lat: 40.0583, lng: -74.4057 }} mapContainerClassName='map-container' />
        </div>
      </div>
      <Footer />
    </div>
  );
}
