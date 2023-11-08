/* eslint-disable no-restricted-imports */
import * as Modules from '@xyo-network/modules'
import * as Plugins from '@xyo-network/plugins'
import * as Sdk from '@xyo-network/sdk'

describe('Loading Client SDKs', () => {
  test('Monolithic', () => {
    Object.entries(Modules).map(([key, value]) => `Modules[${key}]: ${typeof value}`)
    Object.entries(Plugins).map(([key, value]) => `Plugins[${key}]: ${typeof value}`)
    Object.entries(Sdk).map(([key, value]) => `Sdk[${key}]: ${typeof value}`)
  })
})
