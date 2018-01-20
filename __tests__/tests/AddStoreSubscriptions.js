'use-strict'

/* eslint-disable no-undef */
/* eslint-disable no-new */

import React from 'react'
import TestComponent from '../TestComponent'
import TestComponentWhichShouldThrow1 from '../TestComponentWhichShouldThrow1'
import TestComponentWhichShouldThrow2 from '../TestComponentWhichShouldThrow2'
import {configure, mount} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16' // Required for enzyme to work with React 16
import TestStore from '../TestStore'

configure({ adapter: new Adapter() }) // Required for enzyme to work with React 16

global.console.log = jest.fn()
global.console.error = jest.fn()
global.console.warn = jest.fn()

const createStoreAndMountComponent = component => {
  new TestStore()
  return mount(component)
}

describe('Test a component which subscribes to a store.', () => {
  test('Components with invalid store subscriptions should throw errors.', () => {
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow1 />) }).toThrow()
    expect(() => { createStoreAndMountComponent(<TestComponentWhichShouldThrow2 />) }).toThrow()
  })

  let component, instance, storeUpdatedTime1, storeUpdatedTime2, storeUpdatedTime3, storeUpdatedTime4

  test('It has the correct initial elements and state.', () => {
    component = createStoreAndMountComponent(<TestComponent />)
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
