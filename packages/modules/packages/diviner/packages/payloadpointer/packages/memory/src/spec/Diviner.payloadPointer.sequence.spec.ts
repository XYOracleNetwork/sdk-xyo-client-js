import '@xylabs/vitest-extended'

import { assertEx, delay } from '@xylabs/sdk-js'
import { Account } from '@xyo-network/account'
import type { AccountInstance } from '@xyo-network/account-model'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { NodeInstance } from '@xyo-network/node-model'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { SequenceConstants } from '@xyo-network/payload-model'
import {
  beforeAll,
  describe, expect, it,
} from 'vitest'

import type { PayloadPointerDiviner } from '../Diviner.ts'
import {
  createPointer,
  getArchivist,
  getNewBoundWitness,
  getPayloadPointerDiviner,
  getTestNode,
  insertBlock,
  insertPayload,
} from './testUtil/index.ts'

describe('PayloadPointerDiviner', () => {
  describe('with rules for [sequence]', () => {
    let account: AccountInstance
    let payloads: Payload[]
    let expectedSchema: string
    let node: NodeInstance
    let archivist: ArchivistInstance
    let sut: PayloadPointerDiviner
    beforeAll(async () => {
      node = await getTestNode()
      archivist = await getArchivist(node)
      sut = await getPayloadPointerDiviner(node)
      account = await Account.random()
      const [bwA, payloadsA] = await getNewBoundWitness([account])
      await delay(2)
      const [bwB, payloadsB] = await getNewBoundWitness([account])
      await delay(2)
      const [bwC, payloadsC] = await getNewBoundWitness([account])
      await delay(2)
      payloads = [...payloadsA, ...payloadsB, ...payloadsC]
      const boundWitnesses = [bwA, bwB, bwC]
      expectedSchema = payloadsA[0].schema
      for (const bw of boundWitnesses) {
        await delay(2)
        const blockResponse = await insertBlock(archivist, bw)
        expect(blockResponse.length).toBe(1)
      }
      for (const payload of payloads) {
        await delay(2)
        const payloadResponse = await insertPayload(archivist, payload)
        expect(payloadResponse.length).toBe(1)
      }
    })
    it('ascending', async () => {
      const expected = assertEx(payloads.at(0))
      const pointer = createPointer([[account.address]], [[expectedSchema]], 'asc')
      const result = await sut.divine([pointer])
      expect(PayloadBuilder.omitStorageMeta(result)).toEqual([expected])
    })
    it('descending', async () => {
      const expected = assertEx(payloads.at(-1))
      const pointer = createPointer([[account.address]], [[expectedSchema]], 'desc')
      const result = await sut.divine([pointer])
      expect(PayloadBuilder.omitStorageMeta(result)).toEqual([expected])
    })
    it('no matching sequence', async () => {
      const pointer = createPointer([[account.address]], [[expectedSchema]], 'asc', SequenceConstants.maxLocalSequence)
      const result = await sut.divine([pointer])
      expect(result).toEqual([])
    })
  })
})
