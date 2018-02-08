'use-strict'

/* eslint-disable no-undef */
/* eslint-disable no-new */

import React from 'react'
import {Store} from '../../src/'
import {configure, mount} from 'enzyme'
import Adapter from 'enzyme-adapter-react-16' // Required for enzyme to work with React 16

configure({ adapter: new Adapter() }) // Required for enzyme to work with React 16

let consoleLogMessages = []
let consoleLogDates = []
let consoleLogStates = []
global.console.error = jest.fn()
global.console.warn = jest.fn()
global.console.log = jest.fn((message, date, state) => {
  consoleLogMessages.push(message)
  consoleLogDates.push(date)
  consoleLogStates.push(state)
})
const fakeSubscriber = mount(<div />)

test('Throws an error when instantiated without a name.', () => {
  expect(() => { new Store() }).toThrow()
})

test('Has the expected properties when no arguments except "name" are passed.', () => {
  const testStore = new Store('testStore')
  expect(testStore).toHaveProperty('storeSettings')
  expect(testStore).toHaveProperty('storeState', {})
  expect(testStore).toHaveProperty('previousStoreStates', [{}])
  expect(testStore).toHaveProperty('storeSubscribers', [])
  expect(testStore.storeSettings).toHaveProperty('name', 'testStore')
  expect(testStore.storeSettings).toHaveProperty('logStateToConsole', false)
  expect(testStore.storeSettings).toHaveProperty('numberOfPreviousStatesToKeep', 1)
})

test('Has the expected properties when all arguments are passed.', () => {
  const testStore = new Store('testStore', {a: 1}, window, true, 5)
  expect(testStore).toHaveProperty('storeSettings')
  expect(testStore).toHaveProperty('storeState', {a: 1})
  expect(testStore).toHaveProperty('previousStoreStates', [{}])
  expect(testStore).toHaveProperty('storeSubscribers', [])
  expect(testStore.storeSettings).toHaveProperty('name', 'testStore')
  expect(testStore.storeSettings).toHaveProperty('logStateToConsole', true)
  expect(testStore.storeSettings).toHaveProperty('numberOfPreviousStatesToKeep', 5)
})

test('Has the expected properties when pre-rendered state is available.', () => {
  window.whitelodge_preRenderedInitialStates = {testStore: {a: 1}}
  const testStore = new Store('testStore')
  expect(testStore).toHaveProperty('storeSettings')
  expect(testStore).toHaveProperty('storeState', {a: 1})
  expect(testStore).toHaveProperty('previousStoreStates', [{}])
  expect(testStore).toHaveProperty('storeSubscribers', [])
  expect(testStore.storeSettings).toHaveProperty('name', 'testStore')
  expect(testStore.storeSettings).toHaveProperty('logStateToConsole', false)
  expect(testStore.storeSettings).toHaveProperty('numberOfPreviousStatesToKeep', 1)
  delete window.whitelodge_preRenderedInitialStates
})

test('Has the expected properties when all arguments are passed and pre-rendered state is available.', () => {
  window.testNamespace_preRenderedInitialStates = {namespacedTestStore: {c: 3}}
  const namespacedTestStore = new Store('namespacedTestStore', {b: 2}, window, true, 5, 'testNamespace')
  expect(namespacedTestStore).toHaveProperty('storeSettings')
  expect(namespacedTestStore).toHaveProperty('storeState', {c: 3})
  expect(namespacedTestStore).toHaveProperty('previousStoreStates', [{}])
  expect(namespacedTestStore).toHaveProperty('storeSubscribers', [])
  expect(namespacedTestStore.storeSettings).toHaveProperty('name', 'namespacedTestStore')
  expect(namespacedTestStore.storeSettings).toHaveProperty('logStateToConsole', true)
  expect(namespacedTestStore.storeSettings).toHaveProperty('numberOfPreviousStatesToKeep', 5)
  delete window.testNamespace_preRenderedInitialStates
})

test('Throws errors when passed invalid arguments.', () => {
  expect(() => { new Store('testStore', 'notAnObject') }).toThrow()
  expect(() => { new Store('testStore', {}, 'notAnObject') }).toThrow()
  expect(() => { new Store('testStore', {}, window, 'notABoolean') }).toThrow()
  expect(() => { new Store('testStore', {}, window, true, 0) }).toThrow()
  expect(() => { new Store('testStore', {}, window, true, 'notANumber') }).toThrow()
  expect(() => { new Store('testStore', {}, window, true, 1, ['notAString']) }).toThrow()
  expect(() => { new Store('testStore', {}, window, true, 1, '') }).toThrow()
  expect(() => { new Store('testStore', {}, window, true, 1, 'Not just letters!!!1') }).toThrow()
})

