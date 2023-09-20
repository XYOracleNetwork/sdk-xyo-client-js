import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { merge } from '@xylabs/lodash'
import { fulfilledValues } from '@xylabs/promise'
import { staticImplements } from '@xylabs/static-implements'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import { ArchivistConfigSchema, ArchivistInsertQuerySchema } from '@xyo-network/archivist-model'
import { MongoDBArchivistConfigSchema, MongoDBArchivistParams } from '@xyo-network/archivist-model-mongodb'
import { QueryBoundWitnessWrapper } from '@xyo-network/boundwitness-builder'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { WithLabels } from '@xyo-network/module-model'
import { MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta, PayloadWithMeta, PayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { validByType } from './lib'

const toBoundWitnessWithMeta = async (wrapper: BoundWitnessWrapper | QueryBoundWitnessWrapper): Promise<BoundWitnessWithMeta> => {
  const bw = wrapper.boundwitness as BoundWitness
  return { ...bw, _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
}

const toReturnValue = (value: Payload | BoundWitness): Payload => {
  const _signatures = (value as BoundWitness)?._signatures
  if (_signatures) {
    return { ...PayloadWrapper.wrap(value).body(), _signatures } as BoundWitness
  } else {
    return { ...PayloadWrapper.wrap(value).body() }
  }
}

const toPayloadWithMeta = async (wrapper: PayloadWrapper): Promise<PayloadWithMeta> => {
  return { ...wrapper.payload(), _hash: await wrapper.hashAsync(), _timestamp: Date.now() }
}

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export class MongoDBArchivist<TParams extends MongoDBArchivistParams = MongoDBArchivistParams> extends AbstractArchivist<TParams> {
  static override configSchemas = [MongoDBArchivistConfigSchema, ArchivistConfigSchema]
  static labels = MongoDBStorageClassLabels

  private _boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> | undefined
  private _payloadSdk: BaseMongoSdk<PayloadWithMeta> | undefined

  get boundWitnessSdkConfig(): BaseMongoSdkConfig {
    return merge({}, this.params.boundWitnessSdkConfig, this.config.boundWitnessSdkConfig, {
      collection: this.config.boundWitnessSdkConfig?.collection ?? this.params.boundWitnessSdkConfig?.collection ?? 'bound_witnesses',
    })
  }

  get boundWitnesses() {
    this._boundWitnessSdk = this._boundWitnessSdk ?? new BaseMongoSdk<BoundWitnessWithMeta>(this.boundWitnessSdkConfig)
    return assertEx(this._boundWitnessSdk)
  }

  get payloadSdkConfig(): BaseMongoSdkConfig {
    return merge({}, this.params.payloadSdkConfig, this.config.payloadSdkConfig, {
      collection: this.config.payloadSdkConfig?.collection ?? this.params.payloadSdkConfig?.collection ?? 'payload',
    })
  }

  get payloads() {
    this._payloadSdk = this._payloadSdk ?? new BaseMongoSdk<PayloadWithMeta>(this.payloadSdkConfig)
    return assertEx(this._payloadSdk)
  }

  override get queries(): string[] {
    return [ArchivistInsertQuerySchema, ...super.queries]
  }

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
}
