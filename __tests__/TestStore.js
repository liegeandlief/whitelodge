'use strict'

import {Store} from '../src/'

export default class TestStore extends Store {
  constructor () {
    super('testStore', {'counter': 0})
  }

  incrementCounter () {
    this.setStoreState({'counter': this.storeState.counter + 1})
  }
}
