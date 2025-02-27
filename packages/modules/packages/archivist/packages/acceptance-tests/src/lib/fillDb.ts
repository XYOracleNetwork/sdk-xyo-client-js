import { filterAs } from '@xylabs/array'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import {
  asOptionalId, Id, IdPayload, IdSchema,
} from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { WithStorageMeta } from '@xyo-network/payload-model'
import { v4 as uuid } from 'uuid'
import { expect } from 'vitest'

export const fillDb = async (sut: ArchivistInstance, count = 10): Promise<WithStorageMeta<IdPayload>[]> => {
  const payloads = Array.from(
    { length: count },
    () => new PayloadBuilder<Id>({ schema: IdSchema })
      .fields({ salt: `${uuid()}` })
      .build(),
  )
  const response = await sut.insert(payloads)
  expect(response).toBeDefined()
  expect(response.length).toBe(count)
  return filterAs(response, asOptionalId) as WithStorageMeta<IdPayload>[]
}
