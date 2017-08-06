'use strict'

import React from 'react'
import {AddStoreSubscriptions, makeStoresGloballyAvailable} from '../src/'
import TestStore from './TestStore'

const testStore = new TestStore()
makeStoresGloballyAvailable([testStore])

class TestComponent extends React.Component {
  render () {
    return null
  }
}

export default AddStoreSubscriptions(TestComponent, 'notAnArray')
