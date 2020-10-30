import React from 'react'
import { render } from 'react-dom'

import {
  init,
  locations
} from 'contentful-ui-extensions-sdk'
import '@contentful/forma-36-react-components/dist/styles.css'
import '@contentful/forma-36-fcss/dist/styles.css'
import './index.css'

import EntryEditor from './components/EntryEditor'

init(sdk => {
  const root = document.getElementById('root')

  // All possible locations for your app
  // Feel free to remove unused locations
  // Dont forget to delete the file too :)
  const ComponentLocationSettings = [
    {
      location: locations.LOCATION_ENTRY_EDITOR,
      component: <EntryEditor sdk={sdk} />
    },
  ]

  // Select a component depending on a location in which the app is rendered.
  //
  // NB: Location "app-config" is auto-included in the list as most apps need it
  // You can remove it (and on the app definition also) in case the app
  // doesn't require it
  ComponentLocationSettings.forEach(componentLocationSetting => {
    if (sdk.location.is(componentLocationSetting.location)) {
      render(componentLocationSetting.component, root)
    }
  })
})
