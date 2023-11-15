import { Account } from '@xyo-network/account'
import { asModuleInstance } from '@xyo-network/module-model'

import { asNodeInstance, MemoryNode, NodeConfigSchema, NodeWrapper } from '../src'

/**
 * @group node
 * @group module
 */

describe('identity check (as)', () => {
  test('asModuleInstance', async () => {
    const node = await MemoryNode.create({ account: Account.randomSync(), config: { schema: NodeConfigSchema } })
    expect(asModuleInstance(node)).toBeDefined()
    expect(asModuleInstance(null)).toBeUndefined()
    expect(asModuleInstance(undefined)).toBeUndefined()
    expect(asModuleInstance({})).toBeUndefined()

    const wrapper = NodeWrapper.wrap(node, Account.randomSync())
    expect(asModuleInstance(wrapper)).toBeDefined()
  })
  test('isNodeInstance', async () => {
    const node = await MemoryNode.create({ account: Account.randomSync(), config: { schema: NodeConfigSchema } })
    expect(asNodeInstance(node)).toBeDefined()
    expect(asNodeInstance(null)).toBeUndefined()
    expect(asNodeInstance(undefined)).toBeUndefined()
    expect(asNodeInstance({})).toBeUndefined()

    const wrapper = NodeWrapper.wrap(node, Account.randomSync())
    expect(asNodeInstance(wrapper)).toBeDefined()
  })
})
