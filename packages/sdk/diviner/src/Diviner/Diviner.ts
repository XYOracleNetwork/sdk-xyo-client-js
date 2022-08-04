import { WithTimestamp, XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export interface XyoDiviner<TPayload extends XyoPayload = XyoPayload, TQueryPayload extends XyoQueryPayload = XyoQueryPayload> {
  divine(query: TQueryPayload): Promise<TPayload>
}

export abstract class XyoAbstractDiviner<TPayload extends XyoPayload = XyoPayload, TQueryPayload extends XyoQueryPayload = XyoQueryPayload>
  implements XyoDiviner<TPayload>
{
  abstract divine(query: TQueryPayload): Promise<TPayload>
}

export abstract class XyoAbstractTimestampDiviner<
  TTargetPayload extends WithTimestamp<XyoPayload> = WithTimestamp<XyoPayload>,
  TQueryPayload extends XyoQueryPayload = XyoQueryPayload
> extends XyoAbstractDiviner<TTargetPayload, TQueryPayload> {}
