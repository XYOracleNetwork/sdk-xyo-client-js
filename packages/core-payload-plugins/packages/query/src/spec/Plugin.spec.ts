import '@xylabs/vitest-extended'

import { PayloadPluginResolver } from '@xyo-network/payload-plugin'
import {
  describe, expect, test,
} from 'vitest'

import { QueryPayloadPlugin } from '../Plugin.ts'

describe('QueryPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = QueryPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
