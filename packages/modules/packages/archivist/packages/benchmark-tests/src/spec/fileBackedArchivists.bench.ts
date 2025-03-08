import Path from 'node:path'

import type { Hash } from '@xylabs/hex'
import { LevelDbArchivist, LevelDbArchivistConfigSchema } from '@xyo-network/archivist-leveldb'
import { LmdbArchivist, LmdbArchivistConfigSchema } from '@xyo-network/archivist-lmdb'
import type { Id } from '@xyo-network/id-payload-plugin'
import { IdSchema } from '@xyo-network/id-payload-plugin'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import type { WithSources } from '@xyo-network/payload-model'
import { v4 } from 'uuid'
import { bench, describe } from 'vitest'

describe('LMDB vs LevelDB', () => {
  const missingHash: Hash = 'a2069e044136fdf5decb4580b81d2b8ae5c26101d621ec8e2d1c0bbf2f4fbb90'
  const missingHashes: Hash[] = [
    'a2069e044136fdf5decb4580b81d2b8ae5c26101d621ec8e2d1c0bbf2f4fbb90',
    '66f07db88d4dbaef3c49559ad10604593cabd54431255f8c3a7163f562570b9d',
    '5482f54dca13a1ecfb0c36bd8cf0471045dbaef38f05021a2ea6f13545a7c062',
    '6f4b1a669a95a4cb2f1f62e1f018c1a39add570caf76476d8171e349444544ba',
    '1876f2127ac778881fac7fb5354a2c114478fd467e3917835b3281432df1cbf6',
    '655ed3ef5b03601f5ede740607c10281aa982671700d094e50c31b38798931a9',
    '7b1a7ce000163cf0bebe74596b338a1086438f64bbf8f03cb1e9902fd804fa45',
  ]
  const totalTestPayloads = 100
  let levelDbArchivist: LevelDbArchivist
  const levelDBArchivistSetup = async () => {
    levelDbArchivist = await LevelDbArchivist.create({
      account: 'random',
      config: {
        location: Path.join(process.cwd(), '.store', v4()),
        dbName: 'levelDbArchivist.bench.db',
        storeName: 'payloads',
        clearStoreOnStart: true,
        schema: LevelDbArchivistConfigSchema,
      },
    })
    const payload = payloads[Math.trunc(totalTestPayloads / 2)]
    hash = await PayloadBuilder.hash(payload)
    hashes = await Promise.all(payloads.slice(10).map(p => PayloadBuilder.hash(p)))
    dataHash = await PayloadBuilder.dataHash(payload)
    dataHashes = await Promise.all(payloads.slice(10).map(p => PayloadBuilder.dataHash(p)))
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
        location: Path.join(process.cwd(), '.store', v4()),
        dbName: 'lmdbArchivist.bench.db',
        storeName: 'payloads',
        clearStoreOnStart: true,
        schema: LmdbArchivistConfigSchema,
      },
    })
    const payload = payloads[Math.trunc(totalTestPayloads / 2)]
    hash = await PayloadBuilder.hash(payload)
    hashes = await Promise.all(payloads.slice(10).map(p => PayloadBuilder.hash(p)))
    dataHash = await PayloadBuilder.dataHash(payload)
    dataHashes = await Promise.all(payloads.slice(10).map(p => PayloadBuilder.dataHash(p)))
  }
  const lmdbArchivistSetupWithData = async () => {
    await lmdbArchivistSetup()
    await lmdbArchivist.insert(payloads)
  }
  let hash: Hash
  let hashes: Hash[]
  let dataHash: Hash
  let dataHashes: Hash[]

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
  describe('get (multiple)', () => {
    describe('get (by hash)', () => {
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.get(hashes)
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.get(hashes)
      }, { setup: lmdbArchivistSetupWithData })
    })
    describe('get (by dataHash)', () => {
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.get(dataHashes)
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.get(dataHashes)
      }, { setup: lmdbArchivistSetupWithData })
    })
    describe('get (missing hash)', () => {
      bench('LevelDbArchivist', async () => {
        await levelDbArchivist.get(missingHashes)
      }, { setup: levelDBArchivistSetupWithData })

      bench('LmdbArchivist', async () => {
        await lmdbArchivist.get(missingHashes)
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
