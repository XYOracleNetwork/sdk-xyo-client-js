import { Payload } from '@xyo-network/payload-model'

export type StatsDivinerPayload<T extends Payload = Payload> = Payload<T & { count: number }>
