/**
 * @jest-environment jsdom
 */

import { XyoAccount } from '@xyo-network/account'
import { XyoPayloadPluginResolver } from '@xyo-network/payload-plugin'

import { XyoLocationPayloadPlugin } from './Plugin'
import { XyoLocationPayloadSchema } from './Schema'

describe('XyoLocationPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const resolver = new XyoPayloadPluginResolver().register(XyoLocationPayloadPlugin(), {
      witness: { account: new XyoAccount(), geolocation: navigator.geolocation },
    })
    expect(resolver.resolve({ schema: XyoLocationPayloadSchema })).toBeObject()
    expect(resolver.witness(XyoLocationPayloadSchema)).toBeObject()
  })
})
