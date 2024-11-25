import '@xylabs/vitest-extended'

import { PayloadPluginResolver } from '@xyo-network/payload-plugin'
import {
  describe, expect, test,
} from 'vitest'

import { SchemaPayloadPlugin } from '../Plugin.ts'

describe('SchemaPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = SchemaPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
