import '@xylabs/vitest-extended'

import { Account } from '@xyo-network/account'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { NodeInstance } from '@xyo-network/node-model'
import type { Payload } from '@xyo-network/payload-model'
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
  describe('with rules for [address]', () => {
    const accountA = Account.random()
    const accountB = Account.random()
    const accountC = Account.random()
    const accountD = Account.random()
    const payloads: Payload[] = []
    let node: NodeInstance
    let archivist: ArchivistInstance
    let sut: PayloadPointerDiviner
    beforeAll(async () => {
      node = await getTestNode()
      archivist = await getArchivist(node)
      sut = await getPayloadPointerDiviner(node)
      const [bwA, payloadsA] = await getNewBoundWitness([await accountA])
      const [bwB, payloadsB] = await getNewBoundWitness([await accountB])
      const [bwC, payloadsC] = await getNewBoundWitness([await accountC])
      const [bwD, payloadsD] = await getNewBoundWitness([await accountD])
      const [bwE, payloadsE] = await getNewBoundWitness([await accountC, await accountD])
      const [bwF, payloadsF] = await getNewBoundWitness([await accountC])
      const [bwG, payloadsG] = await getNewBoundWitness([await accountD])
      payloads.push(...payloadsA, ...payloadsB, ...payloadsC, ...payloadsD, ...payloadsE, ...payloadsF, ...payloadsG)
      const boundWitnesses = [bwA, bwB, bwC, bwD, bwE, bwF, bwG]
      const blockResponse = await insertBlock(archivist, boundWitnesses)
      expect(blockResponse.length).toBe(boundWitnesses.length)
      const payloadResponse = await insertPayload(archivist, payloads)
      expect(payloadResponse.length).toBe(payloads.length)
    })
    describe('single address', () => {
      it.each([
        [accountA, () => payloads[0]],
        [accountB, () => payloads[1]],
      ])('returns Payload signed by address', async (account, getData) => {
        const expected = getData()
        const pointer = await createPointer([[(await account).address]], [[expected.schema]])
        const result = await sut.divine([pointer])
        expect(result).toEqual([expected])
      })
    })
    describe('multiple address rules', () => {
      describe('combined serially', () => {
        it('returns Payload signed by both addresses', async () => {
          const expected = payloads[4]
          const pointer = await createPointer([[(await accountC).address], [(await accountD).address]], [[expected.schema]])
          const result = await sut.divine([pointer])
          expect(result).toEqual([expected])
        })
      })
      describe('combined in parallel', () => {
        it('returns Payload signed by both address', async () => {
          const expected = payloads[4]
          const pointer = await createPointer([[(await accountC).address, (await accountD).address]], [[expected.schema]])
          const result = await sut.divine([pointer])
          expect(result).toEqual([expected])
        })
      })
    })
    it('no matching address', async () => {
      const pointer = await createPointer([[(await Account.random()).address]], [[payloads[0].schema]])
      const result = await sut.divine([pointer])
      expect(result).toEqual([])
    })
  })
})
