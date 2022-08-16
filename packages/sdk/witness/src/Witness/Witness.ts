import { EmptyObject } from '@xyo-network/core'
import { WithTimestamp, XyoPayload } from '@xyo-network/payload'

export interface XyoWitness<T extends XyoPayload = XyoPayload> {
  targetSchema: string
  observe(fields?: Partial<T>): Promise<T>
}

export abstract class XyoAbstractWitness<T extends XyoPayload = XyoPayload, C extends EmptyObject = EmptyObject> implements XyoWitness<T> {
  public readonly config?: C
  constructor(config?: C) {
    this.config = config
  }
  abstract observe(fields?: Partial<T>): Promise<T>
  abstract get targetSchema(): string
}

export abstract class XyoAbstractTimestampWitness<
  TTargetPayload extends WithTimestamp<XyoPayload> = WithTimestamp<XyoPayload>,
  TConfig extends EmptyObject = EmptyObject,
> extends XyoAbstractWitness<TTargetPayload, TConfig> {}

/** @deprecated use XyoAbstractWitness instead */
export abstract class XyoWitnessBase<T extends XyoPayload = XyoPayload, C extends EmptyObject = EmptyObject> extends XyoAbstractWitness<T, C> {}
