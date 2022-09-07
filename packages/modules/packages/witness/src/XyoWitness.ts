import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoWitnessConfig } from './Config'
import { XyoWitnessObserveQuerySchema, XyoWitnessQueryPayload } from './Query'
import { Witness } from './Witness'

export abstract class XyoWitness<TTarget extends XyoPayload = XyoPayload, TConfig extends XyoWitnessConfig = XyoWitnessConfig>
  extends XyoModule<TConfig>
  implements Witness<TTarget>
{
  public get targetSchema() {
    return this.config.targetSchema
  }

  override get queries() {
    return [XyoWitnessObserveQuerySchema]
  }

  public observe(fields?: Partial<TTarget> | undefined): Promisable<TTarget> {
    return { ...fields, schema: this.config.targetSchema } as TTarget
  }

  async query(query: XyoWitnessQueryPayload<TTarget>): Promise<[XyoBoundWitness, XyoPayload[]]> {
    switch (query.schema) {
      case XyoWitnessObserveQuerySchema: {
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
