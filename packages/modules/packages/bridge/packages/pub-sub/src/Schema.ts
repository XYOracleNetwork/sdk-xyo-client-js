import { asSchema } from '@xyo-network/payload-model'

export const PubSubBridgeSchema = asSchema('network.xyo.bridge.pubsub', true)
export type PubSubBridgeSchema = typeof PubSubBridgeSchema
