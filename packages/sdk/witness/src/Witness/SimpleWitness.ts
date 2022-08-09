import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'

import { XyoAbstractWitness, XyoWitness } from './Witness'

export interface XyoSimpleWitnessConfig<T extends XyoPayload = XyoPayload> {
  schema: string
  template?: XyoPayload
  observer?: () => Promise<T> | T
}

export class XyoSimpleWitness<T extends XyoPayload = XyoPayload, C extends XyoSimpleWitnessConfig<T> = XyoSimpleWitnessConfig<T>>
  extends XyoAbstractWitness<T, C>
  implements XyoWitness<T>
{
  public previousHash?: string

  override get targetSchema() {
    return this.config?.schema ?? 'network.xyo.payload'
  }

  public async observe(fields?: Partial<T>) {
    return new XyoPayloadBuilder<T>({ schema: this.targetSchema })
      .previousHash(this.previousHash)
      .fields(await this.config?.observer?.())
      .fields(fields)
      .build()
  }
}

/** @deprecated Use XyoSimpleWitness */
export class XyoLegacyWitness<
  T extends XyoPayload = XyoPayload,
  C extends XyoSimpleWitnessConfig<T> = XyoSimpleWitnessConfig<T>,
> extends XyoSimpleWitness<T, C> {}

/** @deprecated Use XyoSimpleWitnessConfig */
export type XyoWitnessConfig<T extends XyoPayload = XyoPayload> = XyoSimpleWitnessConfig<T>
