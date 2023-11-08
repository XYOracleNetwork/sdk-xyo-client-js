/* eslint-disable no-restricted-imports */
import * as Modules from '@xyo-network/modules'
import * as Plugins from '@xyo-network/plugins'
import * as Sdk from '@xyo-network/sdk'

describe('Loading Client SDKs', () => {
  test('Monolithic', () => {
    Object.entries(Modules).forEach(([key, value]) => console.log(`Modules[${key}]: ${typeof value}`))
    Object.entries(Plugins).forEach(([key, value]) => console.log(`Plugins[${key}]: ${typeof value}`))
    Object.entries(Sdk).forEach(([key, value]) => console.log(`Sdk[${key}]: ${typeof value}`))
  })
})
