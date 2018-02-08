'use strict'

import React from 'react'
import {AddStoreSubscriptions} from '../src/'

class TestComponent extends React.Component {
  render () {
    const {counter} = global.testNamespace.stores.namespacedTestStore.storeState
    return (
      <div>
        <button onClick={() => { global.testNamespace.stores.namespacedTestStore.incrementCounter() }} />
        {counter === 0 && <div id='counterIs0' />}
        {counter === 1 && <div id='counterIs1' />}
        {counter === 2 && <div id='counterIs2' />}
      </div>
    )
  }
}

export default AddStoreSubscriptions(TestComponent, ['namespacedTestStore'], window, 'testNamespace')
