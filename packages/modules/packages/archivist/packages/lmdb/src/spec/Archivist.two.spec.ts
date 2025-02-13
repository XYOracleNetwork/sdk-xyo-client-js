import '@xylabs/vitest-extended'

import { tmpdir } from 'node:os'

import type { Id } from '@xyo-network/id-payload-plugin'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import {
  describe, expect, it,
} from 'vitest'

import { LevelDbArchivist } from '../Archivist.ts'
import { LmdbArchivistConfigSchema } from '../Config.ts'

/**
 * @group module
 * @group archivist
 */
describe('LevelArchivist', () => {
  it('should listen to cleared events', async () => {
    const archivistLevel1Test1Payloads1 = await LevelDbArchivist.create({
      account: 'random',
      config: {
        schema: LevelDbArchivistConfigSchema, location: tmpdir() + '/level1', dbName: 'test1.db', storeName: 'payloads1', clearStoreOnStart: true,
      },
    })
    const archivistLevel1Test1Payloads2 = await LevelDbArchivist.create({
      account: 'random',
      config: {
        schema: LevelDbArchivistConfigSchema, location: tmpdir() + '/level1', dbName: 'test1.db', storeName: 'payloads2', clearStoreOnStart: true,
      },
    })
    const archivistLevel1Test2Payloads1 = await LevelDbArchivist.create({
      account: 'random',
      config: {
        schema: LevelDbArchivistConfigSchema, location: tmpdir() + '/level1', dbName: 'test2.db', storeName: 'payloads1', clearStoreOnStart: true,
      },
    })
    const archivistLevel2Test1Payloads1 = await LevelDbArchivist.create({
      account: 'random',
      config: {
        schema: LevelDbArchivistConfigSchema, location: tmpdir() + '/level2', dbName: 'test1.db', storeName: 'payloads1', clearStoreOnStart: true,
      },
    })

    const p111Original = await PayloadBuilder.addStorageMeta(new PayloadBuilder<Id>({ schema: IdSchema }).fields({ salt: '111' }).build())
    const p112Original = await PayloadBuilder.addStorageMeta(new PayloadBuilder<Id>({ schema: IdSchema }).fields({ salt: '112' }).build())
    const p121Original = await PayloadBuilder.addStorageMeta(new PayloadBuilder<Id>({ schema: IdSchema }).fields({ salt: '121' }).build())
    const p211Original = await PayloadBuilder.addStorageMeta(new PayloadBuilder<Id>({ schema: IdSchema }).fields({ salt: '211' }).build())

    await archivistLevel1Test1Payloads1.insert([p111Original])
    await archivistLevel1Test1Payloads2.insert([p112Original])
    await archivistLevel1Test2Payloads1.insert([p121Original])
    await archivistLevel2Test1Payloads1.insert([p211Original])

    const [p111] = await archivistLevel1Test1Payloads1.next()
    const [p112] = await archivistLevel1Test1Payloads2.next()
    const [p121] = await archivistLevel1Test2Payloads1.next()
    const [p211] = await archivistLevel2Test1Payloads1.next()

    expect(p111._hash).toBe(p111Original._hash)
    expect(p112._hash).toBe(p112Original._hash)
    expect(p121._hash).toBe(p121Original._hash)
    expect(p211._hash).toBe(p211Original._hash)
  })
})
