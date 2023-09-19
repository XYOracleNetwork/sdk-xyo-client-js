import { Payload } from '@xyo-network/payload-model'
import { ValueInstance } from '@xyo-network/value-payload-plugin'

export type PayloadValueTransformer = (payload: Payload) => ValueInstance
