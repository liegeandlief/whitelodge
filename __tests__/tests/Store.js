'use-strict'

/* eslint-disable no-undef */
/* eslint-disable no-new */

import React from 'react'
import {Store} from '../../src/'
import {mount} from 'enzyme'

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
  expect(testStore).toHaveProperty('name', 'testStore')
  expect(testStore).toHaveProperty('state', {})
  expect(testStore).toHaveProperty('previousStates', [{}])
  expect(testStore).toHaveProperty('subscribers', [])
  expect(testStore).toHaveProperty('logStateToConsole', false)
  expect(testStore).toHaveProperty('numberOfPreviousStatesToKeep', 15)
})

test('Has the expected properties when all arguments are passed.', () => {
  const testStore = new Store('testStore', {a: 1}, true, 5)
  expect(testStore).toHaveProperty('name', 'testStore')
  expect(testStore).toHaveProperty('state', {a: 1})
  expect(testStore).toHaveProperty('previousStates', [{}])
  expect(testStore).toHaveProperty('subscribers', [])
  expect(testStore).toHaveProperty('logStateToConsole', true)
  expect(testStore).toHaveProperty('numberOfPreviousStatesToKeep', 5)
})

test('Throws errors when passed invalid arguments.', () => {
  expect(() => { new Store('testStore', 'notAnObject') }).toThrow()
  expect(() => { new Store('testStore', {}, 'notABoolean') }).toThrow()
  expect(() => { new Store('testStore', {}, true, 0) }).toThrow()
  expect(() => { new Store('testStore', {}, true, 'notANumber') }).toThrow()
})

describe('Test toggling logging of state to console.', () => {
  beforeEach(() => {
    consoleLogMessages = []
    consoleLogDates = []
    consoleLogStates = []
  })

  test('Does not log state to console.', () => {
    new Store('testStore', {a: 1}).doLogStateToConsole()
    expect(consoleLogMessages).toHaveLength(0)
    expect(consoleLogDates).toHaveLength(0)
    expect(consoleLogStates).toHaveLength(0)
  })

  test('Does log state to console.', () => {
    new Store('testStore', {a: 1}, true)
    expect(consoleLogMessages).toHaveLength(1)
    expect(consoleLogDates).toHaveLength(1)
    expect(consoleLogStates).toHaveLength(1)
    expect(consoleLogMessages[0]).toEqual('whitelodge | testStore | ')
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
  const testStore = new Store('testStore', {a: 1, b: 1}, false, 3)
  expect(testStore).toHaveProperty('state', {a: 1, b: 1})
  expect(testStore).toHaveProperty('previousStates', [{}])
  testStore.setStoreState({a: 2})
  expect(testStore).toHaveProperty('state', {a: 2, b: 1})
  expect(testStore).toHaveProperty('previousStates', [{a: 1, b: 1}, {}])
  testStore.setStoreState({b: 2})
  expect(testStore).toHaveProperty('state', {a: 2, b: 2})
  expect(testStore).toHaveProperty('previousStates', [{a: 2, b: 1}, {a: 1, b: 1}, {}])
  testStore.setStoreState({c: 1})
  expect(testStore).toHaveProperty('state', {a: 2, b: 2, c: 1})
  expect(testStore).toHaveProperty('previousStates', [{a: 2, b: 2}, {a: 2, b: 1}, {a: 1, b: 1}])
  testStore.setStoreState({c: 2})
  expect(testStore).toHaveProperty('state', {a: 2, b: 2, c: 2})
  expect(testStore).toHaveProperty('previousStates', [{a: 2, b: 2, c: 1}, {a: 2, b: 2}, {a: 2, b: 1}])
})

test('Subscribing to store works.', () => {
  const testStore = new Store('testStore')
  expect(testStore).toHaveProperty('subscribers', [])
  expect(() => { testStore.subscribe('notAFunction') }).toThrow()
  testStore.subscribe(fakeSubscriber)
  expect(testStore.subscribers[0]).toEqual(fakeSubscriber)
  expect(() => { testStore.subscribe(fakeSubscriber) }).toThrow()
})

test('Unsubscribing from store works.', () => {
  const testStore = new Store('testStore')
  testStore.subscribe(fakeSubscriber)
  testStore.unsubscribe(fakeSubscriber)
  expect(testStore).toHaveProperty('subscribers', [])
})
