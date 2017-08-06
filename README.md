# whitelodge
---
[![npm version](https://badge.fury.io/js/whitelodge.svg)](https://badge.fury.io/js/whitelodge) [![Build Status](https://travis-ci.org/liegeandlief/whitelodge.svg?branch=master)](https://travis-ci.org/liegeandlief/whitelodge) [![Known Vulnerabilities](https://snyk.io/test/github/liegeandlief/whitelodge/badge.svg)](https://snyk.io/test/github/liegeandlief/whitelodge)

## Things to do prior to 1.0.0 release

 - Add a CHANGELOG.md detailing features added in initial release 1.0.0
 - Add GitHub description and labels
 - Add email address and description in package.json
 - Write this README.md file
 - Direct questions to GitHub issues
 - Things to do in future - make it work for more than just React apps, immutable store state, server rendering
 - Review code

## Things to put in this file

 - What whitelodge is - simply allows for stores of state available to all React components, it allows mutation of that state by calling methods on the stores and it allows components to subscribe to changes on particular stores to trigger a re-render
 - Why I made it
 - How to install it including peer dependencies required
 - How to use it - what is a store and how to use them including initial state, console logging of state, number of previous states to keep, making stores available for subscription throughout a React app, subscribing components to stores, reading store state in a component, mutating store state from a component
 - Allows normal use of React lifecycle methods - how to compare previous store stage and current store state
 - Make clear reserved property and method names on stores
