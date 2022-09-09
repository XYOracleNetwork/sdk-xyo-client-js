/**
 * @jest-environment jsdom
 */

import { XyoIdPayload, XyoIdSchema } from '@xyo-network/id-payload-plugin'
import { XyoPayloadWrapper } from '@xyo-network/payload'

import { XyoArchivist } from '../XyoArchivist'
import { XyoArchivistWrapper } from '../XyoArchivistWrapper'

export const testArchivist = (archivist: XyoArchivist, name: string) => {
  test(`XyoArchivist [${name}]`, async () => {
    const idPayload: XyoIdPayload = {
      salt: 'test',
      schema: XyoIdSchema,
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
