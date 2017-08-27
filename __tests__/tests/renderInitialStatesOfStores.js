'use-strict'

/* eslint-disable no-undef */
/* eslint-disable no-new */

import {renderInitialStatesOfStores} from '../../src/'
import TestStore from '../TestStore'

global.console.log = jest.fn()
global.console.error = jest.fn()
global.console.warn = jest.fn()

describe('Test rendering the initial state of a store.', () => {
  test('It renders the correct initial state.', () => {
    new TestStore()
    expect(renderInitialStatesOfStores()).toEqual(
      '<script type="text/javascript">window["whitelodge"].preRenderedInitialStates["testStore"]={"counter":0};</script>'
    )
  })
})
