import '@xylabs/vitest-extended'

import { PayloadPluginResolver } from '@xyo-network/payload-plugin'
import {
  describe, expect, test,
} from 'vitest'

import { AddressPayloadPlugin } from '../Plugin.ts'

describe('AddressPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = AddressPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
