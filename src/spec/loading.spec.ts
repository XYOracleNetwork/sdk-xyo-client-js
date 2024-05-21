/* eslint-disable no-restricted-imports */
import * as Modules from '@xyo-network/modules'
import * as SdkUtils from '@xyo-network/sdk-utils'

describe('Loading Client SDKs', () => {
  test('Monolithic', () => {
    Object.entries(Modules).map(([key, value]) => `Modules[${key}]: ${typeof value}`)
    Object.entries(SdkUtils).map(([key, value]) => `Sdk[${key}]: ${typeof value}`)
  })
})
