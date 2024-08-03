import { MemoryNode } from '@xyo-network/node-memory'

import { HttpBridgeConfigSchema } from '../HttpBridgeConfig.ts'
import { HttpBridge } from '../HttpBridgeFull.ts'

/**
 * @group module
 * @group bridge
 */

describe('HttpBridge', () => {
  const baseUrl = 'https://sfjhskjdsfhdsk.com'

  console.log(`HttpBridge:baseUrl ${baseUrl}`)
  const cases = [
    ['/', `${baseUrl}`],
    /* ['/node', `${baseUrl}/node`], */
  ]

  it.each(cases)('HttpBridge: %s', async (_, nodeUrl) => {
    const memNode = await MemoryNode.create({ account: 'random' })

    const bridge = await HttpBridge.create({
      account: 'random',
      config: { nodeUrl, schema: HttpBridgeConfigSchema, security: { allowAnonymous: true } },
    })

    await bridge?.start?.()

    await memNode.register(bridge)
    await memNode.attach(bridge.address, true)

    const modules = await memNode.resolve('*')
    expect(modules.length).toBe(2)
  })
})
