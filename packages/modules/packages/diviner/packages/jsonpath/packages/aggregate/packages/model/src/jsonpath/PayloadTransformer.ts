import type { Payload } from '@xyo-network/payload-model'

export type PayloadTransformer = (x: Payload) => Partial<Payload>
