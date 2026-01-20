import { filterAs } from '@xylabs/sdk-js'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import type { Id } from '@xyo-network/id-payload-plugin'
import { asOptionalId } from '@xyo-network/id-payload-plugin'
import type { WithStorageMeta } from '@xyo-network/payload-model'
import {
  beforeEach, describe, expect, it,
} from 'vitest'

import { fillDb } from '../../lib/index.ts'

export const generateArchivistNextTests = (
  moduleFactory: () => Promise<ArchivistInstance>,
  title: string = 'next',
) => {
  describe(title, () => {
    let sut: ArchivistInstance
    let payloads: WithStorageMeta<Id>[]
    beforeEach(async () => {
      sut = await moduleFactory()
      payloads = await fillDb(sut, 10)
    })
    describe('open', () => {
      describe('with open true', () => {
        const open = true
        it.each(['asc', 'desc'] as const)('returns payloads without cursor [order: %s]', async (order) => {
          const bound = order === 'asc' ? payloads.at(0) : payloads.at(-1)
          expect(bound).toBeDefined()
          const expected = order === 'asc' ? payloads.at(1) : payloads.at(-2)
          expect(expected).toBeDefined()
          const cursor = bound?._sequence
          expect(cursor).toBeDefined()
          const response = await sut.next({
            open, order, limit: 1, cursor,
          })
          expect(response).toBeDefined()
          expect(response.length).toBe(1)
          const ids = filterAs(response, asOptionalId)
          expect(ids).toBeDefined()
          expect(ids.length).toBe(1)
          const id = ids.at(0)
          expect(id).toBeDefined()
          expect(id?.salt).toBeDefined()
          expect(id?.salt).toBe(expected?.salt)
        })
      })
      describe('with open false', () => {
        const open = false
        it.each(['asc', 'desc'] as const)('returns payloads without cursor [order: %s]', async (order) => {
          const bound = order === 'asc' ? payloads.at(0) : payloads.at(-1)
          expect(bound).toBeDefined()
          const expected = bound
          expect(expected).toBeDefined()
          const cursor = bound?._sequence
          expect(cursor).toBeDefined()
          const response = await sut.next({
            open, order, limit: 1, cursor,
          })
          expect(response).toBeDefined()
          expect(response.length).toBe(1)
          const ids = filterAs(response, asOptionalId)
          expect(ids).toBeDefined()
          expect(ids.length).toBe(1)
          const id = ids.at(0)
          expect(id).toBeDefined()
          expect(id?.salt).toBeDefined()
          expect(id?.salt).toBe(expected?.salt)
        })
      })
      describe('with open undefined', () => {
        const open = undefined
        it.each(['asc', 'desc'] as const)('returns payloads without cursor [order: %s]', async (order) => {
          const bound = order === 'asc' ? payloads.at(0) : payloads.at(-1)
          expect(bound).toBeDefined()
          const expected = order === 'asc' ? payloads.at(1) : payloads.at(-2)
          expect(expected).toBeDefined()
          const cursor = bound?._sequence
          expect(cursor).toBeDefined()
          const response = await sut.next({
            open, order, limit: 1, cursor,
          })
          expect(response).toBeDefined()
          expect(response.length).toBe(1)
          const ids = filterAs(response, asOptionalId)
          expect(ids).toBeDefined()
          expect(ids.length).toBe(1)
          const id = ids.at(0)
          expect(id).toBeDefined()
          expect(id?.salt).toBeDefined()
          expect(id?.salt).toBe(expected?.salt)
        })
      })
    })
  })
}
