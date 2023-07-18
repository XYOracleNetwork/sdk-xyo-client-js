import { HDWallet } from '@xyo-network/account'
import { asModuleInstance } from '@xyo-network/module'

import { asNodeInstance, MemoryNode, NodeConfigSchema } from '../src'

describe('identity check (as)', () => {
  test('asModuleInstance', async () => {
    const node = await MemoryNode.create({ account: await HDWallet.random(), config: { schema: NodeConfigSchema } })
    expect(asModuleInstance(node)).toBeDefined()
    expect(asModuleInstance(null)).toBeUndefined()
    expect(asModuleInstance(undefined)).toBeUndefined()
    expect(asModuleInstance({})).toBeUndefined()
  })
  test('isNodeInstance', async () => {
    const node = await MemoryNode.create({ account: await HDWallet.random(), config: { schema: NodeConfigSchema } })
    expect(asNodeInstance(node)).toBeDefined()
    expect(asNodeInstance(null)).toBeUndefined()
    expect(asNodeInstance(undefined)).toBeUndefined()
    expect(asNodeInstance({})).toBeUndefined()
  })
})
