import '@xylabs/vitest-extended'

import * as Modules from '@xyo-network/modules'
import * as SdkUtils from '@xyo-network/sdk-utils'
import { describe, test } from 'vitest'

describe('Loading Client SDKs', () => {
  test('Monolithic', () => {
    for (const [key, value] of Object.entries(Modules)) console.log(`Modules[${key}]: ${typeof value}`)
    for (const [key, value] of Object.entries(SdkUtils)) console.log(`Sdk[${key}]: ${typeof value}`)
  })
})
