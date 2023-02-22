import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { BoundWitnessBuilder } from '@xyo-network/boundwitness-builder'
import { XyoBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { ModuleParams } from '@xyo-network/module'
import {
  AbstractPayloadArchivist,
  ArchiveModuleConfig,
  ArchiveModuleConfigSchema,
  WitnessedPayloadArchivist,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
  XyoPayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { PayloadFindFilter, XyoPayloads } from '@xyo-network/payload-model'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

const unique = <T>(value: T, index: number, self: T[]) => {
  return self.indexOf(value) === index
}

const valid = (bw: XyoBoundWitness) => {
  return new BoundWitnessValidator(bw).validate().length === 0
}

export interface MongoDBArchivistWitnessedPayloadArchivistParams<T extends ArchiveModuleConfig = ArchiveModuleConfig> extends ModuleParams<T> {
  boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  payloads: BaseMongoSdk<XyoPayloadWithMeta>
}

export class MongoDBArchivistWitnessedPayloadArchivist extends AbstractPayloadArchivist<XyoPayloadWithMeta> implements WitnessedPayloadArchivist {
  static override configSchema = ArchiveModuleConfigSchema

  protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>
  protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta>

  constructor(params: MongoDBArchivistWitnessedPayloadArchivistParams) {
    super(params)
    this.boundWitnesses = params.boundWitnesses || getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses)
    this.payloads = params.payloads || getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads)
  }

  static override async create(
    params?: Partial<MongoDBArchivistWitnessedPayloadArchivistParams>,
  ): Promise<MongoDBArchivistWitnessedPayloadArchivist> {
    return (await super.create(params)) as MongoDBArchivistWitnessedPayloadArchivist
  }

  find(_filter: PayloadFindFilter): Promise<XyoPayloadWithMeta[]> {
    throw new Error('Not implemented')
  }
  async get(hashes: string[]): Promise<XyoPayloadWithMeta[]> {
    // Find bw signed by us that has this hash
    const hash = assertEx(hashes.pop(), 'Missing hash')
    const bound_witnesses = (
      await (await this.boundWitnesses.find({ addresses: this.address, payload_hashes: hash })).limit(DefaultLimit).toArray()
    ).filter(valid)
    const archives = bound_witnesses
      .map((bw) => bw._archive)
      .filter(exists)
      .filter(unique)
    return (await this.payloads.find({ _archive: { $in: archives }, _hash: hash })).limit(DefaultLimit).toArray()
  }

  async insert(payloads: XyoPayloadWithMeta[]): Promise<XyoBoundWitness[]> {
    // Witness from archivist
    const _timestamp = Date.now()
    const [bw] = new BoundWitnessBuilder({ inlinePayloads: false }).payloads(payloads).build() as [
      XyoBoundWitnessWithMeta & XyoPayloadWithPartialMeta,
      XyoPayloads,
    ]
    bw._timestamp = _timestamp
    const witnessResult = await this.boundWitnesses.insertOne(bw)
    if (!witnessResult.acknowledged || !witnessResult.insertedId) {
      throw new Error('Error inserting BoundWitness')
    }
    // Store payloads
    const result = await this.payloads.insertMany(payloads.map(removeId) as XyoPayloadWithMeta[])
    if (result.insertedCount != payloads.length) {
      throw new Error('Error inserting Payloads')
    }
    return [bw]
  }
}
