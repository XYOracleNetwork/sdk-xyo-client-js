import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { merge } from '@xylabs/lodash'
import { fulfilledValues } from '@xylabs/promise'
import { staticImplements } from '@xylabs/static-implements'
import { AbstractArchivist } from '@xyo-network/archivist-abstract'
import { ArchivistConfigSchema, ArchivistInsertQuerySchema } from '@xyo-network/archivist-model'
import { MongoDBArchivistConfigSchema, MongoDBArchivistParams } from '@xyo-network/archivist-model-mongodb'
import { Module } from '@xyo-network/module'
import { MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta, PayloadWithMeta, PayloadWithPartialMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { toBoundWitnessWithMeta, toPayloadWithMeta, toReturnValue, validByType } from './lib'

export interface MongoDBModuleStatic<T extends MongoDBStorageClassLabels = MongoDBStorageClassLabels> {
  labels: T
}
export interface MongoDBModule {
  get boundWitnessSdkConfig(): BaseMongoSdkConfig
  get boundWitnesses(): BaseMongoSdk<BoundWitnessWithMeta>
  get payloadSdkConfig(): BaseMongoSdkConfig
  get payloads(): BaseMongoSdk<PayloadWithMeta>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyModule<TParams extends MongoDBArchivistParams = MongoDBArchivistParams> = abstract new (...args: any[]) => Module<TParams>

const MongoDBModuleMixin = <TModule extends AnyModule = AnyModule>(ModuleBase: TModule) => {
  @staticImplements<MongoDBModuleStatic>()
  abstract class MongoModuleBase extends ModuleBase implements MongoDBModule {
    static labels = MongoDBStorageClassLabels
    _boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> | undefined
    _payloadSdk: BaseMongoSdk<PayloadWithMeta> | undefined

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
  }
  return MongoModuleBase
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
}
