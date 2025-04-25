import '@xylabs/vitest-extended'

import { asDivinerInstance } from '@xyo-network/diviner-model'
import { ResolveHelper } from '@xyo-network/module-model'
import { NameRegistrarTransformer } from '@xyo-network/module-resolver'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance } from '@xyo-network/node-model'
import {
  describe, expect, it,
} from 'vitest'

import { HttpBridgeExpress, HttpBridgeExpressConfigSchema } from '../HttpBridge.ts'

/**
 * @group module
 * @group bridge
 */

describe('HttpBridgeExpress - Xns', () => {
  it('HttpBridgeExpress-Xns: Simple Resolve', async () => {
    const memNode = await MemoryNode.create({ account: 'random' })

    const bridge = await HttpBridgeExpress.create({
      account: 'random',
      config: {
        discoverRoots: 'start',
        name: 'TestBridge',
        nodeUrl: 'https://beta.xns.xyo.network',
        schema: HttpBridgeExpressConfigSchema,
        security: { allowAnonymous: true },
      },
    })

    await bridge?.start?.()
    await memNode.register(bridge)
    await memNode.attach(bridge?.address, true)
    const resolvedBridge = await memNode.resolve(bridge.id)
    expect(resolvedBridge).toBeDefined()

    const rootModule = await bridge?.resolve('XNS')
    expect(rootModule).toBeDefined()

    const remoteNode = asAttachableNodeInstance(rootModule, () => `Failed to resolve correct object type [XYO] [${rootModule?.constructor.name}]`)

    const registrarDiviner = asDivinerInstance(await remoteNode.resolve('XNS:AddressRecords:AddressRecordIndexDiviner'))
    expect(registrarDiviner).toBeDefined()
    if (registrarDiviner) {
      const transformer = new NameRegistrarTransformer(registrarDiviner, 'xyo')
      ResolveHelper.transformers = [transformer]
      const address = await transformer.transform('nippyflight.xyo')
      expect(address).toBe('c5fa710300a8a43568678d0fe72810e34d880357')
    }
  })
})
