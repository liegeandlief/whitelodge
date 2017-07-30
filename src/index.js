'use strict'

import isObject from 'isobject'
import {Component, isValidElement} from 'react'
import PropTypes from 'prop-types'

const contextObjectName = 'whitelodge'

const genericSubscribeToStoresAndSetInitialState = (thisContext, storeNames, initialState, returnObject = false) => {
  if (!isValidElement(thisContext)) throw 'TODO'
  if (Array.isArray(storeNames)) throw 'TODO'
  if (!isObject(initialState)) throw 'TODO'

  const storeStates = storeNames.reduce((storeStates, storeName) => {
    if (typeof storeName !== 'string') throw 'TODO'
    storeStates[storeName] = thisContext.stores[storeName].subscribe(thisContext)
    return storeStates
  }, {})

  const newInitialState = Object.assign({}, initialState, storeStates)
  if (returnObject) return newInitialState
  thisContext.state = newInitialState
}

export class Store {
  constructor (name, initialState = {}, logStateToConsole = false, numberOfPreviousStatesToKeep = 25) {
    this.logPrefix = 'whitelodge | '
    this.name = name
    this.state = {}
    this.previousStates = []
    this.subscribers = []
    this.logStateToConsole = logStateToConsole
    this.numberOfPreviousStatesToKeep = numberOfPreviousStatesToKeep
    this.setStoreState(initialState)
  }

  isValidSubscriber (subscriber) {
    const isValidSubscriber = isValidElement(subscriber)
    if (!isValidSubscriber) {
      console.error(this.logPrefix + 'A subscriber is not a valid React component instance.', subscriber)
    }
    return isValidSubscriber
  }

  doLogStateToConsole () {
    if (this.logStateToConsole) console.log(this.logPrefix + this.name + ' | ', new Date(), this.state)
  }

  addCurrentStateToPreviousStates () {
    if (this.numberOfPreviousStatesToKeep > 0) {
      this.previousStates.unshift(this.state)
      if (this.previousStates.length > this.numberOfPreviousStatesToKeep) {
        this.previousStates = this.previousStates.slice(0, this.numberOfPreviousStatesToKeep)
      }
    }
  }

  setStoreState (newState) {
    if (isObject(newState)) {
      this.addCurrentStateToPreviousStates()
      Object.assign(this.state, newState)
      this.subscribers.forEach(subscriber => {
        if (this.isValidSubscriber(subscriber)) {
          subscriber.setState({[this.name]: this.state})
        }
      })
      this.doLogStateToConsole()
    } else {
      console.error(this.logPrefix + 'State must be an object.', newState)
    }
  }

  subscribe (subscriber) {
    if (this.isValidSubscriber(subscriber)) {
      this.subscribers.push(subscriber)
      return this.state
    }
  }
}

export class Provider extends Component {
  getChildContext () {
    return {[contextObjectName]: {stores: this.props.stores.reduce((storesObject, store) => {
      storesObject[store.name] = store
      return storesObject
    }, {})}}
  }

  render () {
    return <div id='whitelodge'>{this.props.children}</div>
  }
}

Provider.propTypes = {stores: PropTypes.arrayOf(PropTypes.object).isRequired}
Provider.childContextTypes = {[contextObjectName]: PropTypes.object}

export class ReactComponentWithStores extends Component {
  constructor () {
    super()
    this.stores = this.context[contextObjectName].stores
  }

  subscribeToStoresAndSetInitialState (storeNames, initialState) {
    genericSubscribeToStoresAndSetInitialState(this, storeNames, initialState)
  }
}

ReactComponentWithStores.contextTypes = {[contextObjectName]: PropTypes.object}

export const StoresMixin = {
  contextTypes: {[contextObjectName]: PropTypes.object},
  stores: this.context[contextObjectName].stores,
  subscribeToStoresAndSetInitialState: (storeNames, initialState) => {
    genericSubscribeToStoresAndSetInitialState(this, storeNames, initialState, true)
  }
}
