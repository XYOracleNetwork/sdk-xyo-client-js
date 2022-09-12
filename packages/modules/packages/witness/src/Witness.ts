import { Module, XyoQuery } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export interface Witness<TTarget extends XyoPayload = XyoPayload, TQuery extends XyoQuery = XyoQuery> extends Module<TQuery> {
  observe: (fields?: Partial<TTarget> | undefined) => Promisable<TTarget | null>
}
