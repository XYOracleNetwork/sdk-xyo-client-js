/**
 * @jest-environment jsdom
 */
import { delay } from '@xylabs/delay'
import { Promisable } from '@xylabs/promise'
import { Account } from '@xyo-network/account'
import { ArchivistInstance } from '@xyo-network/archivist-model'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

import { CookieArchivist, CookieArchivistConfigSchema } from '../CookieArchivist'

const testArchivistRoundTrip = (archivistPromise: Promisable<ArchivistInstance>, name: string) => {
  test(`Archivist RoundTrip [${name}]`, async () => {
    const idPayload: Payload<{ salt: string }> = {
      salt: Date.now().toString(),
      schema: IdSchema,
    }
    const payloadWrapper = await PayloadWrapper.wrap(idPayload)

    const archivist = await archivistPromise
    const insertResult = await archivist.insert([idPayload])
    expect(insertResult).toBeDefined()

    const getResult = await archivist.get([await payloadWrapper.dataHash()])
    expect(getResult).toBeDefined()
    expect(getResult.length).toBe(1)
    const gottenPayload = getResult[0]
    if (gottenPayload) {
      const gottenPayloadWrapper = await PayloadWrapper.wrap(gottenPayload)
      expect(await gottenPayloadWrapper.hash()).toBe(await payloadWrapper.hash())
      expect(await gottenPayloadWrapper.dataHash()).toBe(await payloadWrapper.dataHash())
    }
  })
}

const testArchivistAll = (archivist: Promisable<ArchivistInstance>, name: string) => {
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
    expect(getResult?.length).toBe(4)
  })
}

/**
 * @group module
 * @group archivist
 */
testArchivistRoundTrip(
  (async () => await CookieArchivist.create({ account: Account.randomSync(), config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
testArchivistAll(
  (async () => await CookieArchivist.create({ account: Account.randomSync(), config: { namespace: 'test', schema: CookieArchivistConfigSchema } }))(),
  'cookie',
)
