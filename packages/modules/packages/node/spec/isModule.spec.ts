import { HDWallet } from '@xyo-network/account'
import { isModuleInstance } from '@xyo-network/module'

import { isNodeInstance, MemoryNode, NodeConfigSchema, NodeWrapper } from '../src'

describe('identity check (is)', () => {
  test('isModuleInstance', async () => {
    const node = await MemoryNode.create({ account: await HDWallet.random(), config: { schema: NodeConfigSchema } })
    expect(isModuleInstance(node)).toBeTrue()
    expect(isModuleInstance(null)).toBeFalse()
    expect(isModuleInstance(undefined)).toBeFalse()
    expect(isModuleInstance({})).toBeFalse()

    const wrapper = NodeWrapper.wrap(node, await HDWallet.random())
    expect(isModuleInstance(wrapper)).toBeTrue()
  })
  test('isNodeInstance', async () => {
    const node = await MemoryNode.create({ account: await HDWallet.random(), config: { schema: NodeConfigSchema } })
    expect(isNodeInstance(node)).toBeTrue()
    expect(isNodeInstance(null)).toBeFalse()
    expect(isNodeInstance(undefined)).toBeFalse()
    expect(isNodeInstance({})).toBeFalse()

    const wrapper = NodeWrapper.wrap(node, await HDWallet.random())
    expect(isNodeInstance(wrapper)).toBeTrue()
  })
})
