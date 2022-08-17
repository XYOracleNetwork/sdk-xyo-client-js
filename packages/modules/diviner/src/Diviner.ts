import { XyoModule, XyoQueryPayload } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'

export type XyoDivinerQueryPayload<T extends XyoPayload = XyoPayload> = XyoQueryPayload<T>

export type XyoDiviner<Q extends XyoDivinerQueryPayload = XyoDivinerQueryPayload> = XyoModule<Q>
