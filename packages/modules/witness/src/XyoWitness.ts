import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoAbstractModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoWitnessObserveQueryPayloadSchema, XyoWitnessQueryPayload } from './Query'
import { XyoWitnessConfig } from './XyoWitnessConfig'

export abstract class XyoWitness<
  T extends XyoPayload = XyoPayload,
  C extends XyoWitnessConfig = XyoWitnessConfig,
  Q extends XyoWitnessQueryPayload<T> = XyoWitnessQueryPayload<T>,
> extends XyoAbstractModule<C, Q> {
  public get targetSchema() {
    return this.config.targetSchema
  }

  override get queries() {
    return [XyoWitnessObserveQueryPayloadSchema]
  }

  public observe(fields?: Partial<T> | undefined): Promisable<T> {
    return { ...fields, schema: this.config.targetSchema } as T
  }

  async query(query: XyoWitnessQueryPayload<T>): Promise<[XyoBoundWitness, XyoPayload[]]> {
    switch (query.schema) {
      case XyoWitnessObserveQueryPayloadSchema:
    }
    const payloads = [await this.observe(query?.payload ?? {})]
    return [this.bindPayloads(payloads), payloads]
  }
}
