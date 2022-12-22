import { XyoPayload } from '@xyo-network/payload-model'

export type StatsPayload<T extends XyoPayload = XyoPayload> = XyoPayload<T & { count: number }>
