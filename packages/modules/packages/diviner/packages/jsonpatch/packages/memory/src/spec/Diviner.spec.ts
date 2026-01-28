import '@xylabs/vitest-extended'

import type { JsonPatchDivinerConfig } from '@xyo-network/diviner-jsonpatch-model'
import { JsonPatchDivinerConfigSchema } from '@xyo-network/diviner-jsonpatch-model'
import { type AnyPayload, asSchema } from '@xyo-network/payload-model'
import { HDWallet } from '@xyo-network/wallet'
import type { WalletInstance } from '@xyo-network/wallet-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import { JsonPatchDiviner } from '../Diviner.ts'

const cases: [string, JsonPatchDivinerConfig, AnyPayload[], AnyPayload[]][] = [
  [
    'Adds a value',
    {
      operations: [{
        op: 'add', path: '/value', value: 'foo',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true) }],
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
  ],
  [
    'Removes a value',
    {
      operations: [{ op: 'remove', path: '/value' }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
    [{ schema: asSchema('network.xyo.test', true) }],
  ],
  [
    'Replaces a schema',
    {
      operations: [{
        op: 'replace', path: '/schema', value: 'network.xyo.debug',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true) }],
    [{ schema: asSchema('network.xyo.debug', true) }],
  ],
  [
    'Replaces a value',
    {
      operations: [{
        op: 'replace', path: '/value', value: 'bar',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
    [{ schema: asSchema('network.xyo.test', true), value: 'bar' }],
  ],
  [
    'Moves a value',
    {
      operations: [{
        from: '/value', op: 'move', path: '/target',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
    [{ schema: asSchema('network.xyo.test', true), target: 'foo' }],
  ],
  [
    'Copies a value',
    {
      operations: [{
        from: '/value', op: 'copy', path: '/target',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
    [{
      schema: asSchema('network.xyo.test', true), target: 'foo', value: 'foo',
    }],
  ],
  [
    'Filters by schema',
    {
      operations: [{
        op: 'test', path: '/schema', value: 'network.xyo.test',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [
      { schema: asSchema('network.xyo.test', true), value: 'foo' },
      { schema: asSchema('network.xyo.debug', true), value: 'bar' },
    ],
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
  ],
  [
    'Filters by value',
    {
      operations: [{
        op: 'test', path: '/value', value: 'foo',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [
      { schema: asSchema('network.xyo.test', true), value: 'foo' },
      { schema: asSchema('network.xyo.test', true), value: 'bar' },
    ],
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
  ],
  [
    'Handles multiple operations',
    {
      operations: [
        {
          op: 'test', path: '/schema', value: 'network.xyo.test',
        },
        {
          op: 'add', path: '/value', value: 'foo',
        },
        {
          from: '/value', op: 'copy', path: '/target',
        },
        {
          op: 'replace', path: '/target', value: 'bar',
        },
      ],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true) }, { schema: asSchema('network.xyo.debug', true) }],
    [{
      schema: asSchema('network.xyo.test', true), target: 'bar', value: 'foo',
    }],
  ],
  [
    'Filters multiple by schema',
    {
      operations: [{
        op: 'test', path: '/schema', value: 'network.xyo.test',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [
      { schema: asSchema('network.xyo.test', true), value: 'foo' },
      { schema: asSchema('network.xyo.test', true), value: 'bar' },
    ],
    [
      { schema: asSchema('network.xyo.test', true), value: 'foo' },
      { schema: asSchema('network.xyo.test', true), value: 'bar' },
    ],
  ],
  [
    'Filters if property defined',
    {
      operations: [{
        op: 'test', path: '/value', value: 'foo',
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
    [{ schema: asSchema('network.xyo.test', true), value: 'foo' }],
  ],
  [
    'Filters if property null',
    {
      operations: [{
        op: 'test', path: '/value', value: null,
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: asSchema('network.xyo.test', true), value: null }],
    [{ schema: asSchema('network.xyo.test', true), value: null }],
  ],
  /* [
    'Filters if property not null',
    {
      operations: [{
        not: true, op: 'test', path: '/value', value: null,
      }],
      schema: JsonPatchDivinerConfigSchema,
    },
    [{ schema: 'network.xyo.test', value: 'foo' }],
    [{ schema: 'network.xyo.test', value: 'foo' }],
  ], */
]

/**
 * @group module
 * @group diviner
 */

describe('JsonPatchDiviner', () => {
  let wallet: WalletInstance
  beforeAll(async () => {
    wallet = await HDWallet.random()
  })
  describe('divine', () => {
    it.each(cases)('%s', async (_title, config, input, expected) => {
      const sut = await JsonPatchDiviner.create({ account: wallet, config })
      const result = await sut.divine(input)
      expect(result).toBeArrayOfSize(expected.length)
      expect(result).toMatchObject(expected)
    })
  })
})