test('Is available globally.', () => {
  const testStore = new Store('testStore')
  expect(global.whitelodge.stores.testStore).toEqual(testStore)
})

test('Namespaced store is available globally.', () => {
  const namespacedTestStore = new Store('namespacedTestStore', {}, window, false, 1, 'testNamespace')
  expect(global.testNamespace.stores.namespacedTestStore).toEqual(namespacedTestStore)
})

describe('Test toggling logging of state to console.', () => {
  beforeEach(() => {
    consoleLogMessages = []
    consoleLogDates = []
    consoleLogStates = []
  })

  test('Does not log state to console.', () => {
    new Store('testStore', {a: 1})
    expect(consoleLogMessages).toHaveLength(0)
    expect(consoleLogDates).toHaveLength(0)
    expect(consoleLogStates).toHaveLength(0)
  })

  test('Does log state to console.', () => {
    new Store('testStore', {a: 1}, window, true)
    expect(consoleLogMessages).toHaveLength(1)
    expect(consoleLogDates).toHaveLength(1)
    expect(consoleLogStates).toHaveLength(1)
    expect(consoleLogMessages[0]).toEqual('whitelodge - testStore - ')
    expect(consoleLogDates[0]).toBeInstanceOf(Date)
    expect(consoleLogStates[0]).toEqual({a: 1})
  })

  afterAll(() => {
    consoleLogMessages = []
    consoleLogDates = []
    consoleLogStates = []
  })
})

test('Setting state works and keeps the correct number of previous states.', () => {
  const testStore = new Store('testStore', {a: 1, b: 1}, window, false, 3)
  expect(testStore).toHaveProperty('storeState', {a: 1, b: 1})
  expect(testStore).toHaveProperty('previousStoreStates', [{}])
  testStore.setStoreState({a: 2})
  expect(testStore).toHaveProperty('storeState', {a: 2, b: 1})
  expect(testStore).toHaveProperty('previousStoreStates', [{a: 1, b: 1}, {}])
  testStore.setStoreState({b: 2})
  expect(testStore).toHaveProperty('storeState', {a: 2, b: 2})
  expect(testStore).toHaveProperty('previousStoreStates', [{a: 2, b: 1}, {a: 1, b: 1}, {}])
  testStore.setStoreState({c: 1})
  expect(testStore).toHaveProperty('storeState', {a: 2, b: 2, c: 1})
  expect(testStore).toHaveProperty('previousStoreStates', [{a: 2, b: 2}, {a: 2, b: 1}, {a: 1, b: 1}])
  testStore.setStoreState({c: 2})
  expect(testStore).toHaveProperty('storeState', {a: 2, b: 2, c: 2})
  expect(testStore).toHaveProperty('previousStoreStates', [{a: 2, b: 2, c: 1}, {a: 2, b: 2}, {a: 2, b: 1}])
  testStore.setStoreState({c: {d: 1}})
  expect(testStore).toHaveProperty('storeState', {a: 2, b: 2, c: {d: 1}})
  expect(testStore).toHaveProperty('previousStoreStates', [{a: 2, b: 2, c: 2}, {a: 2, b: 2, c: 1}, {a: 2, b: 2}])
  testStore.setStoreState({c: {d: {e: 1}}})
  expect(testStore).toHaveProperty('storeState', {a: 2, b: 2, c: {d: {e: 1}}})
  expect(testStore).toHaveProperty('previousStoreStates', [{a: 2, b: 2, c: {d: 1}}, {a: 2, b: 2, c: 2}, {a: 2, b: 2, c: 1}])
})

test('Trying to directly alter state throws an error.', () => {
  const testStore = new Store('testStore', {a: 1, b: 1})
  expect(() => { testStore.storeState.a = 2 }).toThrow()
})

test('Trying to directly alter previous states throws an error.', () => {
  const testStore = new Store('testStore', {a: 1, b: 1})
  testStore.setStoreState({a: 2})
  expect(() => { testStore.previousStoreStates[0].a = 3 }).toThrow()
})

test('Subscribing to store works.', () => {
  const testStore = new Store('testStore')
  expect(testStore).toHaveProperty('storeSubscribers', [])
  expect(() => { testStore.subscribeToStore('notAFunction') }).toThrow()
  testStore.subscribeToStore(fakeSubscriber)
  expect(testStore.storeSubscribers[0]).toEqual(fakeSubscriber)
  expect(() => { testStore.subscribeToStore(fakeSubscriber) }).toThrow()
})

test('Unsubscribing from store works.', () => {
  const testStore = new Store('testStore')
  testStore.subscribeToStore(fakeSubscriber)
  testStore.unsubscribeFromStore(fakeSubscriber)
  expect(testStore).toHaveProperty('storeSubscribers', [])
})
