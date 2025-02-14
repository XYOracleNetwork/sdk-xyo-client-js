import { tmpdir } from 'node:os'

import { LevelDbArchivist, LevelDbArchivistConfigSchema } from '@xyo-network/archivist-leveldb'
import { LmdbArchivist, LmdbArchivistConfigSchema } from '@xyo-network/archivist-lmdb'
import type { Id } from '@xyo-network/id-payload-plugin'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { bench, describe } from 'vitest'

describe('LMDB vs LevelDB', () => {
  let levelDbArchivist: LevelDbArchivist
  let levelDBSetup = async () => {
    levelDbArchivist = await LevelDbArchivist.create({
      account: 'random',
      config: {
        location: tmpdir(), dbName: 'levelDbArchivist.bench.db', storeName: 'payloads', clearStoreOnStart: true, schema: LevelDbArchivistConfigSchema,
      },
    })
  }
  let lmdbArchivist: LmdbArchivist
  let lmdbArchivistSetup = async () => {
    lmdbArchivist = await LmdbArchivist.create({
      account: 'random',
      config: {
        location: tmpdir(), dbName: 'lmdbArchivist.bench.db', storeName: 'payloads', clearStoreOnStart: true, schema: LmdbArchivistConfigSchema,
      },
    })
  }

  const payloads = Array.from(
    { length: 100 },
    (_, i) => new PayloadBuilder<Id>({ schema: IdSchema }).fields({ salt: `${i}` }).build(),

  )

  // NOTE: Pre-hashed  since bench does not support async beforeAll setup for local vars
  // const hash = await PayloadBuilder.hash({ schema: 'network.xyo.id', salt: '1' })
  const hash = '3a3b8deca568ff820b0b7c8714fbdf82b40fb54f4b15aca8745e06b81291558e'
  // const dataHash = await PayloadBuilder.dataHash({ schema: 'network.xyo.id', salt: '1' })
  const dataHash = '3a3b8deca568ff820b0b7c8714fbdf82b40fb54f4b15aca8745e06b81291558e'

  describe('insert (single)', () => {
    bench('LevelDbArchivist', async () => {
      await levelDbArchivist.insert([payloads[0]])
    }, { setup: levelDBSetup })

    bench('LmdbArchivist', async () => {
      await lmdbArchivist.insert([payloads[0]])
    }, { setup: lmdbArchivistSetup })
  })
  describe('insert (many)', () => {
    bench('LevelDbArchivist', async () => {
      await levelDbArchivist.insert(payloads)
    }, { setup: levelDBSetup })

    bench('LmdbArchivist', async () => {
      await lmdbArchivist.insert(payloads)
    }, { setup: lmdbArchivistSetup })
  })
  describe('get (by hash)', () => {
    bench('LevelDbArchivist', async () => {
      await levelDbArchivist.get([hash])
    }, { setup: levelDBSetup })

    bench('LmdbArchivist', async () => {
      await lmdbArchivist.get([hash])
    }, { setup: lmdbArchivistSetup })
  })
  describe('get (missing hash)', () => {
    bench('LevelDbArchivist', async () => {
      await levelDbArchivist.get([''])
    }, { setup: levelDBSetup })

    bench('LmdbArchivist', async () => {
      await lmdbArchivist.get([''])
    }, { setup: lmdbArchivistSetup })
  })
  describe('next', () => {
    const limit = 100
    describe('asc', () => {
      const order = 'asc'
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.next({ limit, order })
      }, { setup: levelDBSetup })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.next({ limit, order })
      }, { setup: lmdbArchivistSetup })
    })
    describe('desc', () => {
      const order = 'desc'
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.next({ limit, order })
      }, { setup: levelDBSetup })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.next({ limit, order })
      }, { setup: lmdbArchivistSetup })
    })
  })
})
