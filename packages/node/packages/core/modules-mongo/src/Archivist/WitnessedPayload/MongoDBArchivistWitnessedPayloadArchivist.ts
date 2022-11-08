import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { XyoAccount } from '@xyo-network/account'
import { BoundWitnessBuilder, BoundWitnessValidator, XyoBoundWitness } from '@xyo-network/boundwitness'
import {
  AbstractPayloadArchivist,
  WitnessedPayloadArchivist,
  XyoBoundWitnessWithMeta,
  XyoPayloadWithMeta,
  XyoPayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayloadFindFilter, XyoPayloads } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { inject, injectable, named } from 'inversify'

import { COLLECTIONS } from '../../collections'
import { DefaultLimit } from '../../defaults'
import { getBaseMongoSdk, removeId } from '../../Mongo'

const unique = <T>(value: T, index: number, self: T[]) => {
  return self.indexOf(value) === index
}

const valid = (bw: XyoBoundWitness) => {
  return new BoundWitnessValidator(bw).validate().length === 0
}

@injectable()
export class MongoDBArchivistWitnessedPayloadArchivist extends AbstractPayloadArchivist<XyoPayloadWithMeta> implements WitnessedPayloadArchivist {
  constructor(
    protected readonly account: XyoAccount = new XyoAccount({ phrase: assertEx(process.env.ACCOUNT_SEED) }),
    protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta> = getBaseMongoSdk<XyoPayloadWithMeta>(COLLECTIONS.Payloads),
    protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta> = getBaseMongoSdk<XyoBoundWitnessWithMeta>(COLLECTIONS.BoundWitnesses),
  ) {
    super(account)
  }
  find(_filter: XyoPayloadFindFilter): Promise<XyoPayloadWithMeta[]> {
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
