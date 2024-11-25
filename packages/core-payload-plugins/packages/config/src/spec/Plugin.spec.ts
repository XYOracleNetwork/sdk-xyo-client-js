import '@xylabs/vitest-extended'

import { PayloadPluginResolver } from '@xyo-network/payload-plugin'
import {
  describe, expect, test,
} from 'vitest'

import { ConfigPayloadPlugin } from '../Plugin.ts'

describe('ConfigPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = ConfigPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
