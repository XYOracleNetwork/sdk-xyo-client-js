/**
 * @jest-environment jsdom
 */
import { delay } from '@xylabs/delay'
import type { Promisable } from '@xylabs/promise'
import type { ArchivistInstance } from '@xyo-network/archivist-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { expect, test } from 'vitest'

import { CookieArchivist, CookieArchivistConfigSchema } from '../CookieArchivist.ts'

const testArchivistRoundTrip = (archivistPromise: Promisable<ArchivistInstance>, name: string) => {
  test(`Archivist RoundTrip [${name}]`, async () => {
    const idPayload: Payload<{ salt: string }> = {
      salt: Date.now().toString(),
      schema: IdSchema,
    }
    const payloadWrapper = PayloadWrapper.wrap(idPayload)

    const archivist = await archivistPromise
    await archivist.clear?.()
    const insertResult = await archivist.insert([payloadWrapper.payload])
    expect(insertResult).toBeDefined()

    const getResult = await archivist.get([await payloadWrapper.dataHash()])
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(1)
    const gottenPayload = getResult[0]
    if (gottenPayload) {
      const gottenPayloadWrapper = PayloadWrapper.wrap(gottenPayload)
      // expect(await gottenPayloadWrapper.hash()).toBe(await payloadWrapper.hash())
      expect(await gottenPayloadWrapper.dataHash()).toBe(await payloadWrapper.dataHash())
    }
  })
}

const testArchivistAll = (archivistPromise: Promisable<ArchivistInstance>, name: string) => {
  test(`Archivist All [${name}]`, async () => {
    const idPayload = {
      salt: Date.now().toString(),
      schema: IdSchema,
    }
    const archivist = await archivistPromise
    await archivist.clear?.()
    for (let x = 0; x < 10; x++) {
      await archivist.insert([await PayloadBuilder.build(idPayload)])
      await delay(10)
    }
    const getResult = await archivist.all?.()
    expect(getResult).toBeDefined()
    // this is 11 here since we double store all these and every one has the same dataHash
    expect(getResult?.length).toBe(2)
  })
}

/**
 * @group module
 * @group archivist
 */
testArchivistRoundTrip(
  (async () => await CookieArchivist.create({ account: 'random', config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
testArchivistAll(
  (async () => await CookieArchivist.create({ account: 'random', config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
