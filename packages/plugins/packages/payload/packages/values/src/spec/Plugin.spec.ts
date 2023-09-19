import { PayloadPluginResolver } from '@xyo-network/payload-plugin'

import { ValuesPayloadPlugin } from '../Plugin'

describe('ValuesPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ValuesPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
