// eslint-disable-next-line no-restricted-imports
import * as Modules from '@xyo-network/modules'
import * as SdkUtils from '@xyo-network/sdk-utils'

describe('Loading Client SDKs', () => {
  test('Monolithic', () => {
    for (const [key, value] of Object.entries(Modules)) `Modules[${key}]: ${typeof value}`
    for (const [key, value] of Object.entries(SdkUtils)) `Sdk[${key}]: ${typeof value}`
  })
})
