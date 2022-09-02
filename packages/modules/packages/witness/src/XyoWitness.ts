import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQueryPayloadSchema, XyoWitnessQueryPayload } from './Query'

export abstract class XyoWitness<
  TTarget extends XyoPayload = XyoPayload,
  TConfig extends XyoWitnessConfig = XyoWitnessConfig,
> extends XyoModule<TConfig> {
  public get targetSchema() {
    return this.config.targetSchema
  }

  override get queries() {
    return [XyoWitnessObserveQueryPayloadSchema]
  }

  public observe(fields?: Partial<TTarget> | undefined): Promisable<TTarget> {
    return { ...fields, schema: this.config.targetSchema } as TTarget
  }

  async query(query: XyoWitnessQueryPayload<TTarget>): Promise<[XyoBoundWitness, XyoPayload[]]> {
    switch (query.schema) {
      case XyoWitnessObserveQueryPayloadSchema: {
        const payloads = [await this.observe(query?.payload)]
        return [this.bindPayloads(payloads), payloads]
      }
    }
  }
}

export abstract class XyoTimestampWitness<T extends XyoPayload = XyoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> extends XyoWitness<
  T,
  C
> {
  public observe(fields?: Partial<T> | undefined): Promisable<T> {
    return { ...fields, schema: this.config.targetSchema, timestamp: Date.now() } as T
  }
}
