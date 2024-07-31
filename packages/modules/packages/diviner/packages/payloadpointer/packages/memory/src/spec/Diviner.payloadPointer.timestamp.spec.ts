import { assertEx } from '@xylabs/assert'
import { Account, AccountInstance } from '@xyo-network/account'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { NodeInstance } from '@xyo-network/node-model'
import { Payload } from '@xyo-network/payload-model'

import { PayloadPointerDiviner } from '../Diviner.js'
import {
  createPointer,
  getArchivist,
  getNewBoundWitness,
  getPayloadPointerDiviner,
  getTestNode,
  insertBlock,
  insertPayload,
} from './testUtil/index.js'

describe('PayloadPointerDiviner', () => {
  describe('with rules for [timestamp]', () => {
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
      const [bwB, payloadsB] = await getNewBoundWitness([account])
      const [bwC, payloadsC] = await getNewBoundWitness([account])
      payloads = [...payloadsA, ...payloadsB, ...payloadsC]
      const boundWitnesses = [bwA, bwB, bwC]
      expectedSchema = payloadsA[0].schema
      for (const bw of boundWitnesses) {
        const blockResponse = await insertBlock(archivist, bw)
        expect(blockResponse.length).toBe(1)
      }
      const payloadResponse = await insertPayload(archivist, payloads)
      expect(payloadResponse.length).toBe(payloads.length)
    })
    it('ascending', async () => {
      const expected = assertEx(payloads.at(0))
      const pointer = await createPointer([[account.address]], [[expectedSchema]], 0, 'asc')
      const result = await sut.divine([pointer])
      expect(result).toEqual([expected])
    })
    it('descending', async () => {
      const expected = assertEx(payloads.at(-1))
      const pointer = await createPointer([[account.address]], [[expectedSchema]], Date.now(), 'desc')
      const result = await sut.divine([pointer])
      expect(result).toEqual([expected])
    })
    it('no matching timestamp', async () => {
      const pointer = await createPointer([[account.address]], [[expectedSchema]], Date.now(), 'asc')
      const result = await sut.divine([pointer])
      expect(result).toEqual([])
    })
  })
})
