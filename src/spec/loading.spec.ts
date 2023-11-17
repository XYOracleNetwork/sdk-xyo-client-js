/* eslint-disable no-restricted-imports */
import * as Modules from '@xyo-network/modules'
import * as Sdk from '@xyo-network/sdk'

describe('Loading Client SDKs', () => {
  test('Monolithic', () => {
    Object.entries(Modules).map(([key, value]) => `Modules[${key}]: ${typeof value}`)
    Object.entries(Sdk).map(([key, value]) => `Sdk[${key}]: ${typeof value}`)
  })
})
