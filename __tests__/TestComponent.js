'use strict'

import React from 'react'
import {AddStoreSubscriptions} from '../src/'

class TestComponent extends React.Component {
  render () {
    return (
      <div>
        <button onClick={() => { this.props.testStore.incrementCounter(this.props.testStore.state.counter + 1) }} />
        {this.props.testStore.state.counter === 0 && <div id='counterIs0' />}
        {this.props.testStore.state.counter === 1 && <div id='counterIs1' />}
        {this.props.testStore.state.counter === 2 && <div id='counterIs2' />}
      </div>
    )
  }
}

export default AddStoreSubscriptions(TestComponent, ['testStore'])
