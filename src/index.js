'use strict'

import isObject from 'isobject'
import isFunction from 'is-function'
import isString from 'is-string'
import React from 'react'
import {merge} from 'seamless-immutable'

/******************************************************************************/

const logPrefix = 'whitelodge - '

const throwError = (message, varToDump = '§varToDumpNotReceived§') => {
  if (varToDump !== '§varToDumpNotReceived§') console.error(varToDump)
  throw new Error(logPrefix + message)
}

const validateGlobalScope = globalScope => {
  if (!isObject(globalScope)) throwError('Global scope must be an object.', globalScope)
}

const validateNamespace = namespace => {
  if (!isString(namespace) || !(/^[a-zA-Z]+$/.test(namespace))) {
    throwError('namespace must be an alphabetic string.', namespace)
  }
}

/******************************************************************************/

export class Store {
  constructor (name, initialState = {}, globalScope = window, logStateToConsole = false, numberOfPreviousStatesToKeep = 1, namespace = 'whitelodge') {
    const parsedNumberOfPreviousStatesToKeep = Number(numberOfPreviousStatesToKeep)
    storePrivateMethods.validateArguments.call(this, name, initialState, logStateToConsole, parsedNumberOfPreviousStatesToKeep, globalScope, namespace)

    this.storeNamespace = namespace
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
      typeof globalScope[this.storeNamespace + '_preRenderedInitialStates'] !== 'undefined' &&
      typeof globalScope[this.storeNamespace + '_preRenderedInitialStates'][this.storeSettings.name] !== 'undefined'
    ) {
      this.setStoreState(globalScope[this.storeNamespace + '_preRenderedInitialStates'][this.storeSettings.name])
      delete globalScope[this.storeNamespace + '_preRenderedInitialStates'][this.storeSettings.name]
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

const storePrivateMethods = {
  makeGloballyAvailable: function (globalScope) {
    if (!isObject(globalScope[this.storeNamespace])) globalScope[this.storeNamespace] = {stores: {}}
    globalScope[this.storeNamespace].stores[this.storeSettings.name] = this
  },

  validateNewState: function (newState) {
    if (!isObject(newState)) throwError('State must be an object.', newState)
  },

  validateArguments: function (name, initialState, logStateToConsole, numberOfPreviousStatesToKeep, globalScope, namespace) {
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
    validateNamespace(namespace)
  },

  doLogStateToConsole: function () {
    if (this.storeSettings.logStateToConsole) {
      console.log(logPrefix + this.storeSettings.name + ' - ', new Date(), this.storeState)
    }
  },

  addCurrentStateToPreviousStates: function () {
    this.previousStoreStates.unshift(this.storeState)
    if (this.previousStoreStates.length > this.storeSettings.numberOfPreviousStatesToKeep) {
      this.previousStoreStates = this.previousStoreStates.slice(0, this.storeSettings.numberOfPreviousStatesToKeep)
    }
  }
}

/******************************************************************************/

export const AddStoreSubscriptions = (ChildComponent, storeNames, globalScope = window, namespace = 'whitelodge') => class extends React.Component {
  constructor (props) {
    super(props)
    this.subscribeToStores()
  }

  subscribeToStores () {
    if (!Array.isArray(storeNames)) {
      throwError('The second argument passed to AddStoreSubscriptions should be an array of store names to which you want to subscribe.', storeNames)
    }
    validateGlobalScope(globalScope)
    validateNamespace(namespace)

    const initialState = {}

    storeNames.forEach(storeName => {
      if (typeof storeName !== 'string') {
        throwError('Each store name passed to AddStoreSubscriptions should be a string.', storeName)
      }
      if (!globalScope[namespace].stores.hasOwnProperty(storeName)) {
        throwError('There is not store called "' + storeName + '".', globalScope[namespace])
      }
      initialState[storeName] = (new Date()).getTime()
      globalScope[namespace].stores[storeName].subscribeToStore(this)
    })

    this.state = initialState
  }

  componentWillUnmount () {
    Object.keys(globalScope[namespace].stores).forEach(key => {
      globalScope[namespace].stores[key].unsubscribeFromStore(this)
    })
  }

  render () {
    const whitelodge = {
      ['whitelodge_' + namespace]: this.state
    }
    return <ChildComponent {...whitelodge} {...this.props} />
  }
}

/******************************************************************************/

export const renderInitialStatesOfStores = (globalScopeName = 'window', globalScope = window, namespace = 'whitelodge') => {
  if (!isString(globalScopeName) || !(/^[a-zA-Z]+$/.test(globalScopeName))) {
    throwError('globalScopeName must be an alphabetic string.', globalScopeName)
  }
  validateGlobalScope(globalScope)
  validateNamespace(namespace)
  const script = Object.keys(globalScope[namespace].stores).reduce((assignments, storeName) => {
    return (
      assignments +
      globalScopeName + '["' + namespace + '_preRenderedInitialStates"]["' + storeName + '"]=' +
      JSON.stringify(globalScope[namespace].stores[storeName].storeState) +
      ';'
    )
  }, '<script type="text/javascript">')
  return script + '</script>'
}
