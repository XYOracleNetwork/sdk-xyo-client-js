import { exists } from '@xylabs/exists'
import type { Hash } from '@xylabs/hex'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import type { ArchivistNextOptions } from '@xyo-network/archivist-model'
import { ArchivistInsertQuerySchema, ArchivistNextQuerySchema } from '@xyo-network/archivist-model'
import { MongoDBArchivistConfigSchema } from '@xyo-network/archivist-model-mongodb'
import { MongoDBModuleMixinV2 } from '@xyo-network/module-abstract-mongodb'
import {
  type Payload, type Schema, type Sequence, SequenceConstants,
  type WithStorageMeta,
} from '@xyo-network/payload-model'
import type { PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'
import { fromDbRepresentation, toDbRepresentation } from '@xyo-network/payload-mongodb'
import type { MongoError } from 'mongodb'

const MongoDBArchivistBaseV2 = MongoDBModuleMixinV2(AbstractArchivist)

const MONGODB_DUPLICATE_KEY_ERROR = 11_000

export class MongoDBArchivistV2 extends MongoDBArchivistBaseV2 {
  static override readonly configSchemas: Schema[] = [...super.configSchemas, MongoDBArchivistConfigSchema]
  static override readonly defaultConfigSchema: Schema = MongoDBArchivistConfigSchema

  override readonly queries: string[] = [ArchivistInsertQuerySchema, ArchivistNextQuerySchema, ...super.queries]

  /**
   * The amount of time to allow the aggregate query to execute
   */
  protected readonly aggregateTimeoutMs = 10_000

  protected async findOneByHash(hash: Hash) {
    const dataPayload = (await this.payloads.findOne({ _$hash: hash }))
    if (dataPayload) {
      return dataPayload
    } else {
      const payload = (await this.payloads.findOne({ _hash: hash }))
      if (payload) {
        return payload
      }
    }
  }

  protected async findOneBySequence(sequence: Sequence) {
    const dataPayload = (await this.payloads.findOne({ _sequence: sequence }))
    if (dataPayload) {
      return dataPayload
    }
  }

  protected override async getHandler(hashes: Hash[]): Promise<WithStorageMeta<Payload>[]> {
    let remainingHashes = [...hashes]

    const dataPayloads = (await Promise.all(remainingHashes.map(_dataHash => this.payloads.findOne({ _dataHash })))).filter(exists)
    const dataPayloadsHashes = new Set(dataPayloads.map(payload => payload._dataHash))
    remainingHashes = remainingHashes.filter(hash => !dataPayloadsHashes.has(hash))

    const payloads = (await Promise.all(remainingHashes.map(_hash => this.payloads.findOne({ _hash })))).filter(exists)
    const payloadsHashes = new Set(payloads.map(payload => payload._hash))
    // eslint-disable-next-line sonarjs/no-dead-store
    remainingHashes = remainingHashes.filter(hash => !payloadsHashes.has(hash))

    const foundPayloads = [...dataPayloads, ...payloads] as PayloadWithMongoMeta<Payload>[]
    const result = foundPayloads.map(fromDbRepresentation)
    return result
  }

  protected override async insertHandler(payloads: WithStorageMeta<Payload>[]): Promise<WithStorageMeta<Payload>[]> {
    const payloadsWithExternalMeta = payloads.map(value => toDbRepresentation(value))
    if (payloadsWithExternalMeta.length > 0) {
      try {
        const payloadsResult = await this.payloads.insertMany(payloadsWithExternalMeta, { ordered: false })
        if (!payloadsResult.acknowledged) throw new Error('MongoDBArchivist: Error inserting Payloads')
      } catch (error) {
        const mongoError = error as MongoError
        // NOTE: Intentional coercive equality since Mongo error codes are
        // of type string | number
        if (mongoError?.code != MONGODB_DUPLICATE_KEY_ERROR) throw error
      }
    }
    return [...payloadsWithExternalMeta].map(fromDbRepresentation)
  }

  protected override async nextHandler(options?: ArchivistNextOptions): Promise<WithStorageMeta<Payload>[]> {
    // Sanitize inputs and set defaults
    let {
      limit, cursor, order, open = true,
    } = options ?? { limit: 10, order: 'desc' }

    if (!limit) limit = 10
    if (limit > 100) limit = 100

    if (order != 'asc') order = 'desc'

    let sequence: Sequence | undefined
    if (cursor) {
      const payload = await this.findOneBySequence(cursor)
      // TODO: Should we throw an error if the requested payload is not found?
      if (payload) sequence = payload._sequence
    } else {
      sequence = order === 'asc'
      // If ascending, start from the beginning of time
        ? SequenceConstants.minLocalSequence
        // If descending, start from now (plus a bit more in the future to ensure
        // them most recent ObjectIds are included)
        : SequenceConstants.maxLocalSequence
    }
    if (!sequence) return []

    // Create find criteria
    const sort = order === 'asc' ? 1 : -1

    const match = order === 'asc'
      ? (open
          ? { _sequence: { $gt: sequence } }
          : { _sequence: { $gte: sequence } })
      : (open
          ? { _sequence: { $lt: sequence } }
          : { _sequence: { $lte: sequence } })

    // Run the aggregate query
    const foundPayloads = await this.payloads.useCollection((collection) => {
      return collection
        .aggregate<PayloadWithMongoMeta>([
          // Pre-filter payloads collection
          { $match: match },
          // Sort payloads by _sequence
          { $sort: { _sequence: sort } },
          // Limit payloads to the first N payloads
          { $limit: limit },
        ])
        .maxTimeMS(this.aggregateTimeoutMs)
        .toArray()
    })

    // Convert from DB representation to Payloads
    return foundPayloads.map(fromDbRepresentation)
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.ensureIndexes()
    return true
  }
}
