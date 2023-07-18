/**
 * @jest-environment jsdom
 */

import { delay } from '@xylabs/delay'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadHasher } from '@xyo-network/core'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'

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
  test(`Archivist All [${name}]`, async () => {
    const idPayload = {
      salt: Date.now().toString(),
      schema: IdSchema,
    }
    const archivistModule = await archivist
    for (let x = 0; x < 10; x++) {
      await archivistModule.insert([idPayload])
      await delay(10)
    }
    const getResult = await archivistModule.all?.()
    expect(getResult).toBeDefined()
    expect(getResult?.length).toBe(2)
  })
}
