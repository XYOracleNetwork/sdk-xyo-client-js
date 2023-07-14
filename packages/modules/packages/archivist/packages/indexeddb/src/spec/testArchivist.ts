/**
 * @jest-environment jsdom
 */

import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadHasher, uuid } from '@xyo-network/core'
import { IdPayload, IdSchema } from '@xyo-network/id-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'

const insertPayloads = async (archivist: Promisable<ArchivistInstance>, count: number) => {
  const archivistModule = await archivist
  const payloads = Array(count)
    .fill(0)
    .map<IdPayload>(() => {
      return { salt: uuid(), schema: IdSchema }
    })
  await archivistModule.insert(payloads)
  return payloads
}

export const testArchivistRoundTrip = (archivist: Promisable<ArchivistInstance>, name: string) => {
  test(`Archivist RoundTrip [${name}]`, async () => {
    const idPayload: Payload<{ salt: string }> = {
      salt: Date.now().toString(),
      schema: IdSchema,
    }
    const payloadWrapper = PayloadWrapper.wrap(idPayload)
    const archivistModule = await archivist
    const insertResult = await archivistModule.insert([idPayload])
    const insertResultWrappers = insertResult.map((bw) => BoundWitnessWrapper.wrap(bw))
    const insertResultPayload = insertResultWrappers.pop() as BoundWitnessWrapper
    expect(insertResultPayload).toBeDefined()

    expect(PayloadHasher.find(insertResultPayload.payloadHashes, await payloadWrapper.hashAsync())).toBeDefined()
    const getResult = await archivistModule.get([await payloadWrapper.hashAsync()])
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(1)
    const gottenPayload = getResult[0]
    if (gottenPayload) {
      const gottenPayloadWrapper = PayloadWrapper.wrap(gottenPayload)
      expect(await gottenPayloadWrapper.hashAsync()).toBe(await payloadWrapper.hashAsync())
    }
  })
}

export const testArchivistAll = (archivist: Promisable<ArchivistInstance>, name: string) => {
  beforeAll(async () => {
    const archivistModule = await archivist
    await archivistModule.clear?.()
  })
  test(`Archivist All [${name}]`, async () => {
    const archivistModule = await archivist
    const count = 10
    const payloads = await insertPayloads(archivistModule, count)
    await archivistModule.insert(payloads)
    const getResult = await archivistModule.all?.()
    expect(getResult).toBeDefined()
    expect(getResult?.length).toBe(count)
  })
}

export const testArchivistClear = (archivist: Promisable<ArchivistInstance>, name: string) => {
  const count = 10
  test(`Archivist Clear [${name}]`, async () => {
    const archivistModule = await archivist
    await insertPayloads(archivistModule, count)
    const allResultBeforeClear = await archivistModule.all?.()
    expect(allResultBeforeClear).toBeArrayOfSize(count)
    await archivistModule.clear?.()
    const allResultAfterClear = await archivistModule.all?.()
    expect(allResultAfterClear).toBeArrayOfSize(0)
  })
}

export const testArchivistDelete = (archivist: Promisable<ArchivistInstance>, name: string) => {
  test(`Archivist Delete [${name}]`, async () => {
    const archivistModule = await archivist
    const payload: IdPayload = { salt: uuid(), schema: IdSchema }
    const hash = await PayloadWrapper.wrap(payload).hashAsync()
    await archivistModule.insert([payload])
    const resultBeforeDelete = await archivistModule.get?.([hash])
    expect(resultBeforeDelete).toBeArrayOfSize(1)
    await archivistModule.delete?.([hash])
    const resultAfterDelete = await archivistModule.get?.([hash])
    expect(resultAfterDelete).toBeArrayOfSize(0)
  })
}
