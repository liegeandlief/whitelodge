'use strict'

import {Store} from '../src/'

export default class NamespacedTestStore extends Store {
  constructor () {
    super('namespacedTestStore', {'counter': 0}, window, false, 1, 'testNamespace')
  }

  incrementCounter () {
    this.setStoreState({'counter': this.storeState.counter + 1})
  }
}
