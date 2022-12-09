import { XyoBowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { PayloadSetPluginResolver } from '@xyo-network/payloadset-plugin'

import { XyoBowserSystemInfoPlugin } from './Plugin'

describe('XyoBowserSystemInfoPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = XyoBowserSystemInfoPlugin()
    const resolver = new PayloadSetPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.set)).toBeObject()
    expect(resolver.witness(XyoBowserSystemInfoSchema)).toBeObject()
  })
})
