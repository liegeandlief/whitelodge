'use-strict'

/* eslint-disable no-undef */

import {Store, makeStoresGloballyAvailable} from '../../src/'

global.console.log = jest.fn()
global.console.error = jest.fn()
global.console.warn = jest.fn()

test('Calling makeStoresGloballyAvailable with invalid parameters throws an error.', () => {
  expect(() => { makeStoresGloballyAvailable() }).toThrow()
  expect(() => { makeStoresGloballyAvailable('notAnArray') }).toThrow()
  expect(() => { makeStoresGloballyAvailable(['notAnInstanceOfStore']) }).toThrow()
  expect(() => { makeStoresGloballyAvailable([new Store('testStore'), 'notAnInstanceOfStore']) }).toThrow()
})

test('Calling makeStoresGloballyAvailable with two stores with the same name throws an error.', () => {
  expect(() => { makeStoresGloballyAvailable([new Store('testStore'), new Store('testStore')]) }).toThrow()
})

test('Calling makeStoresGloballyAvailable with correct parameters makes stores available in global object.', () => {
  const store1 = new Store('store1')
  const store2 = new Store('store2')
  const store3 = new Store('store3')
  makeStoresGloballyAvailable([store1, store2, store3])
  expect(global.whitelodge.stores.store1).toEqual(store1)
  expect(global.whitelodge.stores.store2).toEqual(store2)
  expect(global.whitelodge.stores.store3).toEqual(store3)
})
