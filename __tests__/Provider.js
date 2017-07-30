/* eslint-disable no-undef */

import React from 'react'
import {shallow} from 'enzyme'

test('Renders a div', () => {
  const div = shallow(
    <div>whitelodge</div>
  )
  expect(div.text()).toEqual('whitelodge')
})
