import { XyoPayload, XyoPayloadBuilder, XyoQueryPayload } from '@xyo-network/payload'

import { XyoAbstractWitness } from './Witness'

export interface XyoQueryWitnessConfig<Q extends XyoQueryPayload = XyoQueryPayload> {
  query: Q
}

export class XyoQueryWitness<
  T extends XyoPayload,
  Q extends XyoQueryPayload = XyoQueryPayload,
  C extends XyoQueryWitnessConfig<Q> = XyoQueryWitnessConfig<Q>,
> extends XyoAbstractWitness<T, C> {
  override get targetSchema() {
    return this.config?.query.targetSchema ?? 'network.xyo.payload'
  }

  public observe(fields?: Partial<T>): Promise<T> {
    return Promise.resolve(new XyoPayloadBuilder<T>({ schema: this.targetSchema }).fields(fields).build())
  }
}
