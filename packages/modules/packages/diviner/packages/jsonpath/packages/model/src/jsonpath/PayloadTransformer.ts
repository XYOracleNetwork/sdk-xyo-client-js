import { Payload } from '@xyo-network/payload-model'

// TODO: Support for multiple return values from a single transformer
// export type PayloadTransformer = (x: Payload) => Partial<Payload> | Partial<Payload>[]
export type PayloadTransformer = (x: Payload) => Partial<Payload>
