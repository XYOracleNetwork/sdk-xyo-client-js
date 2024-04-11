import { Account } from '@xyo-network/account'
import { asDivinerInstance } from '@xyo-network/diviner-model'
import { CompositeModuleResolver, NameRegistrarTransformer } from '@xyo-network/module-resolver'
import { MemoryNode } from '@xyo-network/node-memory'
import { asAttachableNodeInstance } from '@xyo-network/node-model'

import { HttpBridge } from '../HttpBridge'
import { HttpBridgeConfigSchema } from '../HttpBridgeConfig'

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge - Xns', () => {
  it('HttpBridge-Xns: Simple Resolve', async () => {
    const memNode = await MemoryNode.create({ account: Account.randomSync() })

    const bridge = await HttpBridge.create({
      account: Account.randomSync(),
      config: { name: 'TestBridge', nodeUrl: 'https://beta.xns.xyo.network', schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
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
      CompositeModuleResolver.transformers = [transformer]
      const address = await transformer.transform('nippyflight.xyo')
      expect(address).toBe('c5fa710300a8a43568678d0fe72810e34d880357')
    }
  })
})