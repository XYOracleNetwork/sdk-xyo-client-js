import { XyoBoundWitness } from '@xyo-network/boundwitness'
import { XyoAbstractModule } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

import { XyoWitnessConfig } from './XyoWitnessConfig'
import { XyoWitnessQueryPayload } from './XyoWitnessQueryPayload'

export abstract class XyoWitness<
  T extends XyoPayload = XyoPayload,
  Q extends XyoWitnessQueryPayload = XyoWitnessQueryPayload,
  C extends XyoWitnessConfig<Q> = XyoWitnessConfig<Q>,
> extends XyoAbstractModule<Q, C> {
  public get targetSchema() {
    return this.config.targetSchema
  }

  public observe(fields?: Partial<T> | undefined, _query?: Q | undefined): Promisable<T> {
    return { ...fields, schema: this.config.targetSchema } as T
  }

  async query(query?: Q): Promise<[XyoBoundWitness, XyoPayload<{ schema: string }>[]]> {
    const payloads = [await this.observe({}, query)]
    return [this.bindPayloads(payloads), payloads]
  }
}
