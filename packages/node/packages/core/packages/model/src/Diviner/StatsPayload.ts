import { Payload } from '@xyo-network/payload-model'

export type StatsPayload<T extends Payload = Payload> = Payload<T & { count: number }>
