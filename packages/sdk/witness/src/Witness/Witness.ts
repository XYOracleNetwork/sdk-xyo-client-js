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
  abstract observe(fields?: Partial<T> | undefined, query?: Q | undefined): Promisable<T>

  async query(query?: Q): Promise<[XyoBoundWitness, XyoPayload<{ schema: string }>[]]> {
    const payloads = [await this.observe({}, query)]
    return [this.bindPayloads(payloads), payloads]
  }
}
