import '@xylabs/vitest-extended'

import { PayloadPluginResolver } from '@xyo-network/payload-plugin'
import {
  describe, expect,
  test,
} from 'vitest'

import { DomainPayloadPlugin } from '../Plugin.ts'

describe('DomainPayloadPlugin', () => {
  test('Add to Resolver', () => {
    const plugin = DomainPayloadPlugin()
    const resolver = new PayloadPluginResolver().register(plugin)
    expect(resolver.resolve(plugin.schema)).toBeObject()
  })
})
