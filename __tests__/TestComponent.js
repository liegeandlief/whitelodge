'use strict'

import React from 'react'
import {AddStoreSubscriptions} from '../src/'
import root from 'window-or-global'

class TestComponent extends React.Component {
  render () {
    const {counter} = root.whitelodge.stores.testStore.storeState
    return (
      <div>
        <button onClick={() => { root.whitelodge.stores.testStore.incrementCounter() }} />
        {counter === 0 && <div id='counterIs0' />}
        {counter === 1 && <div id='counterIs1' />}
        {counter === 2 && <div id='counterIs2' />}
      </div>
    )
  }
}

export default AddStoreSubscriptions(TestComponent, ['testStore'])
