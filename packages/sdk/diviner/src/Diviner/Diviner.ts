import { WithTimestamp, XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export interface XyoDiviner<TTargetPayload extends XyoPayload = XyoPayload> {
  targetSchema: string
  divine(fields?: Partial<TTargetPayload>): Promise<TTargetPayload>
}

export abstract class XyoAbstractDiviner<TTargetPayload extends XyoPayload = XyoPayload, TQueryPayload extends XyoQueryPayload = XyoQueryPayload>
  implements XyoDiviner<TTargetPayload>
{
  public readonly query: TQueryPayload
  constructor(query: TQueryPayload) {
    this.query = query
  }

  get targetSchema() {
    return this.query.targetSchema ?? 'network.xyo.payload'
  }

  abstract divine(fields?: Partial<TTargetPayload>): Promise<TTargetPayload>
}

export abstract class XyoAbstractTimestampDiviner<
  TTargetPayload extends WithTimestamp<XyoPayload> = WithTimestamp<XyoPayload>,
  TQueryPayload extends XyoQueryPayload = XyoQueryPayload
> extends XyoAbstractDiviner<TTargetPayload, TQueryPayload> {}
