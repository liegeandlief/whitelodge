# whitelodge

[![npm](https://img.shields.io/npm/v/whitelodge.svg)](https://www.npmjs.com/package/whitelodge) [![Build Status](https://travis-ci.org/liegeandlief/whitelodge.svg?branch=master)](https://travis-ci.org/liegeandlief/whitelodge) [![Known Vulnerabilities](https://snyk.io/test/github/liegeandlief/whitelodge/badge.svg)](https://snyk.io/test/github/liegeandlief/whitelodge)

**whitelodge** is a small library which makes global state management in React applications easy. It takes cues from other state management libraries such as Redux and MobX but endeavours to be simpler to understand and to use.

## What does whitelodge do?

whitelodge does the following and nothing more:

- Allows for the creation of stores (e.g. in a shopping application there might be a store for the inventory). These stores contain the current state (e.g. details of the current inventory items), previous states and methods for mutating the current state (e.g. a method for adding an item which sends the item details to a server and updates the current state with the new item's details).
- Allows these stores to be made available globally so that all components in a React application can access them. A component can then subscribe to particular stores and whenever the state is updated in one of these subscribed stores then an update will be triggered on the component.

## How do I install whitelodge?

- Your application should have a dependency of React >=16.0.0.
- Then run `npm install whitelodge`

## How do I use whitelodge?

### Creating a store

Stores are just classes which extend whitelodge's `Store` class. The constructor of a store should call `super` passing it the following arguments:

- The store's name (required). This should be a string and is the key by which the store will referenced from other parts of the application. All stores in an application should have different names.
- The store's initial state (optional, defaults to `{}`). This should be an object. Preparation of the initial state should be completed before a store is initialised i.e. if preparation of the initial state relies on asynchronous data fetching then this data fetching should be completed prior to initialising the store - this applies both on the client and the server.
- Whether or not to log changes to this store's state to the console (optional, defaults to `false`). This should be a boolean.
- The number of previous states to keep in the store's `previousStoreStates` property (optional, defaults to 1). This should be an integer greater than zero.

The store should then contain methods for mutating its state. Mutation methods should update the store's state by calling `this.setStoreState` and passing it the new state object. This new state object is copied into the existing state using seamless-immutable's `Immutable.merge` function. Once the store's state has been updated then its most recent previous state is available under the store's `previousStoreStates` property as the first object in the array.

The store can also contain methods which do not mutate the state but do something with its current value and return the result of this operation (see the `sumAllItemsTotalQuantities` method in the class below).

A simple store for an inventory of items might look as follows:

```javascript
'use strict'

import {Store} from 'whitelodge'

const initialState = {items: [{description:'Cherry pie', quantity: 11)}]}

export default class Inventory extends Store {
  constructor () {
    super('inventory', initialState, true, 20)
  }

  addItem (description, quantity) {
    // Arguments would normally be validated here
    anHTTPClient.post('/addItem', {
      description: description,
      quantity: quantity
    })
    .then(response => {
      this.setStoreState({
        // State is immutable and cannot be directly changed hence the use of concat instead of push
        items: this.storeState.items.concat([{
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
    return this.storeState.items.reduce((total, item) => {
      return total + item.quantity
    }, 0)
  }
}
```

A store's state object is immutable and so cannot be directly changed. Store state should only be changed using the `this.setStoreState` method because this will cause subscribed components to update. A store's state property should never have its value reassigned.

whitelodge's `Store` class defines the following properties/methods so avoid defining properties or methods with the following names on classes which extend `Store`:

- storeSettings
- storeState
- previousStoreStates
- storeSubscribers
- setStoreState
- subscribeToStore
- unsubscribeFromStore

### Initialisation of stores

Stores should be initialised prior to rendering any React components which use them. Initialisation of a store is as simple as:

```javascript
import Inventory from './stores/Inventory'

new Inventory()
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

This component will be able to access these stores from the global object (e.g. `window` in the broswer, `global` in Node.js) like `window.whitelodge.stores.inventory` and `window.whitelodge.stores.anotherStore`. State can be read from the `storeState` property e.g. `window.whitelodge.stores.inventory.storeState`.

The most recent previous state of a store can be read from the first item in the `previousStoreStates` array e.g. `window.whitelodge.stores.inventory.previousStoreStates[0]`. This can be used to compare the current and previous states of the store in the component's lifecycle methods. Older versions of the state are also available in the array depending on how many previous states the store is configured to keep.

Given a component where what is rendered is only a function of the component's props and state, if this component subscribes to a whitelodge store then what is rendered becomes a function of its props, state and the store's state.

Store methods can be called from the global object too e.g. `window.whitelodge.stores.inventory.addItem('Damn fine coffee', 2)`.

### Server-side rendering

When building a React application a common scenario is that the initial render is performed on the server. Fortunately whitelodge supports server-side rendering. This is best demonstrated with an example.

The following module exposes a function called `generateHTML`:

#### server.js

```javascript
import TopLevelAppComponent from './components/TopLevelAppComponent'
import {renderInitialStatesOfStores} from 'whitelodge'
import {renderToString} from 'react-dom/server'
import store1 from './stores/store1'
import store2 from './stores/store2'

new store1()
new store2()

const generateHTML = () => {
  return `<!doctype html>
  <html>
    <head>
      <title>React application with whitelodge, rendered on the server</title>
    </head>
    <body>
      ${renderInitialStatesOfStores()}
      <div id="app">${renderToString(<TopLevelAppComponent />)}</div>
      <script src="bundle.js"></script>
    </body>
  </html>`
}

export default generateHTML
```

The `generateHTML` function would be called when a request is made to the server. A simple example with Express might look as follows:

```javascript
import express from 'express'
import generateHTML from './server.js'

const app = express()

app.get('/', function (req, res) {
  res.send(generateHTML())
})
```

The `bundle.js` file referenced in the `server.js` file would be created by bundling the React application using a module bundler such as webpack. The entry point for creating the bundle would be a module similar to the following:

#### client.js

```javascript
import TopLevelAppComponent from './components/TopLevelAppComponent'
import {render} from 'react-dom'
import store1 from './stores/store1'
import store2 from './stores/store2'

new store1()
new store2()

// The ID here is the ID of the div in the HTML generated in server.js
render(<TopLevelAppComponent />, document.getElementById('app'))
```

When performing the initial render on the server it is unnecessary to prepare the initial state again on the client. Therefore the inventory store from above can be tweaked as follows to ensure that initial state preparation only runs on the server:

```javascript
'use strict'

import {Store} from 'whitelodge'
import isNode from 'detect-node'

let initialState = {}
if (isNode) initialState = {items: [{description:'Cherry pie', quantity: 11)}]}

export default class Inventory extends Store {
  constructor () {
    super('inventory', initialState, true, 20)
  }

  addItem (description, quantity) {
    // Emptied for brevity
  }

  sumAllItemsTotalQuantities () {
    // Emptied for brevity
  }  

}
```
