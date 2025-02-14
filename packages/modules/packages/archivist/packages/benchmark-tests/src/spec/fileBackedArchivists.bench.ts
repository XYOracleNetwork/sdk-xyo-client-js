import { tmpdir } from 'node:os'

import type { Hash } from '@xylabs/hex'
import { LevelDbArchivist, LevelDbArchivistConfigSchema } from '@xyo-network/archivist-leveldb'
import { LmdbArchivist, LmdbArchivistConfigSchema } from '@xyo-network/archivist-lmdb'
import type { Id } from '@xyo-network/id-payload-plugin'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { WithSources } from '@xyo-network/payload-model'
import { bench, describe } from 'vitest'

describe('LMDB vs LevelDB', () => {
  const missingHash = 'a2069e044136fdf5decb4580b81d2b8ae5c26101d621ec8e2d1c0bbf2f4fbb90'
  const totalTestPayloads = 100
  let levelDbArchivist: LevelDbArchivist
  const levelDBArchivistSetup = async () => {
    levelDbArchivist = await LevelDbArchivist.create({
      account: 'random',
      config: {
        location: tmpdir(), dbName: 'levelDbArchivist.bench.db', storeName: 'payloads', clearStoreOnStart: true, schema: LevelDbArchivistConfigSchema,
      },
    })
    const payload = payloads[Math.trunc(totalTestPayloads / 2)]
    hash = await PayloadBuilder.hash(payload)
    dataHash = await PayloadBuilder.dataHash(payload)
  }
  const levelDBArchivistSetupWithData = async () => {
    await levelDBArchivistSetup()
    await levelDbArchivist.insert(payloads)
  }
  let lmdbArchivist: LmdbArchivist
  const lmdbArchivistSetup = async () => {
    lmdbArchivist = await LmdbArchivist.create({
      account: 'random',
      config: {
        location: tmpdir(), dbName: 'lmdbArchivist.bench.db', storeName: 'payloads', clearStoreOnStart: true, schema: LmdbArchivistConfigSchema,
      },
    })
    const payload = payloads[Math.trunc(totalTestPayloads / 2)]
    hash = await PayloadBuilder.hash(payload)
    dataHash = await PayloadBuilder.dataHash(payload)
  }
  const lmdbArchivistSetupWithData = async () => {
    await lmdbArchivistSetup()
    await lmdbArchivist.insert(payloads)
  }
  let hash: Hash
  let dataHash: Hash

  const payloads = Array.from(
    { length: totalTestPayloads },
    (_, i) => new PayloadBuilder<WithSources<Id>>({ schema: IdSchema }).fields({ salt: `${i}` }).meta({ $sources: [missingHash] }).build(),

  )

  // NOTE: Pre-hashed  since bench does not support async beforeAll setup for local vars
  // const hash = await PayloadBuilder.hash({ schema: 'network.xyo.id', salt: '1' })
  // const hash = '3a3b8deca568ff820b0b7c8714fbdf82b40fb54f4b15aca8745e06b81291558e'
  // const dataHash = await PayloadBuilder.dataHash({ schema: 'network.xyo.id', salt: '1' })
  // const dataHash = '3a3b8deca568ff820b0b7c8714fbdf82b40fb54f4b15aca8745e06b81291558e'

  describe('insert (single)', () => {
    bench('LevelDbArchivist', async () => {
      await levelDbArchivist.insert([payloads[0]])
    }, { setup: levelDBArchivistSetup })

    bench('LmdbArchivist', async () => {
      await lmdbArchivist.insert([payloads[0]])
    }, { setup: lmdbArchivistSetup })
  })
  describe('insert (many)', () => {
    bench('LevelDbArchivist', async () => {
      await levelDbArchivist.insert(payloads)
    }, { setup: levelDBArchivistSetup })

    bench('LmdbArchivist', async () => {
      await lmdbArchivist.insert(payloads)
    }, { setup: lmdbArchivistSetup })
  })
  describe('get (single)', () => {
    describe('get (by hash)', () => {
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.get([hash])
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.get([hash])
      }, { setup: lmdbArchivistSetupWithData })
    })
    describe('get (by dataHash)', () => {
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.get([dataHash])
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.get([dataHash])
      }, { setup: lmdbArchivistSetupWithData })
    })
    describe('get (missing hash)', () => {
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.get([missingHash])
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.get([missingHash])
      }, { setup: lmdbArchivistSetupWithData })
    })
  })
  describe('next', () => {
    const limit = Math.trunc(totalTestPayloads / 2)
    describe('asc', () => {
      const order = 'asc'
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.next({ limit, order })
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.next({ limit, order })
      }, { setup: lmdbArchivistSetupWithData })
    })
    describe('desc', () => {
      const order = 'desc'
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.next({ limit, order })
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.next({ limit, order })
      }, { setup: lmdbArchivistSetupWithData })
    })
  })
})
