/**
 * @jest-environment jsdom
 */

import { delay } from '@xylabs/delay'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoArchivist } from '../XyoArchivist'
import { XyoArchivistWrapper } from '../XyoArchivistWrapper'

export const testArchivistRoundTrip = (archivist: XyoArchivist, name: string) => {
  test(`XyoArchivist [${name}]`, async () => {
    const idPayload: XyoPayload<{ salt: string }> = {
      salt: 'test',
      schema: 'network.xyo.id',
    }
    const payloadWrapper = new XyoPayloadWrapper(idPayload)
    const archivistWrapper = new XyoArchivistWrapper(archivist)
    const insertResult = await archivistWrapper.insert([idPayload])
    expect(insertResult).toBeDefined()
    expect(insertResult.payload_hashes.find((hash) => hash === payloadWrapper.hash)).toBeDefined()
    const getResult = await archivistWrapper.get([payloadWrapper.hash])
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(1)
    const gottenPayload = getResult[0]
    if (gottenPayload) {
      const gottenPayloadWrapper = new XyoPayloadWrapper(gottenPayload)
      expect(gottenPayloadWrapper.hash).toBe(payloadWrapper.hash)
    }
  })
}

export const testArchivistAll = (archivist: XyoArchivist, name: string) => {
  test(`XyoArchivist [${name}]`, async () => {
    const idPayload = {
      salt: 'test',
      schema: 'network.xyo.id',
    }
    const archivistWrapper = new XyoArchivistWrapper(archivist)
    for (let x = 0; x < 10; x++) {
      await archivistWrapper.insert([{ ...idPayload, salt: Date.now().toString() } as XyoPayload<{ salt: string }>])
      await delay(10)
    }
    const getResult = await archivistWrapper.all()
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(11)
  })
}
