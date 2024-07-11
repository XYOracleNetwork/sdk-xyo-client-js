/* eslint-disable unicorn/no-useless-undefined */
import { Account } from '@xyo-network/account'
import { isModuleInstance } from '@xyo-network/module-model'

import { isNodeInstance, MemoryNode, NodeConfigSchema, NodeWrapper } from '../index.js'

/**
 * @group node
 * @group module
 */

describe('identity check (is)', () => {
  test('isModuleInstance', async () => {
    const node = await MemoryNode.create({ account: 'random', config: { schema: NodeConfigSchema } })
    expect(isModuleInstance(node)).toBeTrue()
    expect(isModuleInstance(null)).toBeFalse()
    expect(isModuleInstance(undefined)).toBeFalse()
    expect(isModuleInstance({})).toBeFalse()

    const wrapper = NodeWrapper.wrap(node, await Account.random())
    expect(isModuleInstance(wrapper)).toBeTrue()
  })
  test('isNodeInstance', async () => {
    const node = await MemoryNode.create({ account: 'random', config: { schema: NodeConfigSchema } })
    expect(isNodeInstance(node)).toBeTrue()
    expect(isNodeInstance(null)).toBeFalse()
    expect(isNodeInstance(undefined)).toBeFalse()
    expect(isNodeInstance({})).toBeFalse()

    const wrapper = NodeWrapper.wrap(node, await Account.random())
    expect(isNodeInstance(wrapper)).toBeTrue()
  })
})
