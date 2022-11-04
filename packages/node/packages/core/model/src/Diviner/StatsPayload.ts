import { XyoPayload } from '@xyo-network/payload'

export type StatsPayload<T extends XyoPayload = XyoPayload> = XyoPayload<T & { count: number }>
