import '@xylabs/vitest-extended'

import { PayloadPluginResolver } from '@xyo-network/payload-plugin'
import {
  describe, expect, test,
} from 'vitest'

import { IdPayloadPlugin } from '../Plugin.ts'

describe('IdPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = IdPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
