/**
 * @jest-environment jsdom
 */

import { delay } from '@xylabs/delay'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'

import { XyoArchivist } from '../XyoArchivist'
import { XyoArchivistWrapper } from '../XyoArchivistWrapper'

export const testArchivistRoundTrip = (archivist: Promisable<XyoArchivist>, name: string) => {
  test(`XyoArchivist RoundTrip [${name}]`, async () => {
    const idPayload: XyoPayload<{ salt: string }> = {
      salt: Date.now().toString(),
      schema: 'network.xyo.id',
    }
    const payloadWrapper = new PayloadWrapper(idPayload)

    const archivistWrapper = new XyoArchivistWrapper(await archivist)
    const insertResult = await archivistWrapper.insert([idPayload])
    const insertResultWrappers = insertResult.map((bw) => new BoundWitnessWrapper(bw))
    const insertResultPayload = insertResultWrappers.pop() as BoundWitnessWrapper
    expect(insertResultPayload).toBeDefined()

    expect(insertResultPayload.payloadHashes.find((hash) => hash === payloadWrapper.hash)).toBeDefined()
    const getResult = await archivistWrapper.get([payloadWrapper.hash])
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(1)
    const gottenPayload = getResult[0]
    if (gottenPayload) {
      const gottenPayloadWrapper = new PayloadWrapper(gottenPayload)
      expect(gottenPayloadWrapper.hash).toBe(payloadWrapper.hash)
    }
  })
}

export const testArchivistAll = (archivist: Promisable<XyoArchivist>, name: string) => {
  test(`XyoArchivist All [${name}]`, async () => {
    const idPayload = {
      salt: Date.now().toString(),
      schema: 'network.xyo.id',
    }
    const archivistWrapper = new XyoArchivistWrapper(await archivist)
    for (let x = 0; x < 10; x++) {
      await archivistWrapper.insert([idPayload])
      await delay(10)
    }
    const getResult = await archivistWrapper.all()
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(2)
  })
}
