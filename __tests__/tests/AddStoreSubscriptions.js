'use-strict'

/* eslint-disable no-undef */
/* eslint-disable no-new */

import React from 'react'
import TestComponent from '../TestComponent'
import NamespacedTestComponent from '../NamespacedTestComponent'
import TestComponentWhichShouldThrow1 from '../TestComponentWhichShouldThrow1'
import TestComponentWhichShouldThrow2 from '../TestComponentWhichShouldThrow2'
import TestComponentWhichShouldThrow3 from '../TestComponentWhichShouldThrow3'
import TestComponentWhichShouldThrow4 from '../TestComponentWhichShouldThrow4'
import TestComponentWhichShouldThrow5 from '../TestComponentWhichShouldThrow5'
import TestComponentWhichShouldThrow6 from '../TestComponentWhichShouldThrow6'
import {configure, mount} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16' // Required for enzyme to work with React 16
import TestStore from '../TestStore'
import NamespacedTestStore from '../NamespacedTestStore'

configure({ adapter: new Adapter() }) // Required for enzyme to work with React 16

global.console.log = jest.fn()
global.console.error = jest.fn()
global.console.warn = jest.fn()

const createStoreAndMountComponent = (component, Store) => {
  new Store()
  return mount(component)
}

describe('Test a component which subscribes to a store.', () => {
  test('Components with invalid store subscriptions should throw errors.', () => {
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow1 />, TestStore) }).toThrow()
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow2 />, TestStore) }).toThrow()
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow3 />, TestStore) }).toThrow()
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow4 />, TestStore) }).toThrow()
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow5 />, TestStore) }).toThrow()
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow6 />, TestStore) }).toThrow()
  })

  let component, instance, storeUpdatedTime1, storeUpdatedTime2, storeUpdatedTime3, storeUpdatedTime4

  test('It has the correct initial elements and state.', () => {
    component = createStoreAndMountComponent(<TestComponent />, TestStore)
    instance = component.instance()
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(1)
    expect(component.find('#counterIs1')).toHaveLength(0)
    expect(component.find('#counterIs2')).toHaveLength(0)
    expect(instance.state).toHaveProperty('testStore')
    storeUpdatedTime1 = instance.state.testStore
    expect(typeof storeUpdatedTime1).toBe('number')
  })

  test('It has the correct elements and state after click event which should update state via a store mutation method.', () => {
    component.find('button').simulate('click')
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(0)
    expect(component.find('#counterIs1')).toHaveLength(1)
    expect(component.find('#counterIs2')).toHaveLength(0)
    expect(instance.state).toHaveProperty('testStore')
    storeUpdatedTime2 = instance.state.testStore
    expect(typeof storeUpdatedTime2).toBe('number')
    expect(storeUpdatedTime2).toBeGreaterThan(storeUpdatedTime1)
    component.find('button').simulate('click')
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(0)
    expect(component.find('#counterIs1')).toHaveLength(0)
    expect(component.find('#counterIs2')).toHaveLength(1)
    expect(instance.state).toHaveProperty('testStore')
    storeUpdatedTime3 = instance.state.testStore
    expect(typeof storeUpdatedTime3).toBe('number')
    expect(storeUpdatedTime3).toBeGreaterThan(storeUpdatedTime2)
    component.find('button').simulate('click')
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(0)
    expect(component.find('#counterIs1')).toHaveLength(0)
    expect(component.find('#counterIs2')).toHaveLength(0)
    expect(instance.state).toHaveProperty('testStore')
    storeUpdatedTime4 = instance.state.testStore
    expect(typeof storeUpdatedTime4).toBe('number')
    expect(storeUpdatedTime4).toBeGreaterThan(storeUpdatedTime3)
  })
})

describe('Test a component which subscribes to a namespaced store.', () => {
  let component, instance, storeUpdatedTime1, storeUpdatedTime2, storeUpdatedTime3, storeUpdatedTime4

  test('It has the correct initial elements and state.', () => {
    component = createStoreAndMountComponent(<NamespacedTestComponent />, NamespacedTestStore)
    instance = component.instance()
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(1)
    expect(component.find('#counterIs1')).toHaveLength(0)
    expect(component.find('#counterIs2')).toHaveLength(0)
    expect(instance.state).toHaveProperty('namespacedTestStore')
    storeUpdatedTime1 = instance.state.namespacedTestStore
    expect(typeof storeUpdatedTime1).toBe('number')
  })

  test('It has the correct elements and state after click event which should update state via a store mutation method.', () => {
    component.find('button').simulate('click')
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(0)
    expect(component.find('#counterIs1')).toHaveLength(1)
    expect(component.find('#counterIs2')).toHaveLength(0)
    expect(instance.state).toHaveProperty('namespacedTestStore')
    storeUpdatedTime2 = instance.state.namespacedTestStore
    expect(typeof storeUpdatedTime2).toBe('number')
    expect(storeUpdatedTime2).toBeGreaterThan(storeUpdatedTime1)
    component.find('button').simulate('click')
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(0)
    expect(component.find('#counterIs1')).toHaveLength(0)
    expect(component.find('#counterIs2')).toHaveLength(1)
    expect(instance.state).toHaveProperty('namespacedTestStore')
    storeUpdatedTime3 = instance.state.namespacedTestStore
    expect(typeof storeUpdatedTime3).toBe('number')
    expect(storeUpdatedTime3).toBeGreaterThan(storeUpdatedTime2)
    component.find('button').simulate('click')
    expect(component.find('button')).toHaveLength(1)
    expect(component.find('#counterIs0')).toHaveLength(0)
    expect(component.find('#counterIs1')).toHaveLength(0)
    expect(component.find('#counterIs2')).toHaveLength(0)
    expect(instance.state).toHaveProperty('namespacedTestStore')
    storeUpdatedTime4 = instance.state.namespacedTestStore
    expect(typeof storeUpdatedTime4).toBe('number')
    expect(storeUpdatedTime4).toBeGreaterThan(storeUpdatedTime3)
  })
})
