import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'

export interface Witness<TTarget extends XyoPayload = XyoPayload> {
  observe: (fields?: Partial<TTarget> | undefined) => Promisable<TTarget | null>
}
