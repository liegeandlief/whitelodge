'use strict'

import isObject from 'isobject'
import isFunction from 'is-function'
import isString from 'is-string'
import React from 'react'
import {merge} from 'seamless-immutable'

const logPrefix = 'whitelodge | '

const throwError = (message, varToDump = '§varToDumpNotReceived§') => {
  if (varToDump !== '§varToDumpNotReceived§') console.error(varToDump)
  throw new Error(logPrefix + message)
}

const validateGlobalScope = globalScope => {
  if (!isObject(globalScope)) throwError('Global scope must be an object.', globalScope)
}

const storePrivateMethods = {
  makeGloballyAvailable: function (globalScope) {
    if (!isObject(globalScope.whitelodge)) globalScope.whitelodge = {stores: {}}
    globalScope.whitelodge.stores[this.storeSettings.name] = this
  },

  validateNewState: function (newState) {
    if (!isObject(newState)) throwError('State must be an object.', newState)
  },

  validateArguments: function (name, initialState, logStateToConsole, numberOfPreviousStatesToKeep, globalScope) {
    if (typeof name !== 'string' || !name.length) {
      throwError('Store name should be a non-empty string.', name)
    }
    storePrivateMethods.validateNewState.call(this, initialState)
    if (typeof logStateToConsole !== 'boolean') {
      throwError('When indicating whether to log state to console you should pass a boolean value.', logStateToConsole)
    }
    if (isNaN(numberOfPreviousStatesToKeep) || numberOfPreviousStatesToKeep < 1) {
      throwError('When indicating how many previous versions of state to keep you should pass a number > 0.', numberOfPreviousStatesToKeep)
    }
    validateGlobalScope(globalScope)
  },

  doLogStateToConsole: function () {
    if (this.storeSettings.logStateToConsole) {
      console.log(logPrefix + this.storeSettings.name + ' | ', new Date(), this.storeState)
    }
  },

  addCurrentStateToPreviousStates: function () {
    this.previousStoreStates.unshift(this.storeState)
    if (this.previousStoreStates.length > this.storeSettings.numberOfPreviousStatesToKeep) {
      this.previousStoreStates = this.previousStoreStates.slice(0, this.storeSettings.numberOfPreviousStatesToKeep)
    }
  }
}

export class Store {
  constructor (name, initialState = {}, globalScope = window, logStateToConsole = false, numberOfPreviousStatesToKeep = 1) {
    const parsedNumberOfPreviousStatesToKeep = Number(numberOfPreviousStatesToKeep)
    storePrivateMethods.validateArguments.call(this, name, initialState, logStateToConsole, parsedNumberOfPreviousStatesToKeep, globalScope)

    this.storeSettings = {
      name,
      logStateToConsole,
      numberOfPreviousStatesToKeep: parsedNumberOfPreviousStatesToKeep
    }
    this.storeState = {}
    this.previousStoreStates = []
    this.storeSubscribers = []

    if (
      typeof globalScope !== 'undefined' &&
      typeof globalScope.whitelodge !== 'undefined' &&
      typeof globalScope.whitelodge.preRenderedInitialStates !== 'undefined' &&
      typeof globalScope.whitelodge.preRenderedInitialStates[this.storeSettings.name] !== 'undefined'
    ) {
      this.setStoreState(globalScope.whitelodge.preRenderedInitialStates[this.storeSettings.name])
      delete globalScope.whitelodge.preRenderedInitialStates[this.storeSettings.name]
    } else {
      this.setStoreState(initialState)
    }
    storePrivateMethods.makeGloballyAvailable.call(this, globalScope)
  }

  setStoreState (newState) {
    storePrivateMethods.validateNewState.call(this, newState)
    storePrivateMethods.addCurrentStateToPreviousStates.call(this)
    this.storeState = merge(this.storeState, newState)
    this.storeSubscribers.forEach(subscriber => {
      subscriber.setState({[this.storeSettings.name]: (new Date()).getTime()})
    })
    storePrivateMethods.doLogStateToConsole.call(this)
  }

  subscribeToStore (newSubscriber) {
    if (!isFunction(newSubscriber.setState)) {
      throwError('Store subscribers must be components with a setState function as a property.', newSubscriber)
    }
    this.storeSubscribers.forEach(subscriber => {
      if (subscriber === newSubscriber) {
        throwError('Component is already subscribed to the store "' + this.storeSettings.name + '".', newSubscriber)
      }
    })
    this.storeSubscribers.push(newSubscriber)
  }

  unsubscribeFromStore (unsubscriber) {
    for (let i = 0; i < this.storeSubscribers.length; i++) {
      if (this.storeSubscribers[i] === unsubscriber) {
        this.storeSubscribers.splice(i, 1)
        break
      }
    }
  }
}

export const AddStoreSubscriptions = (ChildComponent, storeNames, globalScope = window) => class extends React.Component {
  constructor (props) {
    super(props)
    this.subscribeToStores()
  }

  subscribeToStores () {
    if (!Array.isArray(storeNames)) {
      throwError('The second argument passed to AddStoreSubscriptions should be an array of store names to which you want to subscribe.', storeNames)
    }
    validateGlobalScope(globalScope)

    const initialState = {}

    storeNames.forEach(storeName => {
      if (typeof storeName !== 'string') {
        throwError('Each store name passed to AddStoreSubscriptions should be a string.', storeName)
      }
      if (!globalScope.whitelodge.stores.hasOwnProperty(storeName)) {
        throwError('There is not store called "' + storeName + '".', globalScope.whitelodge)
      }
      initialState[storeName] = (new Date()).getTime()
      globalScope.whitelodge.stores[storeName].subscribeToStore(this)
    })

    this.state = initialState
  }

  componentWillUnmount () {
    Object.keys(globalScope.whitelodge.stores).forEach(key => {
      globalScope.whitelodge.stores[key].unsubscribeFromStore(this)
    })
  }

  render () {
    return <ChildComponent whitelodge={this.state} {...this.props} />
  }
}

export const renderInitialStatesOfStores = (globalScopeName = 'window', globalScope = window) => {
  if (!isString(globalScopeName)) {
    throwError('globalScopeName must be a valid variable name as a string.', globalScopeName)
  }
  validateGlobalScope(globalScope)
  const script = Object.keys(globalScope.whitelodge.stores).reduce((assignments, storeName) => {
    return (
      assignments +
      globalScopeName +
      '.whitelodge.preRenderedInitialStates["' + storeName + '"]=' +
      JSON.stringify(globalScope.whitelodge.stores[storeName].storeState) +
      ';'
    )
  }, '<script type="text/javascript">')
  return script + '</script>'
}
