import { exists } from '@xylabs/exists'
import { fulfilledValues } from '@xylabs/promise'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import { ArchivistConfigSchema, ArchivistInsertQuerySchema } from '@xyo-network/archivist-model'
import { MongoDBArchivistConfigSchema } from '@xyo-network/archivist-model-mongodb'
import { CollectionIndexFunction, MongoDBModuleMixin } from '@xyo-network/module-abstract-mongodb'
import { PayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { IndexDescription } from 'mongodb'

import { toBoundWitnessWithMeta, toPayloadWithMeta, toReturnValue, validByType } from './lib'

const getBoundWitnessesIndexes: CollectionIndexFunction = (collectionName: string): IndexDescription[] => {
  return [
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { _hash: 1 },
      name: `${collectionName}.IX__hash`,
    },
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { _timestamp: -1, addresses: 1 },
      name: `${collectionName}.IX__timestamp_addresses`,
    },
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { addresses: 1, _timestamp: -1 },
      name: `${collectionName}.IX_addresses__timestamp`,
    },
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { addresses: 1 },
      name: `${collectionName}.IX_addresses`,
    },
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { payload_hashes: 1 },
      name: `${collectionName}.IX_payload_hashes`,
    },
  ]
}

const getPayloadsIndexes: CollectionIndexFunction = (collectionName: string): IndexDescription[] => {
  return [
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { _hash: 1 },
      name: `${collectionName}.IX__hash`,
    },
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { _timestamp: 1 },
      name: `${collectionName}.IX__timestamp`,
    },
    {
      // eslint-disable-next-line sort-keys-fix/sort-keys-fix
      key: { schema: 1, _timestamp: -1 },
      name: `${collectionName}.IX_schema__timestamp`,
    },
  ]
}

const MongoDBArchivistBase = MongoDBModuleMixin(AbstractArchivist)

export class MongoDBArchivist extends MongoDBArchivistBase {
  static override configSchemas = [MongoDBArchivistConfigSchema, ArchivistConfigSchema]

  override readonly queries: string[] = [ArchivistInsertQuerySchema, ...super.queries]

  override async head(): Promise<Payload | undefined> {
    const head = await (await this.payloads.find({})).sort({ _timestamp: -1 }).limit(1).toArray()
    return head[0] ? PayloadWrapper.wrap(head[0]).body() : undefined
  }

  protected override async getHandler(hashes: string[]): Promise<Payload[]> {
    const payloads = hashes.map((_hash) => this.payloads.findOne({ _hash }))
    const bws = hashes.map((_hash) => this.boundWitnesses.findOne({ _hash }))
    const gets = await Promise.allSettled([payloads, bws].flat())
    const succeeded = gets.reduce<(PayloadWithPartialMeta | null)[]>(fulfilledValues, []) as Payload[]
    return succeeded.filter(exists).map(toReturnValue)
  }

  protected override async insertHandler(payloads?: Payload[]): Promise<Payload[]> {
    const [bw, p] = await validByType(payloads)
    const boundWitnesses = await Promise.all(bw.map((x) => toBoundWitnessWithMeta(x)))
    const payloadsWithMeta = await Promise.all(p.map((x) => toPayloadWithMeta(x)))
    if (boundWitnesses.length) {
      const boundWitnessesResult = await this.boundWitnesses.insertMany(boundWitnesses)
      if (!boundWitnessesResult.acknowledged || boundWitnessesResult.insertedCount !== boundWitnesses.length)
        throw new Error('MongoDBDeterministicArchivist: Error inserting BoundWitnesses')
    }
    if (payloadsWithMeta.length) {
      const payloadsResult = await this.payloads.insertMany(payloadsWithMeta)
      if (!payloadsResult.acknowledged || payloadsResult.insertedCount !== payloadsWithMeta.length)
        throw new Error('MongoDBDeterministicArchivist: Error inserting Payloads')
    }
    return payloads ?? []
  }

  protected override async startHandler() {
    await super.startHandler()
    await this.boundWitnesses.useCollection(async (collection) => {
      const { collectionName } = collection
      const indexes = getBoundWitnessesIndexes(collectionName)
      await collection.createIndexes(indexes)
    })
    await this.payloads.useCollection(async (collection) => {
      const { collectionName } = collection
      const indexes = getPayloadsIndexes(collectionName)
      await collection.createIndexes(indexes)
    })
    return true
  }
}
