import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoBowserSystemInfoPlugin } from './Plugin'
import { XyoBowserSystemInfoSchema } from './Schema'

describe('XyoBowserSystemInfoPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoBowserSystemInfoPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve({ schema: XyoBowserSystemInfoSchema })).toBeObject()
    expect(resolver.witness(XyoBowserSystemInfoSchema)).toBeObject()
  })
})
