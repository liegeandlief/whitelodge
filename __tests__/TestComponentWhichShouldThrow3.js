'use strict'

import React from 'react'
import {AddStoreSubscriptions} from '../src/'

class TestComponent extends React.Component {
  render () {
    return null
  }
}

export default AddStoreSubscriptions(TestComponent, ['testStore'], 'notAnObject')
