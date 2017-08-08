# whitelodge

[![npm version](https://badge.fury.io/js/whitelodge.svg)](https://badge.fury.io/js/whitelodge) [![Build Status](https://travis-ci.org/liegeandlief/whitelodge.svg?branch=master)](https://travis-ci.org/liegeandlief/whitelodge) [![Known Vulnerabilities](https://snyk.io/test/github/liegeandlief/whitelodge/badge.svg)](https://snyk.io/test/github/liegeandlief/whitelodge)

**whitelodge** is a small library which makes managing state in React applications easy. It takes cues from other libraries such as Redux and MobX but endeavours to be simpler to understand and to use.

## What does whitelodge do?

whitelodge does the following and nothing more:

- Allows for the creation of stores (e.g. in a shopping application there might be a store for the inventory). These stores contain the current state (e.g. details of the current inventory items), previous states and methods for mutating the current state (e.g. a method for adding an item which sends the item details to a server and updates the current state with the new item's details).
- Allows these stores to be made available globally so that all components in a React application can access them. A component can then subscribe to particular stores and will receive references to these stores in its props. Whenever the state is updated in one of these subscribed stores then an update will be triggered on the component.

## How do I install whitelodge?

- Your application should have a dependency of React >=0.13.0.
- Then run `npm install whitelodge`

## How do I use whitelodge?

### Creating a store

Stores are just classes which extend whitelodge's `Store` class. The constructor of a store should call `super` passing it the following arguments:

- The store's name (required). This should be a string and is the key by which the store will referenced from other parts of the application. All stores which are made globally available in an application should have different names.
- The store's initial state (optional, defaults to `{}`). This should be an object.
- Whether or not to log changes to this store's state to the console (optional, defaults to `false`). This should be a boolean.
- The number of previous states to keep in the store's `previousStates` property (optional, defaults to 10). This should be an integer greater than zero.

The store should then contain methods for mutating its state. Mutation methods should update the store's state by calling `this.setStoreState` and passing it the new state object. This new state object is copied into the existing state using `Object.assign`. Once the store's state has been updated then its most recent previous state is available under the store's `previousStates` property as the first object in the array.

The store can also contain methods which do not mutate the state but do something with its current value and return the result of this operation (see the `sumAllItemsTotalQuantities` method in the class below).

A simple store for an inventory of items might look as follows:

```javascript
'use strict'

import {Store} from 'whitelodge'

export default class Inventory extends Store {
  constructor () {
    super('inventory', {items: [{description:'Cherry pies', quantity: 11)}]}, true, 20)
  }

  addItem (description, quantity) {
    // Arguments would normally be validated here
    anHTTPClient.post('/addItem', {
      description: description,
      quantity: quantity
    })
    .then(response => {
      this.setStoreState({
        // It is important to avoid directly changing this.state hence the use of concat instead of push
        items: this.state.items.concat([{
          itemID: response.data.id,
          description: description,
          quantity: quantity          
        }])
      })
    })
    .catch(error => {
      // Errors would normally be handled here
    })
  }

  sumAllItemsTotalQuantities () {
    return this.state.items.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  }
}
```

As mentioned in the above example it is important to avoid directly changing a store's state. Store state should only be changed using the `this.setStoreState` method because this will cause subscribed components to update.

whitelodge's `Store` class defines the following properties so do not define properties or methods with the following names on classes which extend `Store`:

- name
- initialState
- previousStates
- subscribers
- logStateToConsole
- numberOfPreviousStatesToKeep
- validateArguments
- doLogStateToConsole
- addCurrentStateToPreviousStates
- setStoreState
- subscribe
- unsubscribe

## Making stores globally available

In order for components to be able to subscribe to stores the stores need to be made globally available. This should be done in the constructor (or in `componentWillMount` if using `React.createClass` or `createReactClass`) of the application's top-level component by calling `makeStoresGloballyAvailable` and passing it instances of the stores. See the following example:

```javascript
'use strict'

import React from 'react'
import {makeStoresGloballyAvailable} from 'whitelodge'
import Inventory from './stores/Inventory'
import AnotherStore from './stores/AnotherStore'

export default class App extends React.Component {
  constructor () {
    makeStoresGloballyAvailable(new Inventory(), new AnotherStore())
  }

  render () {
    return (
      <div>...</div>
    )
  }
}
```

### Subscribing to stores

Components can access stores by subscribing to them as follows:

```javascript
'use strict'

import React from 'react'
import {AddStoreSubscriptions} from 'whitelodge'

class InventoryList extends React.Component {
  render () {
    return (
      <ul>...</ul>
    )
  }
}

export default AddStoreSubscriptions(InventoryList, ['inventory', 'anotherStore'])
```

This component will be able to access these stores using `this.props.inventory` and `this.props.anotherStore`. State can be read from the `state` property e.g. `this.props.inventory.state` but should not be directly changed.

The most recent previous state of a store can be read from the first item in the `previousStates` array e.g. `this.props.inventory.previousStates[0]`. This can be used to compare the current and previous states of the store in the component's lifecycle methods. Older versions of the state are also available in the array depending on how many previous states the store is configured to keep.

Store methods can be called from props too e.g. `this.props.inventory.addItem('Damn good coffees', 2)`.

## Things to do in future

- Add a CHANGELOG.md file.
- Make whitelodge work in all JavaScript applications, not just React applications.
- Allow for server-side rendering.
- Enforce store state immutability.
