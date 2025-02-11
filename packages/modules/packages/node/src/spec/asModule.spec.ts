/* eslint-disable unicorn/no-useless-undefined */
import '@xylabs/vitest-extended'

import { Account } from '@xyo-network/account'
import { asModuleInstance } from '@xyo-network/module-model'
import {
  describe, expect, test,
} from 'vitest'

// eslint-disable-next-line no-restricted-imports
import {
  asNodeInstance, MemoryNode, NodeConfigSchema, NodeWrapper,
} from '../index.ts'

/**
 * @group node
 * @group module
 */

describe('identity check (as)', () => {
  test('asModuleInstance', async () => {
    const node = await MemoryNode.create({ account: 'random', config: { schema: NodeConfigSchema } })
    expect(asModuleInstance(node)).toBeDefined()
    expect(asModuleInstance(null)).toBeUndefined()
    expect(asModuleInstance(undefined)).toBeUndefined()
    expect(asModuleInstance({})).toBeUndefined()

    const wrapper = NodeWrapper.wrap(node, await Account.random())
    expect(asModuleInstance(wrapper)).toBeDefined()
  })
  test('isNodeInstance', async () => {
    const node = await MemoryNode.create({ account: 'random', config: { schema: NodeConfigSchema } })
    expect(asNodeInstance(node)).toBeDefined()
    expect(asNodeInstance(null)).toBeUndefined()
    expect(asNodeInstance(undefined)).toBeUndefined()
    expect(asNodeInstance({})).toBeUndefined()

    const wrapper = NodeWrapper.wrap(node, await Account.random())
    expect(asNodeInstance(wrapper)).toBeDefined()
  })
})
