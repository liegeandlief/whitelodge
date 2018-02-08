'use-strict'

/* eslint-disable no-undef */
/* eslint-disable no-new */

import {renderInitialStatesOfStores} from '../../src/'
import TestStore from '../TestStore'
import NamespacedTestStore from '../NamespacedTestStore'

global.console.log = jest.fn()
global.console.error = jest.fn()
global.console.warn = jest.fn()

describe('Test rendering the initial state of a store.', () => {
  test('It renders the correct initial state.', () => {
    new TestStore()

    expect(() => { renderInitialStatesOfStores({notAString: true}, window) }).toThrow()
    expect(() => { renderInitialStatesOfStores('', window) }).toThrow()
    expect(() => { renderInitialStatesOfStores('Not just letters!!!1', window) }).toThrow()
    expect(() => { renderInitialStatesOfStores('window', 'notAnObject') }).toThrow()
    expect(() => { renderInitialStatesOfStores('window', window, ['notAString']) }).toThrow()
    expect(() => { renderInitialStatesOfStores('window', window, '') }).toThrow()
    expect(() => { renderInitialStatesOfStores('window', window, 'Not just letters!!!1') }).toThrow()

    expect(renderInitialStatesOfStores()).toEqual(
      '<script type="text/javascript">window["whitelodge_preRenderedInitialStates"]["testStore"]={"counter":0};</script>'
    )
  })

  test('It renders the correct initial state when namespaced.', () => {
    new NamespacedTestStore()

    expect(renderInitialStatesOfStores('window', window, 'testNamespace')).toEqual(
      '<script type="text/javascript">window["testNamespace_preRenderedInitialStates"]["namespacedTestStore"]={"counter":0};</script>'
    )
  })
})
